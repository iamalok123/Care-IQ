import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { matchingEngine } from '../services/matchingEngine';
import { enrichHospitalForInsurer, getHospitalCoverage } from '../services/enrichmentService';
import { getPublishedRoomTariffs } from '../services/tariffService';
import { RoomCategoryCode } from '../types/domain';

export class HospitalController {
  // GET /api/hospitals
  public getHospitals(req: Request, res: Response): void {
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
        hospitals = hospitals.filter((h) => h.city.toLowerCase() === city.toLowerCase());
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
   *
   * Must stay registered before GET /:id or 'procedures' is read as a hospital
   * id. Exists so the frontend can offer the procedures we actually hold prices
   * for, instead of hardcoding 'proc-knee-replacement' into every cost call.
   */
  public getProcedures(_req: Request, res: Response): void {
    const procedures = dataRepository.getProcedures();
    res.json({
      success: true,
      data: procedures,
      meta: { total: procedures.length }
    });
  }

  // GET /api/hospitals/:id?insurer_id=...
  public getHospitalById(req: Request, res: Response): void {
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
    // The hospital's own tariff card, cheapest room first. `rooms` used to be
    // raw hospital_rooms rows with a room_category_id the client had to resolve
    // itself; this shape carries the category code and name already joined.
    const rooms = getPublishedRoomTariffs(hospital.id);

    // Network status is a fact about a hospital *and an insurer*, never about a
    // hospital alone. Without insurer_id we return the hospital's own columns
    // and no coverage block, rather than a coverage block that means nothing.
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
        // Only the procedures this hospital has published a price for, so a
        // caller picking from this list gets a real price rather than a
        // modelled national band.
        procedures: dataRepository.getProceduresAtHospital(hospital.id),
        ...(coverage ? { coverage } : {})
      }
    });
  }

  // POST /api/hospitals/match
  public match(req: Request, res: Response): void {
    const {
      city,
      policy_id,
      specialty_code,
      service_code,
      preferred_room_category,
      procedure_id,
      network_only
    } = req.body || {};

    // No default city. Defaulting to Bengaluru showed Bengaluru hospitals to a
    // Mumbai patient whose caller had simply forgotten to pass the field.
    if (!city || typeof city !== 'string' || !city.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CITY_REQUIRED',
          message: 'A city is required to match hospitals. Pass the patient\'s city.'
        }
      });
      return;
    }

    const matches = matchingEngine.matchHospitals({
      city: city.trim(),
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
      meta: { totalMatches: matches.length, city: city.trim() }
    });
  }
}

export const hospitalController = new HospitalController();
