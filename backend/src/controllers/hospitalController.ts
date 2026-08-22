import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { matchingEngine } from '../services/matchingEngine';
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

  // GET /api/hospitals/:id
  public getHospitalById(req: Request, res: Response): void {
    const hospital = dataRepository.getHospitalById(req.params.id as string);
    if (!hospital) {
      res.status(404).json({
        success: false,
        error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital not found' }
      });
      return;
    }

    const rooms = dataRepository.getHospitalRooms(hospital.id);
    const specialties = dataRepository.getHospitalSpecialties(hospital.id);
    const services = dataRepository.getHospitalServices(hospital.id);

    res.json({
      success: true,
      data: {
        ...hospital,
        rooms,
        specialties,
        services
      }
    });
  }

  // POST /api/hospitals/match
  public match(req: Request, res: Response): void {
    const { city, policy_id, specialty_code, service_code, preferred_room_category, procedure_id, network_only } = req.body;

    const matches = matchingEngine.matchHospitals({
      city: city || 'Bengaluru',
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
      meta: { totalMatches: matches.length }
    });
  }
}

export const hospitalController = new HospitalController();
