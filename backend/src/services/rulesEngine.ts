import {
  InsurancePolicy,
  RoomCategoryCode,
  NetworkStatus,
  HospitalNetwork,
  HospitalRoom
} from '../types/domain';

export const ROOM_RANK_MAP: Record<RoomCategoryCode, number> = {
  [RoomCategoryCode.GENERAL]: 1,
  [RoomCategoryCode.SEMI_PRIVATE]: 2,
  [RoomCategoryCode.PRIVATE_AC]: 3,
  [RoomCategoryCode.DELUXE]: 4,
  [RoomCategoryCode.SUITE]: 5,
  [RoomCategoryCode.ANY_ROOM]: 99
};

export interface RoomEvaluationResult {
  isCompatible: boolean;
  policyAllowedCategory: RoomCategoryCode;
  selectedCategory: RoomCategoryCode;
  proportionatePenaltyRatio: number; // 1.0 means no penalty; < 1.0 means proportional deduction
  warningMessage?: string;
}

export interface NetworkEvaluationResult {
  networkStatus: NetworkStatus;
  cashlessSupported: boolean;
  preauthRequired: boolean;
  guidanceMessage: string;
}

export class RulesEngine {
  /**
   * Evaluates if selected room category complies with policy limits,
   * and calculates proportionate deduction ratio if entitlement is exceeded.
   */
  public evaluateRoomCategory(
    policy: InsurancePolicy | undefined,
    selectedCategoryCode: RoomCategoryCode,
    eligibleRoomTariff: number,
    selectedRoomTariff: number
  ): RoomEvaluationResult {
    const policyRoom = policy?.room_eligibility || RoomCategoryCode.PRIVATE_AC;
    const policyRank = ROOM_RANK_MAP[policyRoom] || 3;
    const selectedRank = ROOM_RANK_MAP[selectedCategoryCode] || 3;

    if (!policy || policyRoom === RoomCategoryCode.ANY_ROOM || selectedRank <= policyRank) {
      return {
        isCompatible: true,
        policyAllowedCategory: policyRoom,
        selectedCategory: selectedCategoryCode,
        proportionatePenaltyRatio: 1.0
      };
    }

    // Entitlement exceeded: calculate proportionate penalty ratio
    const penaltyRatio = selectedRoomTariff > 0 ? Math.min(1.0, eligibleRoomTariff / selectedRoomTariff) : 1.0;

    return {
      isCompatible: false,
      policyAllowedCategory: policy.room_eligibility,
      selectedCategory: selectedCategoryCode,
      proportionatePenaltyRatio: penaltyRatio,
      warningMessage: `Selected room (${selectedCategoryCode}) exceeds policy eligibility (${policy.room_eligibility}). Proportionate deduction of ~${Math.round((1 - penaltyRatio) * 100)}% may apply to doctor fee and surgical charges.`
    };
  }

  /**
   * Evaluates hospital network relationship against policy insurer.
   */
  public evaluateNetworkStatus(network?: HospitalNetwork): NetworkEvaluationResult {
    if (!network || network.network_status === NetworkStatus.UNKNOWN) {
      return {
        networkStatus: NetworkStatus.UNKNOWN,
        cashlessSupported: false,
        preauthRequired: true,
        guidanceMessage: 'Network status is not confirmed in available records. Verify cashless empanelment directly with hospital desk.'
      };
    }

    if (network.network_status === NetworkStatus.IN_NETWORK) {
      return {
        networkStatus: NetworkStatus.IN_NETWORK,
        cashlessSupported: network.cashless_status,
        preauthRequired: network.preauth_required,
        guidanceMessage: network.cashless_status
          ? 'In-Network hospital with Cashless processing supported (subject to insurer preauthorization).'
          : 'In-Network facility; reimbursement claim required post-discharge.'
      };
    }

    return {
      networkStatus: NetworkStatus.OUT_OF_NETWORK,
      cashlessSupported: false,
      preauthRequired: false,
      guidanceMessage: 'Out-of-Network hospital. Cashless treatment is unavailable. Patient must pay upfront and file reimbursement.'
    };
  }
}

export const rulesEngine = new RulesEngine();
