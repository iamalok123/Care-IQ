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
  ExtractionEvidence,
  DataStatus,
  VerificationStatus,
  ConfidenceLevel
} from '../types/domain';

class DataRepository {
  private baseDataDir: string;
  private cleanedDir: string;
  private syntheticDir: string;
  private scenariosDir: string;

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
    this.baseDataDir = path.resolve(__dirname, '../../../../data');
    if (!fs.existsSync(this.baseDataDir)) {
      this.baseDataDir = path.resolve(__dirname, '../../../data');
    }
    this.cleanedDir = path.join(this.baseDataDir, 'cleaned');
    this.syntheticDir = path.join(this.baseDataDir, 'synthetic');
    this.scenariosDir = path.join(this.baseDataDir, 'scenarios');

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

  public loadAllData(): void {
    // Load Master Cleaned Data
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

    // Combine Cleaned and Synthetic Policies & Patients
    const masterPolicies = this.readJsonFile<InsurancePolicy[]>(path.join(this.cleanedDir, 'policies.json'), []);
    const syntheticPolicies = this.readJsonFile<InsurancePolicy[]>(path.join(this.syntheticDir, 'policies.json'), []);
    this.policies = [...masterPolicies, ...syntheticPolicies];

    this.patients = this.readJsonFile<Patient[]>(path.join(this.syntheticDir, 'patients.json'), []);
    this.journeys = this.readJsonFile<(CareJourney & { events: JourneyEvent[] })[]>(path.join(this.syntheticDir, 'journeys.json'), []);
    this.verificationItems = this.readJsonFile<VerificationItem[]>(path.join(this.syntheticDir, 'verification_items.json'), []);
  }

  // Patients
  public getPatients(): Patient[] {
    return this.patients;
  }

  public getPatientById(id: string): Patient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  public addPatient(patient: Patient): Patient {
    this.patients.push(patient);
    return patient;
  }

  // Policies
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
    this.policies.push(policy);
    return policy;
  }

  public getRulesForPolicy(policyId: string): PolicyRule[] {
    return this.policyRules.filter((r) => r.policy_id === policyId);
  }

  public getExclusionsForPolicy(policyId: string): PolicyExclusion[] {
    return this.policyExclusions.filter((e) => e.policy_id === policyId);
  }

  // Hospitals
  public getHospitals(): Hospital[] {
    return this.hospitals;
  }

  public getHospitalById(id: string): Hospital | undefined {
    return this.hospitals.find((h) => h.id === id);
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

  // Care Journeys
  public getJourneys(): (CareJourney & { events: JourneyEvent[] })[] {
    return this.journeys;
  }

  public getJourneyById(id: string): (CareJourney & { events: JourneyEvent[] }) | undefined {
    return this.journeys.find((j) => j.id === id);
  }

  public addJourney(journey: CareJourney & { events: JourneyEvent[] }): CareJourney & { events: JourneyEvent[] } {
    this.journeys.push(journey);
    return journey;
  }

  public addJourneyEvent(journeyId: string, event: JourneyEvent): JourneyEvent | undefined {
    const journey = this.getJourneyById(journeyId);
    if (!journey) return undefined;
    journey.events.push(event);
    journey.current_stage = event.stage;
    journey.updated_at = new Date().toISOString();
    return event;
  }

  // Verification Items
  public getVerificationItems(patientId?: string, journeyId?: string): VerificationItem[] {
    return this.verificationItems.filter((item) => {
      if (patientId && item.patient_id !== patientId) return false;
      if (journeyId && item.journey_id !== journeyId) return false;
      return true;
    });
  }

  public addVerificationItem(item: VerificationItem): VerificationItem {
    this.verificationItems.push(item);
    return item;
  }

  public resolveVerificationItem(id: string): VerificationItem | undefined {
    const item = this.verificationItems.find((v) => v.id === id);
    if (item) {
      item.status = 'RESOLVED' as any;
      item.resolved_at = new Date().toISOString();
    }
    return item;
  }

  public addPolicyRules(rules: PolicyRule[]): PolicyRule[] {
    this.policyRules.push(...rules);
    return rules;
  }

  public addPolicyExclusions(exclusions: PolicyExclusion[]): PolicyExclusion[] {
    this.policyExclusions.push(...exclusions);
    return exclusions;
  }

  // Documents
  public getDocuments(): Document[] {
    return this.documents;
  }

  public getDocumentById(id: string): Document | undefined {
    return this.documents.find((d) => d.id === id);
  }

  public addDocument(doc: Document): Document {
    this.documents.push(doc);
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
    }
    return doc;
  }

  // Extractions & Evidence
  public addExtraction(extraction: DocumentExtraction): DocumentExtraction {
    this.extractions.push(extraction);
    return extraction;
  }

  public getExtractionByDocumentId(documentId: string): DocumentExtraction | undefined {
    return this.extractions.find((e) => e.document_id === documentId);
  }

  public addExtractionEvidence(evidence: ExtractionEvidence[]): ExtractionEvidence[] {
    this.extractionEvidence.push(...evidence);
    return evidence;
  }

  public getEvidenceByExtractionId(extractionId: string): ExtractionEvidence[] {
    return this.extractionEvidence.filter((ev) => ev.extraction_id === extractionId);
  }

  // Scenarios
  public listScenarios(): any[] {
    const files = fs.readdirSync(this.scenariosDir).filter((f) => f.endsWith('.json'));
    return files.map((file) => this.readJsonFile(path.join(this.scenariosDir, file), null)).filter(Boolean);
  }

  public getScenarioById(id: string): any | undefined {
    const filePath = path.join(this.scenariosDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      return this.readJsonFile(filePath, undefined);
    }
    return undefined;
  }
}

export const dataRepository = new DataRepository();

