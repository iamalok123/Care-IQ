import { Router, Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { matchingEngine } from '../services/matchingEngine';
import { hospitalSearchSchema } from '../schemas/zodSchemas';
import { RoomCategoryCode } from '../types/domain';

const router = Router();

// GET /api/hospitals
router.get('/', (req: Request, res: Response) => {
  const city = req.query.city as string | undefined;
  let hospitals = dataRepository.getHospitals();

  if (city) {
    hospitals = hospitals.filter((h) => h.city.toLowerCase() === city.toLowerCase());
  }

  res.json({
    success: true,
    data: hospitals,
    meta: { total: hospitals.length }
  });
});

// GET /api/hospitals/:id
router.get('/:id', (req: Request, res: Response) => {
  const hospital = dataRepository.getHospitalById(req.params.id as string);
  if (!hospital) {
    return res.status(404).json({
      success: false,
      error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital not found' }
    });
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
});

// POST /api/hospitals/match
router.post('/match', (req: Request, res: Response) => {
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
});

export default router;
