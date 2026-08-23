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
  InsurerType,
  DataStatus,
  VerificationStatus,
  ConfidenceLevel,
  InsurancePolicy,
  PolicyRule,
  PolicyExclusion,
  Patient,
  CareJourney,
  JourneyEvent,
  VerificationItem,
  VerificationCategory,
  PriorityLevel,
  VerificationItemStatus,
  Document,
  DocumentExtraction,
  ExtractionEvidence
} from '../types/domain';
import { supabaseRepository } from './supabaseRepository';
import { isSupabaseConfigured, checkSupabaseConnection } from '../config/supabase';

function resolveDataDir(): string {
  const candidates = [
    path.resolve(__dirname, '../../data'),
    path.resolve(__dirname, '../data'),
    path.resolve(__dirname, '../../../data'),
    path.resolve(__dirname, '../../../../data'),
    path.resolve(process.cwd(), 'backend/data'),
    path.resolve(process.cwd(), 'data'),
    path.resolve(__dirname, 'data')
  ];

  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'cleaned/hospitals.json')) || fs.existsSync(path.join(c, 'hospitals.json'))) {
      return c;
    }
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return path.resolve(process.cwd(), 'data');
}

const BASELINE_INSURERS: Insurer[] = [
  { id: 'ins-star-health', name: 'Star Health and Allied Insurance', short_name: 'Star Health', insurer_type: InsurerType.PRIVATE, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'ins-hdfc-ergo', name: 'HDFC ERGO General Insurance', short_name: 'HDFC ERGO', insurer_type: InsurerType.PRIVATE, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'ins-icici-lombard', name: 'ICICI Lombard General Insurance', short_name: 'ICICI Lombard', insurer_type: InsurerType.PRIVATE, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'ins-care-health', name: 'Care Health Insurance', short_name: 'Care Health', insurer_type: InsurerType.PRIVATE, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'ins-niva-bupa', name: 'Niva Bupa Health Insurance', short_name: 'Niva Bupa', insurer_type: InsurerType.PRIVATE, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'ins-bajaj-allianz', name: 'Bajaj Allianz General Insurance', short_name: 'Bajaj Allianz', insurer_type: InsurerType.PRIVATE, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'ins-tata-aig', name: 'Tata AIG General Insurance', short_name: 'Tata AIG', insurer_type: InsurerType.PRIVATE, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sch-pmjay', name: 'Ayushman Bharat PM-JAY', short_name: 'PM-JAY', insurer_type: InsurerType.SCHEME_ADMINISTRATOR, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sch-ab-ark', name: 'Arogya Karnataka / AB-ARK', short_name: 'AB-ARK', insurer_type: InsurerType.SCHEME_ADMINISTRATOR, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sch-mjpjay', name: 'Mahatma Jyotirao Phule Jan Arogya Yojana', short_name: 'MJPJAY', insurer_type: InsurerType.SCHEME_ADMINISTRATOR, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'sch-cghs', name: 'Central Government Health Scheme (CGHS)', short_name: 'CGHS', insurer_type: InsurerType.SCHEME_ADMINISTRATOR, data_status: DataStatus.PUBLIC_REFERENCE, verification_status: VerificationStatus.VERIFIED, confidence: ConfidenceLevel.HIGH, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
];

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
  public insurers: Insurer[] = [...BASELINE_INSURERS];
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
    this.cleanedDir = fs.existsSync(path.join(this.baseDataDir, 'cleaned'))
      ? path.join(this.baseDataDir, 'cleaned')
      : this.baseDataDir;

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
    if (!fs.existsSync(this.cleanedDir)) {
      this.baseDataDir = resolveDataDir();
      this.cleanedDir = fs.existsSync(path.join(this.baseDataDir, 'cleaned'))
        ? path.join(this.baseDataDir, 'cleaned')
        : this.baseDataDir;
    }

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
    this.insurers = this.readJsonFile<Insurer[]>(path.join(this.cleanedDir, 'insurers.json'), [...BASELINE_INSURERS]);
    this.policyRules = this.readJsonFile<PolicyRule[]>(path.join(this.cleanedDir, 'policy_rules.json'), []);
    this.policyExclusions = this.readJsonFile<PolicyExclusion[]>(path.join(this.cleanedDir, 'policy_exclusions.json'), []);

    // Master Reference Policies
    this.policies = this.readJsonFile<InsurancePolicy[]>(path.join(this.cleanedDir, 'policies.json'), []);

    // Runtime state starts empty and is populated from Supabase
    this.patients = [];
    this.journeys = [];
    this.verificationItems = [];
  }

  public async ensureDataLoaded(): Promise<void> {
    if (this.hospitals.length === 0) {
      this.loadAllData();
      if (this.hospitals.length === 0) {
        await this.syncFromSupabase();
      }
    }
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

  public getPatientByAuthUserId(authUserId: string): Patient | undefined {
    return this.patients.find((p) => p.auth_user_id === authUserId || p.user_id === authUserId);
  }

  public getPatientByEmail(email: string): Patient | undefined {
    if (!email) return undefined;
    return this.patients.find((p) => p.email?.toLowerCase() === email.toLowerCase());
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
  // Insurers
  // ==========================================

  public getInsurers(): Insurer[] {
    return this.insurers.length > 0 ? this.insurers : BASELINE_INSURERS;
  }

  public getInsurerById(id: string): Insurer | undefined {
    return this.getInsurers().find((i) => i.id === id);
  }

  // ==========================================
  // Hospitals, Rooms, Networks & Costs
  // ==========================================

  public getHospitals(): Hospital[] {
    if (this.hospitals.length === 0) {
      this.loadAllData();
    }
    return this.hospitals;
  }

  public getHospitalById(id: string): Hospital | undefined {
    if (this.hospitals.length === 0) {
      this.loadAllData();
    }
    return this.hospitals.find((h) => h.id === id);
  }

  /**
   * Scoped hospital queries for specific cities (e.g. ['Mumbai', 'Bengaluru']).
   */
  public getHospitalsByCity(cities: string[]): Hospital[] {
    if (this.hospitals.length === 0) {
      this.loadAllData();
    }
    if (!cities || cities.length === 0) return this.hospitals;
    const lowerCities = cities.map((c) => c.toLowerCase().trim());
    return this.hospitals.filter((h) => lowerCities.includes(h.city.toLowerCase().trim()));
  }

  public getHospitalRooms(hospitalId: string): HospitalRoom[] {
    if (this.hospitalRooms.length === 0) {
      this.loadAllData();
    }
    return this.hospitalRooms.filter((r) => r.hospital_id === hospitalId);
  }

  public getHospitalSpecialties(hospitalId: string): Specialty[] {
    if (this.hospitalSpecialties.length === 0) {
      this.loadAllData();
    }
    const activeSpecialtyIds = this.hospitalSpecialties
      .filter((hs) => hs.hospital_id === hospitalId && hs.availability_status)
      .map((hs) => hs.specialty_id);
    return this.specialties.filter((s) => activeSpecialtyIds.includes(s.id));
  }

  public getHospitalServices(hospitalId: string): Service[] {
    if (this.hospitalServices.length === 0) {
      this.loadAllData();
    }
    const activeServiceIds = this.hospitalServices
      .filter((hs) => hs.hospital_id === hospitalId && hs.availability_status)
      .map((hs) => hs.service_id);
    return this.services.filter((s) => activeServiceIds.includes(s.id));
  }

  public getNetworkRelationship(hospitalId: string, insurerId: string): HospitalNetwork | undefined {
    if (this.hospitalNetworks.length === 0) {
      this.loadAllData();
    }
    return this.hospitalNetworks.find(
      (n) => n.hospital_id === hospitalId && n.insurer_id === insurerId
    );
  }

  public getProcedureCost(hospitalId: string, procedureId: string): ProcedureCost | undefined {
    if (this.procedureCosts.length === 0) {
      this.loadAllData();
    }
    return this.procedureCosts.find(
      (pc) => pc.hospital_id === hospitalId && pc.procedure_id === procedureId
    );
  }

  public getProcedures(): Procedure[] {
    if (this.procedures.length === 0) {
      this.loadAllData();
    }
    return this.procedures;
  }

  public getProcedureById(procedureId: string): Procedure | undefined {
    return this.procedures.find((p) => p.id === procedureId);
  }

  /** Procedures this hospital has published a price for, alphabetical. */
  public getProceduresAtHospital(hospitalId: string): Procedure[] {
    const priced = new Set(
      this.procedureCosts.filter((pc) => pc.hospital_id === hospitalId).map((pc) => pc.procedure_id)
    );
    return this.procedures
      .filter((p) => priced.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));
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

  public getJourneysByPatientId(patientId: string): (CareJourney & { events: JourneyEvent[] })[] {
    return this.journeys.filter((j) => j.patient_id === patientId);
  }

  public getJourneyByPatientId(patientId: string): (CareJourney & { events: JourneyEvent[] }) | undefined {
    return this.journeys.find((j) => j.patient_id === patientId);
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
    let items = this.verificationItems.filter((item) => {
      if (patientId && item.patient_id !== patientId) return false;
      if (journeyId && item.journey_id !== journeyId) return false;
      return true;
    });

    // If querying for a specific patient who has no verification items yet (e.g. newly registered user), generate tailored baseline checkpoints
    if (patientId && items.length === 0) {
      const policy = this.getPoliciesByPatientId(patientId)[0] || this.getPolicies()[0];
      const isGov = policy?.policy_type === 'GOVERNMENT_SCHEME' || policy?.policy_name?.toLowerCase().includes('pm-jay') || policy?.policy_name?.toLowerCase().includes('ayushman');
      const now = new Date().toISOString();

      const initialItems: VerificationItem[] = [
        {
          id: `ver-${patientId}-consumables`,
          patient_id: patientId,
          journey_id: journeyId,
          category: VerificationCategory.COST,
          title: 'Verify Itemized Non-Payable Consumable Charges',
          question: 'Ask hospital billing desk for an advance estimate of non-medical consumables, gloves, PPE kits, and administrative file charges.',
          reason: isGov
            ? 'Confirm zero-billing under statutory PM-JAY package guidelines.'
            : 'Surgical admissions typically incur ₹12,000 - ₹18,000 in non-payable disposable exclusions.',
          priority: PriorityLevel.HIGH,
          status: VerificationItemStatus.PENDING,
          created_at: now
        },
        {
          id: `ver-${patientId}-preauth`,
          patient_id: patientId,
          journey_id: journeyId,
          category: VerificationCategory.PREAUTH,
          title: 'Confirm Preauthorization Status & Differential Approval',
          question: 'Has the hospital TPA desk submitted pre-authorization and received initial sanction letter?',
          reason: 'Cashless planned admission requires initial pre-authorization token before admission desk bed allocation.',
          priority: PriorityLevel.HIGH,
          status: VerificationItemStatus.PENDING,
          created_at: now
        },
        {
          id: `ver-${patientId}-room-cap`,
          patient_id: patientId,
          journey_id: journeyId,
          category: VerificationCategory.ROOM,
          title: 'Room Rent Category Cap & Proportionate Deduction Guard',
          question: `Is the allocated room category strictly within your ${policy?.room_eligibility || 'Single Private AC'} policy cap?`,
          reason: 'Upgrading room beyond eligibility triggers proportionate deductions across doctor, surgeon, and OT charges.',
          priority: PriorityLevel.MEDIUM,
          status: VerificationItemStatus.PENDING,
          created_at: now
        },
        {
          id: `ver-${patientId}-claim-window`,
          patient_id: patientId,
          journey_id: journeyId,
          category: VerificationCategory.DOCUMENT,
          title: 'Post-Hospitalization 60-Day Claim Window Verification',
          question: 'Have you collected signed discharge summary, implant stickers, diagnostic reports, and original pharmacy receipts?',
          reason: 'Post-hospitalization OPD/investigation claims must be submitted to the insurer within 60 to 90 days of discharge.',
          priority: PriorityLevel.LOW,
          status: VerificationItemStatus.PENDING,
          created_at: now
        }
      ];

      initialItems.forEach((item) => {
        this.addVerificationItem(item);
      });

      items = initialItems;
    }

    return items;
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
