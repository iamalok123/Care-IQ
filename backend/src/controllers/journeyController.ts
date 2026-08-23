import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { supabaseRepository } from '../services/supabaseRepository';
import { isSupabaseConfigured } from '../config/supabase';
import { journeyEngine } from '../services/journeyEngine';
import { getRoomTariff } from '../services/tariffService';
import { RoomCategoryCode } from '../types/domain';
import { journeyEventSchema } from '../schemas/zodSchemas';

export class JourneyController {
  // GET /api/journeys
  public async getJourneys(req: Request, res: Response): Promise<void> {
    const patientId =
      (req.query.patient_id as string | undefined) ||
      req.user?.patient?.id ||
      req.user?.id;
    let journeys = dataRepository.getJourneys();

    if (patientId) {
      journeys = journeys.filter((j) => j.patient_id === patientId);
    }
    if (isSupabaseConfigured) {
      try {
        journeys = await supabaseRepository.fetchJourneys(patientId);
      } catch (err) {
        console.warn('Journey list Supabase fetch failed, using in-memory cache:', err);
      }
    }

    res.json({
      success: true,
      data: journeys,
      meta: { total: journeys.length }
    });
  }

  // GET /api/journeys/:id
  public async getJourneyById(req: Request, res: Response): Promise<void> {
    let journey = dataRepository.getJourneyById(req.params.id as string);
    if (!journey && isSupabaseConfigured) {
      journey = (await supabaseRepository.fetchJourneyById(req.params.id as string)) || undefined;
      if (journey) dataRepository.addJourney(journey);
    }
    if (!journey) {
      res.status(404).json({
        success: false,
        error: { code: 'JOURNEY_NOT_FOUND', message: 'Care journey not found' }
      });
      return;
    }
    if (req.user?.patient && journey.patient_id !== req.user.patient.id) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to view this care journey.' }
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
    const {
      patient_id,
      hospital_id,
      policy_id,
      procedure_id,
      selected_room_category,
      admission_date,
      diagnosis
    } = req.body;

    if (!patient_id || !hospital_id) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'patient_id and hospital_id are required' }
      });
      return;
    }

    if (!dataRepository.getHospitalById(hospital_id)) {
      res.status(404).json({
        success: false,
        error: { code: 'HOSPITAL_NOT_FOUND', message: `No hospital found with id "${hospital_id}".` }
      });
      return;
    }

    if (procedure_id && !dataRepository.procedures.some((p) => p.id === procedure_id)) {
      res.status(404).json({
        success: false,
        error: { code: 'PROCEDURE_NOT_FOUND', message: `No procedure found with id "${procedure_id}".` }
      });
      return;
    }

    // The room's tariff is read from the hospital's own card, never from the
    // request. A client that could name its own tariff could name any number,
    // and the cost engine would then price a room that does not exist.
    const roomTariff =
      selected_room_category
        ? getRoomTariff(hospital_id, selected_room_category as RoomCategoryCode)?.tariff_per_day
        : undefined;

    const journey = journeyEngine.createJourney({
      patientId: patient_id,
      hospitalId: hospital_id,
      policyId: policy_id,
      procedureId: procedure_id,
      selectedRoomCategory: selected_room_category,
      selectedRoomTariff: roomTariff,
      admissionDate: admission_date,
      diagnosis
    });

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
