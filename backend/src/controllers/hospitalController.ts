import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { matchingEngine } from '../services/matchingEngine';
import { enrichHospitalForInsurer, getHospitalCoverage } from '../services/enrichmentService';
import { getPublishedRoomTariffs } from '../services/tariffService';
import { RoomCategoryCode } from '../types/domain';

export class HospitalController {
  // GET /api/hospitals
  public async getHospitals(req: Request, res: Response): Promise<void> {
    await dataRepository.ensureDataLoaded();

    const city = req.query.city as string | undefined;
    const citiesParam = req.query.cities as string | undefined;
    const all = req.query.all === 'true';

    let hospitals = dataRepository.getHospitals();

    if (all) {
      // Return all hospitals regardless of city
    } else if (citiesParam) {
      const cityList = citiesParam.split(',').map((c) => c.trim().toLowerCase());
      hospitals = hospitals.filter((h) => cityList.includes(h.city.toLowerCase()));
    } else if (city) {
      if (city.includes(',')) {
        const cityList = city.split(',').map((c) => c.trim().toLowerCase());
        hospitals = hospitals.filter((h) => cityList.includes(h.city.toLowerCase()));
      } else {
        const cLower = city.trim().toLowerCase();
        hospitals = hospitals.filter((h) => {
          const hCity = h.city.toLowerCase();
          if (hCity === cLower) return true;
          if ((cLower === 'bengaluru' || cLower === 'bangalore') && (hCity === 'bengaluru' || hCity === 'bangalore')) return true;
          return hCity.includes(cLower) || cLower.includes(hCity);
        });
      }
    } else {
      // Default to primary supported cities: Mumbai & Bengaluru
      const defaultCities = ['mumbai', 'bengaluru', 'bangalore'];
      hospitals = hospitals.filter((h) => defaultCities.includes(h.city.toLowerCase()));
    }

    res.json({
      success: true,
      data: hospitals,
      meta: { total: hospitals.length }
    });
  }

  /**
   * GET /api/hospitals/procedures
   */
  public async getProcedures(_req: Request, res: Response): Promise<void> {
    await dataRepository.ensureDataLoaded();
    const procedures = dataRepository.getProcedures();
    res.json({
      success: true,
      data: procedures,
      meta: { total: procedures.length }
    });
  }

  // GET /api/hospitals/:id?insurer_id=...
  public async getHospitalById(req: Request, res: Response): Promise<void> {
    await dataRepository.ensureDataLoaded();
    const hospital = dataRepository.getHospitalById(req.params.id as string);
    if (!hospital) {
      res.status(404).json({
        success: false,
        error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital not found' }
      });
      return;
    }

    const specialties = dataRepository.getHospitalSpecialties(hospital.id);
    const services = dataRepository.getHospitalServices(hospital.id);
    const rooms = getPublishedRoomTariffs(hospital.id);

    const insurerId = req.query.insurer_id as string | undefined;
    const enriched = insurerId ? enrichHospitalForInsurer(hospital, insurerId) : hospital;
    const coverage = insurerId ? getHospitalCoverage(hospital.id, insurerId) : undefined;

    res.json({
      success: true,
      data: {
        ...enriched,
        rooms,
        specialties,
        services,
        procedures: dataRepository.getProceduresAtHospital(hospital.id),
        ...(coverage ? { coverage } : {})
      }
    });
  }

  // POST /api/hospitals/match
  public async match(req: Request, res: Response): Promise<void> {
    await dataRepository.ensureDataLoaded();

    const {
      city,
      policy_id,
      specialty_code,
      service_code,
      preferred_room_category,
      procedure_id,
      network_only
    } = req.body || {};

    const targetCity = typeof city === 'string' && city.trim() ? city.trim() : 'Bengaluru';

    const matches = matchingEngine.matchHospitals({
      city: targetCity,
      policyId: policy_id,
      specialtyCode: specialty_code,
      serviceCode: service_code,
      preferredRoomCategory: preferred_room_category as RoomCategoryCode,
      procedureId: procedure_id,
      networkOnly: network_only
    });

    res.json({
      success: true,
      data: matches,
      meta: { totalMatches: matches.length, city: targetCity }
    });
  }
}

export const hospitalController = new HospitalController();
