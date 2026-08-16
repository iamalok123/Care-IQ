import { Router, Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { journeyEngine } from '../services/journeyEngine';
import { journeyEventSchema } from '../schemas/zodSchemas';

const router = Router();

// GET /api/journeys
router.get('/', (req: Request, res: Response) => {
  const patientId = req.query.patient_id as string | undefined;
  let journeys = dataRepository.getJourneys();

  if (patientId) {
    journeys = journeys.filter((j) => j.patient_id === patientId);
  }

  res.json({
    success: true,
    data: journeys,
    meta: { total: journeys.length }
  });
});

// GET /api/journeys/:id
router.get('/:id', (req: Request, res: Response) => {
  const journey = dataRepository.getJourneyById(req.params.id as string);
  if (!journey) {
    return res.status(404).json({
      success: false,
      error: { code: 'JOURNEY_NOT_FOUND', message: 'Care journey not found' }
    });
  }

  const hospital = dataRepository.getHospitalById(journey.hospital_id);
  const policy = journey.policy_id ? dataRepository.getPolicyById(journey.policy_id) : undefined;
  const verificationItems = dataRepository.getVerificationItems(journey.patient_id, journey.id);

  res.json({
    success: true,
    data: {
      ...journey,
      hospital,
      policy,
      verificationItems
    }
  });
});

// POST /api/journeys
router.post('/', (req: Request, res: Response) => {
  const { patient_id, hospital_id, policy_id } = req.body;

  if (!patient_id || !hospital_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'patient_id and hospital_id are required' }
    });
  }

  const journey = journeyEngine.createJourney(patient_id, hospital_id, policy_id);

  res.status(201).json({
    success: true,
    data: journey
  });
});

// POST /api/journeys/:id/events
router.post('/:id/events', (req: Request, res: Response) => {
  const parsed = journeyEventSchema.safeParse({
    ...req.body,
    journey_id: req.params.id
  });

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join(', ') }
    });
  }

  const event = journeyEngine.recordEvent(req.params.id as string, parsed.data);
  if (!event) {
    return res.status(404).json({
      success: false,
      error: { code: 'JOURNEY_NOT_FOUND', message: 'Care journey not found' }
    });
  }

  res.status(201).json({
    success: true,
    data: event
  });
});

export default router;
