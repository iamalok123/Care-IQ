import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { journeyEngine } from '../services/journeyEngine';
import { journeyEventSchema } from '../schemas/zodSchemas';

export class JourneyController {
  // GET /api/journeys
  public getJourneys(req: Request, res: Response): void {
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
  }

  // GET /api/journeys/:id
  public getJourneyById(req: Request, res: Response): void {
    const journey = dataRepository.getJourneyById(req.params.id as string);
    if (!journey) {
      res.status(404).json({
        success: false,
        error: { code: 'JOURNEY_NOT_FOUND', message: 'Care journey not found' }
      });
      return;
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
  }

  // POST /api/journeys
  public createJourney(req: Request, res: Response): void {
    const { patient_id, hospital_id, policy_id } = req.body;

    if (!patient_id || !hospital_id) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'patient_id and hospital_id are required' }
      });
      return;
    }

    const journey = journeyEngine.createJourney(patient_id, hospital_id, policy_id);

    res.status(201).json({
      success: true,
      data: journey
    });
  }

  // POST /api/journeys/:id/events
  public recordEvent(req: Request, res: Response): void {
    const parsed = journeyEventSchema.safeParse({
      ...req.body,
      journey_id: req.params.id
    });

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join(', ') }
      });
      return;
    }

    const event = journeyEngine.recordEvent(req.params.id as string, parsed.data);
    if (!event) {
      res.status(404).json({
        success: false,
        error: { code: 'JOURNEY_NOT_FOUND', message: 'Care journey not found' }
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: event
    });
  }
}

export const journeyController = new JourneyController();
