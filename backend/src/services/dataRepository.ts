import fs from 'fs';
import path from 'path';
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
import { supabaseRepository } from './supabaseRepository';
import { isSupabaseConfigured, checkSupabaseConnection } from '../config/supabase';

function resolveDataDir(): string {
  const candidate1 = path.resolve(__dirname, '../../../../data');
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.resolve(__dirname, '../../../data');
  if (fs.existsSync(candidate2)) return candidate2;
  const candidate3 = path.resolve(__dirname, '../../data');
  if (fs.existsSync(candidate3)) return candidate3;
  return path.resolve(process.cwd(), 'data');
}

export class DataRepository {
  private baseDataDir: string;
  private cleanedDir: string;
  private isDatabaseSynced: boolean = false;

  public hospitals: Hospital[] = [];
  public hospitalRooms: HospitalRoom[] = [];
  public hospitalSpecialties: HospitalSpecialty[] = [];
  public hospitalServices: HospitalService[] = [];
  public specialties: Specialty[] = [];
  public services: Service[] = [];
  public roomCategories: RoomCategory[] = [];
  public procedures: Procedure[] = [];
  public procedureCosts: ProcedureCost[] = [];
  public costComponents: CostComponent[] = [];
  public hospitalNetworks: HospitalNetwork[] = [];
  public insurers: Insurer[] = [];
  public policies: InsurancePolicy[] = [];
  public policyRules: PolicyRule[] = [];
  public policyExclusions: PolicyExclusion[] = [];
  public patients: Patient[] = [];
  public journeys: (CareJourney & { events: JourneyEvent[] })[] = [];
  public verificationItems: VerificationItem[] = [];
  public documents: Document[] = [];
  public extractions: DocumentExtraction[] = [];
  public extractionEvidence: ExtractionEvidence[] = [];

  constructor() {
    this.baseDataDir = resolveDataDir();
    this.cleanedDir = path.join(this.baseDataDir, 'cleaned');

    // Synchronously load local baseline reference datasets
    this.loadAllData();
  }

  private readJsonFile<T>(filePath: string, fallback: T): T {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as T;
      }
    } catch (err) {
      console.error(`Failed to read ${filePath}:`, err);
    }
    return fallback;
  }

  /**
   * Loads baseline reference master data from cleaned JSON files.
   * Runtime patient, policy, and journey data is strictly loaded from Supabase PostgreSQL.
   */
  public loadAllData(): void {
    // Load Master Cleaned Reference Data
    this.hospitals = this.readJsonFile<Hospital[]>(path.join(this.cleanedDir, 'hospitals.json'), []);
    this.hospitalRooms = this.readJsonFile<HospitalRoom[]>(path.join(this.cleanedDir, 'hospital_rooms.json'), []);
    this.hospitalSpecialties = this.readJsonFile<HospitalSpecialty[]>(path.join(this.cleanedDir, 'hospital_specialties.json'), []);
    this.hospitalServices = this.readJsonFile<HospitalService[]>(path.join(this.cleanedDir, 'hospital_services.json'), []);
    this.specialties = this.readJsonFile<Specialty[]>(path.join(this.cleanedDir, 'specialties.json'), []);
    this.services = this.readJsonFile<Service[]>(path.join(this.cleanedDir, 'services.json'), []);
    this.roomCategories = this.readJsonFile<RoomCategory[]>(path.join(this.cleanedDir, 'room_categories.json'), []);
    this.procedures = this.readJsonFile<Procedure[]>(path.join(this.cleanedDir, 'procedures.json'), []);
    this.procedureCosts = this.readJsonFile<ProcedureCost[]>(path.join(this.cleanedDir, 'procedure_costs.json'), []);
    this.costComponents = this.readJsonFile<CostComponent[]>(path.join(this.cleanedDir, 'cost_components.json'), []);
    this.hospitalNetworks = this.readJsonFile<HospitalNetwork[]>(path.join(this.cleanedDir, 'hospital_networks.json'), []);
    this.insurers = this.readJsonFile<Insurer[]>(path.join(this.cleanedDir, 'insurers.json'), []);
    this.policyRules = this.readJsonFile<PolicyRule[]>(path.join(this.cleanedDir, 'policy_rules.json'), []);
    this.policyExclusions = this.readJsonFile<PolicyExclusion[]>(path.join(this.cleanedDir, 'policy_exclusions.json'), []);

    // Master Reference Policies
    this.policies = this.readJsonFile<InsurancePolicy[]>(path.join(this.cleanedDir, 'policies.json'), []);

    // Runtime state starts empty and is populated from Supabase
    this.patients = [];
    this.journeys = [];
    this.verificationItems = [];
  }

  /**
   * Synchronizes in-memory caches directly from Supabase PostgreSQL tables.
   */
  public async syncFromSupabase(): Promise<boolean> {
    const check = await checkSupabaseConnection();
    if (!check.connected || !check.tablesAvailable) {
      return false;
    }

    try {
      const [
        hospitals,
        hospitalRooms,
        hospitalSpecialties,
        hospitalServices,
        specialties,
        services,
        roomCategories,
        procedures,
        procedureCosts,
        costComponents,
        hospitalNetworks,
        insurers,
        policies,
        policyRules,
        policyExclusions,
        patients,
        journeys,
        verificationItems,
        documents
      ] = await Promise.all([
        supabaseRepository.fetchHospitals(),
        supabaseRepository.fetchHospitalRooms(),
        supabaseRepository.fetchHospitalSpecialties(),
        supabaseRepository.fetchHospitalServices(),
        supabaseRepository.fetchSpecialties(),
        supabaseRepository.fetchServices(),
        supabaseRepository.fetchRoomCategories(),
        supabaseRepository.fetchProcedures(),
        supabaseRepository.fetchProcedureCosts(),
        supabaseRepository.fetchCostComponents(),
        supabaseRepository.fetchHospitalNetworks(),
        supabaseRepository.fetchInsurers(),
        supabaseRepository.fetchPolicies(),
        supabaseRepository.fetchPolicyRules(),
        supabaseRepository.fetchPolicyExclusions(),
        supabaseRepository.fetchPatients(),
        supabaseRepository.fetchJourneys(),
        supabaseRepository.fetchVerificationItems(),
        supabaseRepository.fetchDocuments()
      ]);

      if (hospitals.length > 0) this.hospitals = hospitals;
      if (hospitalRooms.length > 0) this.hospitalRooms = hospitalRooms;
      if (hospitalSpecialties.length > 0) this.hospitalSpecialties = hospitalSpecialties;
      if (hospitalServices.length > 0) this.hospitalServices = hospitalServices;
      if (specialties.length > 0) this.specialties = specialties;
      if (services.length > 0) this.services = services;
      if (roomCategories.length > 0) this.roomCategories = roomCategories;
      if (procedures.length > 0) this.procedures = procedures;
      if (procedureCosts.length > 0) this.procedureCosts = procedureCosts;
      if (costComponents.length > 0) this.costComponents = costComponents;
      if (hospitalNetworks.length > 0) this.hospitalNetworks = hospitalNetworks;
      if (insurers.length > 0) this.insurers = insurers;
      if (policies.length > 0) this.policies = policies;
      if (policyRules.length > 0) this.policyRules = policyRules;
      if (policyExclusions.length > 0) this.policyExclusions = policyExclusions;
      if (patients.length > 0) this.patients = patients;
      if (journeys.length > 0) this.journeys = journeys;
      if (verificationItems.length > 0) this.verificationItems = verificationItems;
      if (documents.length > 0) this.documents = documents;

      this.isDatabaseSynced = true;
      console.log('✅ CareIQ DataRepository synchronized live from Supabase PostgreSQL!');
      return true;
    } catch (err: any) {
      console.warn('⚠️  Supabase live sync encountered error, retained local cache:', err?.message || err);
      return false;
    }
  }

  public getIsDatabaseSynced(): boolean {
    return this.isDatabaseSynced;
  }

  // ==========================================
  // Patients
  // ==========================================

  public getPatients(): Patient[] {
    return this.patients;
  }

  public getPatientById(id: string): Patient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  public getDemoProfiles(): Patient[] {
    return this.patients.filter((p) => p.account_type === 'DEMO');
  }

  public addPatient(patient: Patient): Patient {
    const existingIdx = this.patients.findIndex((p) => p.id === patient.id);
    if (existingIdx >= 0) {
      this.patients[existingIdx] = patient;
    } else {
      this.patients.push(patient);
    }

    if (isSupabaseConfigured) {
      supabaseRepository.insertPatient(patient).catch((err) => {
        console.error('Failed to sync new patient to Supabase:', err);
      });
    }
    return patient;
  }

  public updatePatient(id: string, updateData: Partial<Patient>): Patient | undefined {
    const idx = this.patients.findIndex((p) => p.id === id);
    if (idx < 0) return undefined;

    this.patients[idx] = {
      ...this.patients[idx],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      supabaseRepository.updatePatient(id, updateData).catch((err) => {
        console.error('Failed to sync updated patient to Supabase:', err);
      });
    }
    return this.patients[idx];
  }

  public deletePatient(id: string): boolean {
    const initialLen = this.patients.length;
    this.patients = this.patients.filter((p) => p.id !== id);

    if (isSupabaseConfigured) {
      supabaseRepository.deletePatient(id).catch((err) => {
        console.error('Failed to delete patient in Supabase:', err);
      });
    }
    return this.patients.length < initialLen;
  }

  // ==========================================
  // Policies & Rules
  // ==========================================

  public getPolicies(): InsurancePolicy[] {
    return this.policies;
  }

  public getPolicyById(id: string): InsurancePolicy | undefined {
    return this.policies.find((p) => p.id === id);
  }

  public getPoliciesByPatientId(patientId: string): InsurancePolicy[] {
    return this.policies.filter((p) => p.patient_id === patientId);
  }

  public addPolicy(policy: InsurancePolicy): InsurancePolicy {
    const existingIdx = this.policies.findIndex((p) => p.id === policy.id);
    if (existingIdx >= 0) {
      this.policies[existingIdx] = policy;
    } else {
      this.policies.push(policy);
    }

    if (isSupabaseConfigured) {
      supabaseRepository.insertPolicy(policy).catch((err) => {
        console.error('Failed to sync new policy to Supabase:', err);
      });
    }
    return policy;
  }

  public updatePolicy(id: string, updateData: Partial<InsurancePolicy>): InsurancePolicy | undefined {
    const idx = this.policies.findIndex((p) => p.id === id);
    if (idx < 0) return undefined;

    this.policies[idx] = {
      ...this.policies[idx],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      supabaseRepository.updatePolicy(id, updateData).catch((err) => {
        console.error('Failed to sync updated policy to Supabase:', err);
      });
    }
    return this.policies[idx];
  }

  public deletePolicy(id: string): boolean {
    const initialLen = this.policies.length;
    this.policies = this.policies.filter((p) => p.id !== id);

    if (isSupabaseConfigured) {
      supabaseRepository.deletePolicy(id).catch((err) => {
        console.error('Failed to delete policy in Supabase:', err);
      });
    }
    return this.policies.length < initialLen;
  }

  public getRulesForPolicy(policyId: string): PolicyRule[] {
    return this.policyRules.filter((r) => r.policy_id === policyId);
  }

  public getExclusionsForPolicy(policyId: string): PolicyExclusion[] {
    return this.policyExclusions.filter((e) => e.policy_id === policyId);
  }

  public addPolicyRules(rules: PolicyRule[]): PolicyRule[] {
    this.policyRules.push(...rules);
    if (isSupabaseConfigured) {
      supabaseRepository.insertPolicyRules(rules).catch((err) => {
        console.error('Failed to sync policy rules to Supabase:', err);
      });
    }
    return rules;
  }

  public addPolicyExclusions(exclusions: PolicyExclusion[]): PolicyExclusion[] {
    this.policyExclusions.push(...exclusions);
    if (isSupabaseConfigured) {
      supabaseRepository.insertPolicyExclusions(exclusions).catch((err) => {
        console.error('Failed to sync policy exclusions to Supabase:', err);
      });
    }
    return exclusions;
  }

  // ==========================================
  // Hospitals, Rooms, Networks & Costs
  // ==========================================

  public getHospitals(): Hospital[] {
    return this.hospitals;
  }

  public getHospitalById(id: string): Hospital | undefined {
    return this.hospitals.find((h) => h.id === id);
  }

  /**
   * Scoped hospital queries for specific cities (e.g. ['Mumbai', 'Bengaluru']).
   */
  public getHospitalsByCity(cities: string[]): Hospital[] {
    if (!cities || cities.length === 0) return this.hospitals;
    const lowerCities = cities.map((c) => c.toLowerCase().trim());
    return this.hospitals.filter((h) => lowerCities.includes(h.city.toLowerCase().trim()));
  }

  public getHospitalRooms(hospitalId: string): HospitalRoom[] {
    return this.hospitalRooms.filter((r) => r.hospital_id === hospitalId);
  }

  public getHospitalSpecialties(hospitalId: string): Specialty[] {
    const activeSpecialtyIds = this.hospitalSpecialties
      .filter((hs) => hs.hospital_id === hospitalId && hs.availability_status)
      .map((hs) => hs.specialty_id);
    return this.specialties.filter((s) => activeSpecialtyIds.includes(s.id));
  }

  public getHospitalServices(hospitalId: string): Service[] {
    const activeServiceIds = this.hospitalServices
      .filter((hs) => hs.hospital_id === hospitalId && hs.availability_status)
      .map((hs) => hs.service_id);
    return this.services.filter((s) => activeServiceIds.includes(s.id));
  }

  public getNetworkRelationship(hospitalId: string, insurerId: string): HospitalNetwork | undefined {
    return this.hospitalNetworks.find(
      (n) => n.hospital_id === hospitalId && n.insurer_id === insurerId
    );
  }

  public getProcedureCost(hospitalId: string, procedureId: string): ProcedureCost | undefined {
    return this.procedureCosts.find(
      (pc) => pc.hospital_id === hospitalId && pc.procedure_id === procedureId
    );
  }

  public getCostComponents(procedureCostId: string): CostComponent[] {
    return this.costComponents.filter((cc) => cc.procedure_cost_id === procedureCostId);
  }

  // ==========================================
  // Care Journeys
  // ==========================================

  public getJourneys(): (CareJourney & { events: JourneyEvent[] })[] {
    return this.journeys;
  }

  public getJourneyById(id: string): (CareJourney & { events: JourneyEvent[] }) | undefined {
    return this.journeys.find((j) => j.id === id);
  }

  public addJourney(journey: CareJourney & { events: JourneyEvent[] }): CareJourney & { events: JourneyEvent[] } {
    const existingIdx = this.journeys.findIndex((j) => j.id === journey.id);
    if (existingIdx >= 0) {
      this.journeys[existingIdx] = journey;
    } else {
      this.journeys.push(journey);
    }

    if (isSupabaseConfigured) {
      supabaseRepository.insertJourney(journey).catch((err) => {
        console.error('Failed to sync new journey to Supabase:', err);
      });
    }
    return journey;
  }

  public addJourneyEvent(journeyId: string, event: JourneyEvent): JourneyEvent | undefined {
    const journey = this.getJourneyById(journeyId);
    if (!journey) return undefined;
    journey.events.push(event);
    journey.current_stage = event.stage;
    journey.updated_at = new Date().toISOString();

    if (isSupabaseConfigured) {
      supabaseRepository.insertJourneyEvent(journeyId, event).catch((err) => {
        console.error('Failed to sync journey event to Supabase:', err);
      });
    }
    return event;
  }

  // ==========================================
  // Verification Items
  // ==========================================

  public getVerificationItems(patientId?: string, journeyId?: string): VerificationItem[] {
    return this.verificationItems.filter((item) => {
      if (patientId && item.patient_id !== patientId) return false;
      if (journeyId && item.journey_id !== journeyId) return false;
      return true;
    });
  }

  public addVerificationItem(item: VerificationItem): VerificationItem {
    const existingIdx = this.verificationItems.findIndex((v) => v.id === item.id);
    if (existingIdx >= 0) {
      this.verificationItems[existingIdx] = item;
    } else {
      this.verificationItems.push(item);
    }

    if (isSupabaseConfigured) {
      supabaseRepository.insertVerificationItem(item).catch((err) => {
        console.error('Failed to sync verification item to Supabase:', err);
      });
    }
    return item;
  }

  public resolveVerificationItem(id: string): VerificationItem | undefined {
    const item = this.verificationItems.find((v) => v.id === id);
    if (item) {
      item.status = 'RESOLVED' as any;
      item.resolved_at = new Date().toISOString();

      if (isSupabaseConfigured) {
        supabaseRepository.resolveVerificationItem(id).catch((err) => {
          console.error('Failed to resolve verification item in Supabase:', err);
        });
      }
    }
    return item;
  }

  // ==========================================
  // Documents & Extractions
  // ==========================================

  public getDocuments(): Document[] {
    return this.documents;
  }

  public getDocumentById(id: string): Document | undefined {
    return this.documents.find((d) => d.id === id);
  }

  public addDocument(doc: Document): Document {
    const existingIdx = this.documents.findIndex((d) => d.id === doc.id);
    if (existingIdx >= 0) {
      this.documents[existingIdx] = doc;
    } else {
      this.documents.push(doc);
    }

    if (isSupabaseConfigured) {
      supabaseRepository.insertDocument(doc).catch((err) => {
        console.error('Failed to sync document to Supabase:', err);
      });
    }
    return doc;
  }

  public updateDocumentExtractionStatus(
    id: string,
    status: 'PENDING' | 'EXTRACTED' | 'FAILED' | 'CONFIRMED'
  ): Document | undefined {
    const doc = this.getDocumentById(id);
    if (doc) {
      doc.extraction_status = status;
      doc.updated_at = new Date().toISOString();

      if (isSupabaseConfigured) {
        supabaseRepository.updateDocumentExtractionStatus(id, status).catch((err) => {
          console.error('Failed to update document status in Supabase:', err);
        });
      }
    }
    return doc;
  }

  public addExtraction(extraction: DocumentExtraction): DocumentExtraction {
    const existingIdx = this.extractions.findIndex((e) => e.id === extraction.id);
    if (existingIdx >= 0) {
      this.extractions[existingIdx] = extraction;
    } else {
      this.extractions.push(extraction);
    }

    if (isSupabaseConfigured) {
      supabaseRepository.insertExtraction(extraction).catch((err) => {
        console.error('Failed to sync extraction to Supabase:', err);
      });
    }
    return extraction;
  }

  public getExtractionByDocumentId(documentId: string): DocumentExtraction | undefined {
    return this.extractions.find((e) => e.document_id === documentId);
  }

  public addExtractionEvidence(evidence: ExtractionEvidence[]): ExtractionEvidence[] {
    this.extractionEvidence.push(...evidence);

    if (isSupabaseConfigured) {
      supabaseRepository.insertExtractionEvidences(evidence).catch((err) => {
        console.error('Failed to sync extraction evidences to Supabase:', err);
      });
    }
    return evidence;
  }

  public getEvidenceByExtractionId(extractionId: string): ExtractionEvidence[] {
    return this.extractionEvidence.filter((ev) => ev.extraction_id === extractionId);
  }
}

export const dataRepository = new DataRepository();
