import {
  CareJourney,
  JourneyEvent,
  JourneyStage,
  JourneyStatus,
  EventStatus,
  VerificationItem,
  VerificationCategory,
  PriorityLevel,
  VerificationItemStatus
} from '../types/domain';
import { dataRepository } from './dataRepository';

export class JourneyEngine {
  public createJourney(patientId: string, hospitalId: string, policyId?: string): CareJourney & { events: JourneyEvent[] } {
    const journeyId = `jrn-${Date.now()}`;
    const initialJourney: CareJourney & { events: JourneyEvent[] } = {
      id: journeyId,
      patient_id: patientId,
      hospital_id: hospitalId,
      policy_id: policyId,
      current_stage: JourneyStage.ADMISSION,
      journey_status: JourneyStatus.ACTIVE,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      events: [
        {
          id: `evt-${Date.now()}-adm`,
          journey_id: journeyId,
          stage: JourneyStage.ADMISSION,
          event_type: 'ADMISSION_REGISTERED',
          title: 'Hospital Admission Registered',
          description: 'Care journey initialized at hospital admission desk.',
          status: EventStatus.COMPLETED,
          occurred_at: new Date().toISOString(),
          insurance_relevance: 'Initial preauthorization checklist and insurance verification initiated.',
          requires_verification: true,
          created_at: new Date().toISOString()
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
      created_at: new Date().toISOString()
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
