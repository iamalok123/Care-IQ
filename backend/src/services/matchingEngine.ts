import {
  Hospital,
  InsurancePolicy,
  RoomCategoryCode,
  NetworkStatus,
  HospitalMatchResult
} from '../types/domain';
import { dataRepository } from './dataRepository';
import { rulesEngine, ROOM_RANK_MAP } from './rulesEngine';
import { costEngine } from './costEngine';

export interface HospitalMatchParams {
  city: string;
  policyId?: string;
  specialtyCode?: string;
  serviceCode?: string;
  preferredRoomCategory?: RoomCategoryCode;
  procedureId?: string;
  networkOnly?: boolean;
}

export class MatchingEngine {
  public matchHospitals(params: HospitalMatchParams): HospitalMatchResult[] {
    const allHospitals = dataRepository.getHospitals();
    const policy = params.policyId ? dataRepository.getPolicyById(params.policyId) : undefined;
    const preferredRoom = params.preferredRoomCategory || (policy ? policy.room_eligibility : RoomCategoryCode.PRIVATE_AC);

    // 1. City Filter with Bangalore/Bengaluru normalization
    const targetCity = (params.city || '').toLowerCase().trim();
    let candidates = allHospitals.filter((h) => {
      if (!targetCity) return true;
      const hCity = (h.city || '').toLowerCase().trim();
      if (hCity === targetCity) return true;
      if ((targetCity === 'bengaluru' || targetCity === 'bangalore') && (hCity === 'bengaluru' || hCity === 'bangalore')) return true;
      if ((targetCity === 'mumbai' || targetCity === 'bombay') && (hCity === 'mumbai' || hCity === 'bombay')) return true;
      return hCity.includes(targetCity) || targetCity.includes(hCity);
    });

    // If no exact city match found in dataset, fallback to all hospitals rather than returning 0
    if (candidates.length === 0) {
      candidates = allHospitals;
    }

    // 2. Specialty & Service Filters
    if (params.specialtyCode) {
      const specFilter = params.specialtyCode.toLowerCase().trim();
      const specCandidates = candidates.filter((h) => {
        const specs = dataRepository.getHospitalSpecialties(h.id);
        if (specs.length === 0) return true; // Multispecialty default
        return specs.some((s) => s.code.toLowerCase() === specFilter || s.id?.toLowerCase().includes(specFilter) || s.name?.toLowerCase().includes(specFilter));
      });
      if (specCandidates.length > 0) {
        candidates = specCandidates;
      }
    }

    if (params.serviceCode) {
      const srvFilter = params.serviceCode.toLowerCase().trim();
      const srvCandidates = candidates.filter((h) => {
        const srvs = dataRepository.getHospitalServices(h.id);
        if (srvs.length === 0) return true;
        return srvs.some((s) => s.code.toLowerCase() === srvFilter || s.id?.toLowerCase().includes(srvFilter) || s.name?.toLowerCase().includes(srvFilter));
      });
      if (srvCandidates.length > 0) {
        candidates = srvCandidates;
      }
    }

    const results: HospitalMatchResult[] = candidates.map((hospital) => {
      const reasons: string[] = [];
      const verificationItems: string[] = [];
      let score = 0;

      // A. Network Evaluation
      const network = policy
        ? dataRepository.getNetworkRelationship(hospital.id, policy.insurer_id)
        : undefined;
      const netEval = rulesEngine.evaluateNetworkStatus(network);

      if (netEval.networkStatus === NetworkStatus.IN_NETWORK) {
        if (netEval.cashlessSupported) {
          score += 40;
          reasons.push('✓ In-Network hospital with Cashless facility confirmed');
        } else {
          score += 30;
          reasons.push('✓ In-Network hospital (Reimbursement processing)');
        }
      } else if (netEval.networkStatus === NetworkStatus.UNKNOWN) {
        score += 15;
        reasons.push('⚠ Network status is unconfirmed in reference records');
        verificationItems.push('Verify network empanelment with hospital insurance coordinator.');
      } else {
        score += 0;
        reasons.push('⚠ Out-of-Network facility; upfront payment required');
        verificationItems.push('Confirm reimbursement claim guidelines and hospital tariff sheet.');
      }

      // B. Room Category Evaluation
      const hospitalRooms = dataRepository.getHospitalRooms(hospital.id);
      const roomCategories = dataRepository.roomCategories;

      const selectedRoomCat = roomCategories.find((rc) => rc.code === preferredRoom);
      const selectedRoom = hospitalRooms.find((hr) => hr.room_category_id === selectedRoomCat?.id);
      const selectedTariff = selectedRoom ? selectedRoom.tariff_per_day : 6500;

      let roomCategoryMatch = true;
      if (policy) {
        const policyRoomCat = roomCategories.find((rc) => rc.code === policy.room_eligibility);
        const policyRoom = hospitalRooms.find((hr) => hr.room_category_id === policyRoomCat?.id);
        const eligibleTariff = policyRoom ? policyRoom.tariff_per_day : 6500;

        const roomEval = rulesEngine.evaluateRoomCategory(
          policy,
          preferredRoom,
          eligibleTariff,
          selectedTariff
        );

        roomCategoryMatch = roomEval.isCompatible;

        if (roomEval.isCompatible) {
          score += 25;
          reasons.push(`✓ Room (${preferredRoom}) aligns with policy entitlement`);
        } else {
          score += 5;
          reasons.push(`⚠ Room (${preferredRoom}) exceeds policy limit (${policy.room_eligibility})`);
          verificationItems.push(`Verify proportionate deduction exposure if opting for ${preferredRoom}.`);
        }
      } else {
        score += 20;
        reasons.push(`Selected room category: ${preferredRoom}`);
      }

      // C. Service and Specialty checks
      const specs = dataRepository.getHospitalSpecialties(hospital.id);
      const srvs = dataRepository.getHospitalServices(hospital.id);

      if (specs.length > 0) {
        score += 10;
        reasons.push(`✓ Multi-specialty clinical departments (${specs.length} listed)`);
      }
      if (srvs.some((s) => s.code === 'ICU' || s.code === 'EMERGENCY')) {
        score += 10;
        reasons.push('✓ 24x7 Critical Care & ICU available');
      }

      // D. Procedure Cost & Financial Exposure
      let estTotalCost = 0;
      let estExposure = 0;

      const procedureId = params.procedureId || 'proc-knee-replacement';
      const procCost = dataRepository.getProcedureCost(hospital.id, procedureId);

      if (procCost) {
        estTotalCost = procCost.typical_cost;
        if (policy) {
          const components = dataRepository.getCostComponents(procCost.id);
          const costEval = costEngine.calculateEstimate(
            policy,
            procCost,
            components,
            preferredRoom,
            6500,
            selectedTariff
          );
          estExposure = costEval.indicativePatientExposure;

          const remainingCover = policy.remaining_sum_insured ?? policy.sum_insured;
          if (estTotalCost <= remainingCover) {
            score += 15;
            reasons.push(`✓ Estimated cost within remaining sum insured (₹${(remainingCover / 100000).toFixed(1)}L)`);
          } else {
            score += 5;
            reasons.push(`⚠ Estimated cost exceeds remaining sum insured`);
            verificationItems.push('Review out-of-pocket financial gap before admission.');
          }
        } else {
          estExposure = estTotalCost;
        }
      } else {
        estTotalCost = 150000;
        estExposure = estTotalCost;
        reasons.push('⚠ Indicative procedure cost not declared; standard estimate shown');
      }

      if (netEval.preauthRequired) {
        verificationItems.push('Submit preauthorization form at least 48 hours prior to planned admission.');
      }

      return {
        hospital,
        matchScore: Math.min(100, Math.max(0, score)),
        networkStatus: netEval.networkStatus,
        cashlessSupported: netEval.cashlessSupported,
        roomCategoryMatch,
        roomTariff: selectedTariff,
        estimatedTotalCost: estTotalCost,
        estimatedPatientExposure: estExposure,
        reasons,
        verificationItems
      };
    });

    // Sort by Match Score descending
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export const matchingEngine = new MatchingEngine();
