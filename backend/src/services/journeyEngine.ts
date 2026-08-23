import {
  CareJourney,
  JourneyEvent,
  JourneyStage,
  JourneyStatus,
  EventStatus,
  RoomCategoryCode,
  VerificationItem,
  VerificationCategory,
  PriorityLevel,
  VerificationItemStatus
} from '../types/domain';
import { dataRepository } from './dataRepository';

export interface CreateJourneyInput {
  patientId: string;
  hospitalId: string;
  policyId?: string;
  /**
   * Clinical context. Every one of these was previously dropped on the floor:
   * the controller read procedure_id, selected_room_category, admission_date and
   * diagnosis off the request and then called a three-argument function, so a
   * journey started from the hospital matcher arrived with no procedure — and
   * the cost view, which prices from journey.procedure_id, had nothing to work
   * with and fell back to a hardcoded knee replacement.
   */
  procedureId?: string;
  selectedRoomCategory?: RoomCategoryCode;
  selectedRoomTariff?: number;
  admissionDate?: string;
  diagnosis?: string;
}

export class JourneyEngine {
  public createJourney(input: CreateJourneyInput): CareJourney & { events: JourneyEvent[] } {
    const { patientId, hospitalId, policyId } = input;
    const journeyId = `jrn-${Date.now()}`;
    const now = new Date().toISOString();
    const initialJourney: CareJourney & { events: JourneyEvent[] } = {
      id: journeyId,
      patient_id: patientId,
      hospital_id: hospitalId,
      policy_id: policyId,
      current_stage: JourneyStage.ADMISSION,
      journey_status: JourneyStatus.ACTIVE,
      started_at: now,
      updated_at: now,
      procedure_id: input.procedureId,
      selected_room_category: input.selectedRoomCategory,
      selected_room_tariff: input.selectedRoomTariff,
      admission_date: input.admissionDate,
      diagnosis: input.diagnosis,
      events: [
        {
          id: `evt-${Date.now()}-adm`,
          journey_id: journeyId,
          stage: JourneyStage.ADMISSION,
          event_type: 'ADMISSION_REGISTERED',
          title: 'Hospital Admission Registered',
          description: 'Care journey initialized at hospital admission desk.',
          status: EventStatus.COMPLETED,
          occurred_at: now,
          insurance_relevance: 'Initial preauthorization checklist and insurance verification initiated.',
          requires_verification: true,
          created_at: now
        }
      ]
    };

    dataRepository.addJourney(initialJourney);

    // Create initial verification items
    dataRepository.addVerificationItem({
      id: `ver-${Date.now()}-adm-desk`,
      patient_id: patientId,
      journey_id: journeyId,
      category: VerificationCategory.PREAUTH,
      title: 'Confirm Cashless Pre-Auth with TPA Desk',
      question: 'Has the hospital TPA desk submitted the preauthorization form with the treating doctor diagnosis?',
      reason: 'Planned admissions require initial approval to activate cashless benefits.',
      priority: PriorityLevel.HIGH,
      status: VerificationItemStatus.PENDING,
      created_at: now
    });

    return initialJourney;
  }

  public recordEvent(journeyId: string, eventData: Omit<JourneyEvent, 'id' | 'journey_id' | 'created_at'>): JourneyEvent | undefined {
    const journey = dataRepository.getJourneyById(journeyId);
    if (!journey) return undefined;

    const eventId = `evt-${Date.now()}`;
    const newEvent: JourneyEvent = {
      ...eventData,
      id: eventId,
      journey_id: journeyId,
      created_at: new Date().toISOString()
    };

    dataRepository.addJourneyEvent(journeyId, newEvent);

    // Trigger policy-aware verification item generation based on event type
    this.generateContextualVerificationItems(journey, newEvent);

    return newEvent;
  }

  private generateContextualVerificationItems(journey: CareJourney, event: JourneyEvent): void {
    const now = new Date().toISOString();

    if (event.event_type.includes('ROOM') || event.stage === JourneyStage.ADMISSION) {
      if (event.title.toLowerCase().includes('deluxe') || event.description.toLowerCase().includes('upgrade')) {
        dataRepository.addVerificationItem({
          id: `ver-${Date.now()}-room-cap`,
          patient_id: journey.patient_id,
          journey_id: journey.id,
          category: VerificationCategory.ROOM,
          title: 'Room Category Upgrade Alert',
          question: 'Are you aware of the proportionate deduction risk for upgrading to Deluxe room?',
          reason: 'Policy rules enforce proportionate deductions across associated medical charges when room entitlement is exceeded.',
          priority: PriorityLevel.HIGH,
          status: VerificationItemStatus.PENDING,
          created_at: now
        });
      }
    }

    if (event.stage === JourneyStage.PROCEDURE) {
      dataRepository.addVerificationItem({
        id: `ver-${Date.now()}-ot-consumables`,
        patient_id: journey.patient_id,
        journey_id: journey.id,
        category: VerificationCategory.COST,
        title: 'Request Itemized Consumable Estimate',
        question: 'Ask the billing department for an advance estimate of non-payable surgical kits & implants.',
        reason: 'IRDAI non-payable consumables are excluded from cashless claims and must be paid out-of-pocket.',
        priority: PriorityLevel.MEDIUM,
        status: VerificationItemStatus.PENDING,
        created_at: now
      });
    }

    if (event.stage === JourneyStage.DISCHARGE) {
      dataRepository.addVerificationItem({
        id: `ver-${Date.now()}-discharge-summary`,
        patient_id: journey.patient_id,
        journey_id: journey.id,
        category: VerificationCategory.DOCUMENT,
        title: 'Collect Original Discharge Summary & Pharmacy Invoices',
        question: 'Have you collected signed discharge summary, lab reports, and original pharmacy bills?',
        reason: 'Required for post-hospitalization reimbursement claims (valid up to 60-180 days).',
        priority: PriorityLevel.HIGH,
        status: VerificationItemStatus.PENDING,
        created_at: now
      });
    }
  }
}

export const journeyEngine = new JourneyEngine();
