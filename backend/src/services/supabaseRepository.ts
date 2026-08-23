import { supabase, supabaseAdmin } from '../config/supabase';
import {
  Hospital,
  HospitalRoom,
  HospitalSpecialty,
  HospitalService,
  Specialty,
  Service,
  RoomCategory,
  Procedure,
  ProcedureCost,
  CostComponent,
  HospitalNetwork,
  Insurer,
  InsurancePolicy,
  PolicyRule,
  PolicyExclusion,
  Patient,
  CareJourney,
  JourneyEvent,
  VerificationItem,
  Document,
  DocumentExtraction,
  ExtractionEvidence
} from '../types/domain';

export class SupabaseRepository {
  // ==========================================
  // Master Reference Data
  // ==========================================

  public async fetchRoomCategories(): Promise<RoomCategory[]> {
    const { data, error } = await supabase
      .from('room_categories')
      .select('*')
      .order('rank', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  public async fetchSpecialties(): Promise<Specialty[]> {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  public async fetchServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  public async fetchInsurers(): Promise<Insurer[]> {
    const { data, error } = await supabase
      .from('insurers')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  public async fetchHospitals(): Promise<Hospital[]> {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  public async fetchHospitalSpecialties(): Promise<HospitalSpecialty[]> {
    const { data, error } = await supabase
      .from('hospital_specialties')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  public async fetchHospitalServices(): Promise<HospitalService[]> {
    const { data, error } = await supabase
      .from('hospital_services')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  public async fetchHospitalRooms(): Promise<HospitalRoom[]> {
    const { data, error } = await supabase
      .from('hospital_rooms')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  public async fetchHospitalNetworks(): Promise<HospitalNetwork[]> {
    const { data, error } = await supabase
      .from('hospital_networks')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  public async fetchProcedures(): Promise<Procedure[]> {
    const { data, error } = await supabase
      .from('procedures')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  public async fetchProcedureCosts(): Promise<ProcedureCost[]> {
    const { data, error } = await supabase
      .from('procedure_costs')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  public async fetchCostComponents(): Promise<CostComponent[]> {
    const { data, error } = await supabase
      .from('cost_components')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // Patients
  // ==========================================

  public async fetchPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  public async fetchPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  public async fetchPatientByAuthUserId(authUserId: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  public async fetchPatientByEmail(email: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  public async insertPatient(patient: Patient): Promise<Patient> {
    const { data, error } = await supabaseAdmin
      .from('patients')
      .upsert(patient, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  public async updatePatient(id: string, updateData: Partial<Patient>): Promise<Patient | null> {
    const { data, error } = await supabaseAdmin
      .from('patients')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  public async deletePatient(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('patients')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  public async fetchDemoProfiles(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('account_type', 'DEMO')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // Insurance Policies & Rules
  // ==========================================

  public async fetchPolicies(patientId?: string): Promise<InsurancePolicy[]> {
    let query = supabase.from('insurance_policies').select('*');
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  public async fetchPolicyById(id: string): Promise<InsurancePolicy | null> {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  public async insertPolicy(policy: InsurancePolicy): Promise<InsurancePolicy> {
    const { data, error } = await supabaseAdmin
      .from('insurance_policies')
      .upsert(policy, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  public async updatePolicy(id: string, updateData: Partial<InsurancePolicy>): Promise<InsurancePolicy | null> {
    const { data, error } = await supabaseAdmin
      .from('insurance_policies')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  public async deletePolicy(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('insurance_policies')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  public async fetchPolicyRules(policyId?: string): Promise<PolicyRule[]> {
    let query = supabase.from('policy_rules').select('*');
    if (policyId) {
      query = query.eq('policy_id', policyId);
    }
    const { data, error } = await query.order('priority', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  public async insertPolicyRules(rules: PolicyRule[]): Promise<PolicyRule[]> {
    if (!rules.length) return [];
    const { data, error } = await supabaseAdmin
      .from('policy_rules')
      .upsert(rules, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return data || [];
  }

  public async fetchPolicyExclusions(policyId?: string): Promise<PolicyExclusion[]> {
    let query = supabase.from('policy_exclusions').select('*');
    if (policyId) {
      query = query.eq('policy_id', policyId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  public async insertPolicyExclusions(exclusions: PolicyExclusion[]): Promise<PolicyExclusion[]> {
    if (!exclusions.length) return [];
    const { data, error } = await supabaseAdmin
      .from('policy_exclusions')
      .upsert(exclusions, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // Care Journeys & Events
  // ==========================================

  public async fetchJourneys(patientId?: string): Promise<(CareJourney & { events: JourneyEvent[] })[]> {
    let query = supabase
      .from('care_journeys')
      .select('*, events:journey_events(*)');

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query.order('started_at', { ascending: false });
    if (error) throw error;
    return (data as any) || [];
  }

  public async fetchJourneyById(id: string): Promise<(CareJourney & { events: JourneyEvent[] }) | null> {
    const { data, error } = await supabase
      .from('care_journeys')
      .select('*, events:journey_events(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as any;
  }

  public async insertJourney(journey: CareJourney & { events?: JourneyEvent[] }): Promise<CareJourney> {
    const { events, ...journeyPayload } = journey;
    const { data, error } = await supabaseAdmin
      .from('care_journeys')
      .upsert(journeyPayload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;

    if (events && events.length > 0) {
      await supabaseAdmin.from('journey_events').upsert(events, { onConflict: 'id' });
    }

    return data;
  }

  public async insertJourneyEvent(journeyId: string, event: JourneyEvent): Promise<JourneyEvent> {
    const { data, error } = await supabaseAdmin
      .from('journey_events')
      .upsert({ ...event, journey_id: journeyId }, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;

    // Update journey current_stage
    await supabaseAdmin
      .from('care_journeys')
      .update({ current_stage: event.stage, updated_at: new Date().toISOString() })
      .eq('id', journeyId);

    return data;
  }

  // ==========================================
  // Verification Items
  // ==========================================

  public async fetchVerificationItems(patientId?: string, journeyId?: string): Promise<VerificationItem[]> {
    let query = supabase.from('verification_items').select('*');
    if (patientId) query = query.eq('patient_id', patientId);
    if (journeyId) query = query.eq('journey_id', journeyId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  public async insertVerificationItem(item: VerificationItem): Promise<VerificationItem> {
    const { data, error } = await supabaseAdmin
      .from('verification_items')
      .upsert(item, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  public async resolveVerificationItem(id: string): Promise<VerificationItem | null> {
    const { data, error } = await supabaseAdmin
      .from('verification_items')
      .update({
        status: 'RESOLVED',
        resolved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  // ==========================================
  // Documents & Extractions
  // ==========================================

  public async fetchDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  public async fetchDocumentById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  public async insertDocument(doc: Document): Promise<Document> {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .upsert(doc, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  public async updateDocumentExtractionStatus(
    id: string,
    status: 'PENDING' | 'EXTRACTED' | 'FAILED' | 'CONFIRMED'
  ): Promise<Document | null> {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({ extraction_status: status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  public async insertExtraction(extraction: DocumentExtraction): Promise<DocumentExtraction> {
    const { evidences, ...extractionPayload } = extraction;
    const { data, error } = await supabaseAdmin
      .from('document_extractions')
      .upsert(extractionPayload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;

    if (evidences && evidences.length > 0) {
      await this.insertExtractionEvidences(evidences);
    }
    return data;
  }

  public async fetchExtractionByDocumentId(documentId: string): Promise<DocumentExtraction | null> {
    const { data, error } = await supabase
      .from('document_extractions')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  public async insertExtractionEvidences(evidences: ExtractionEvidence[]): Promise<ExtractionEvidence[]> {
    if (!evidences.length) return [];
    const { data, error } = await supabaseAdmin
      .from('extraction_evidences')
      .upsert(evidences, { onConflict: 'id' })
      .select();
    if (error) throw error;
    return data || [];
  }

  public async fetchEvidenceByExtractionId(extractionId: string): Promise<ExtractionEvidence[]> {
    const { data, error } = await supabase
      .from('extraction_evidences')
      .select('*')
      .eq('extraction_id', extractionId);
    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // Scenarios
  // ==========================================

  public async fetchScenarios(): Promise<any[]> {
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return (data || []).map((s) => s.raw_json || s);
  }

  public async fetchScenarioById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data?.raw_json || data || null;
  }

  public async insertScenario(scenario: any): Promise<any> {
    const payload = {
      id: scenario.id,
      name: scenario.name || scenario.id,
      patient_id: scenario.patientId || null,
      hospital_id: scenario.hospitalId || null,
      policy_id: scenario.policyId || null,
      procedure_id: scenario.procedureId || null,
      room_category: scenario.roomCategory || null,
      raw_json: scenario
    };
    const { data, error } = await supabase
      .from('scenarios')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export const supabaseRepository = new SupabaseRepository();
