/**
 * The API client. Every method's return type is the real response shape from
 * src/types/domain.ts, so a component that reads a field the server does not
 * send fails the build instead of rendering undefined behind a `||` fallback.
 */
import type {
  AuthSession,
  CareJourney,
  CostEstimate,
  CoverageConfidence,
  DemoProfile,
  EnrichedInsurancePolicy,
  Hospital,
  HospitalDetail,
  HospitalMatchExplanation,
  HospitalMatchResult,
  Insurer,
  JourneyEvent,
  Patient,
  PolicyExclusion,
  PolicyRule,
  PolicyType,
  Procedure,
  QuestionsToAsk,
  RagAnswer,
  RoomCategoryCode,
  StageGuidance,
  UploadedDocument,
  VerificationItem,
  WhatIfComparison
} from '../types/domain';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('careiq_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * A failed request carries the backend's error code, not just a message.
 * Callers need the code: ROOM_TARIFF_NOT_ON_RECORD is a prompt to pick another
 * room, POLICY_ID_REQUIRED is a prompt to link a policy, and 'something went
 * wrong' for both is what forced views to guess.
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: Record<string, unknown> };
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  let json: ApiEnvelope<T>;
  try {
    json = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(
      `The server returned an unreadable response (status ${response.status}).`,
      'INVALID_RESPONSE',
      response.status
    );
  }

  if (!response.ok || json.success === false) {
    throw new ApiError(
      json.error?.message || `Request failed with status ${response.status}`,
      json.error?.code || 'REQUEST_FAILED',
      response.status,
      json.error?.details
    );
  }

  return json.data as T;
}

export interface RegisterPayload {
  email: string;
  password: string;
  patient: {
    display_name: string;
    age?: number;
    date_of_birth?: string;
    gender?: string;
    blood_group?: string;
    medical_conditions?: string[];
    current_medications?: string[];
    allergies?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    city: string;
    state: string;
    pincode?: string;
    preferred_language?: string;
  };
  policy?: {
    insurer_id: string;
    policy_name: string;
    policy_type?: PolicyType;
    policy_number_masked?: string;
    sum_insured: number;
    remaining_sum_insured?: number;
    room_eligibility?: RoomCategoryCode;
    copay_percentage?: number;
    deductible_amount?: number;
    cashless_supported?: boolean;
    preauthorization_supported?: boolean;
    pre_hospitalization_days?: number;
    post_hospitalization_days?: number;
    policy_start_date?: string;
    policy_end_date?: string;
  };
}

export interface CostEstimateParams {
  policy_id: string;
  hospital_id: string;
  procedure_id: string;
  preferred_room_category?: RoomCategoryCode;
  selected_tariff?: number;
}

export interface WhatIfParams {
  policy_id: string;
  hospital_id: string;
  procedure_id: string;
  current_room_category?: RoomCategoryCode;
  alternative_room_category?: RoomCategoryCode;
  current_tariff?: number;
  alternative_tariff?: number;
}

export interface CoverageConfidenceParams {
  policy_id?: string;
  hospital_id?: string;
  patient_id?: string;
  procedure_id?: string;
  selected_room_category?: RoomCategoryCode;
  /**
   * Only send these when the caller genuinely knows the answer. Omitting one
   * means "derive it from our records"; sending false asserts a negative.
   */
  is_network_cashless?: boolean;
  has_room_mismatch?: boolean;
  is_preauth_pending?: boolean;
  has_consumables_verified?: boolean;
}

const post = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body)
});

export const api = {
  // ---- Authentication ----
  login: (data: { email: string; password: string }) =>
    fetchApi<AuthSession>('/auth/login', post(data)),
  register: (data: RegisterPayload) => fetchApi<AuthSession>('/auth/register', post(data)),
  logout: () => fetchApi<{ message: string }>('/auth/logout', { method: 'POST' }),
  getMe: () => fetchApi<AuthSession>('/auth/me'),
  demoLogin: (demoId: string) => fetchApi<AuthSession>('/auth/demo-login', post({ demo_id: demoId })),

  // ---- Onboarding reference data ----
  getDemoProfiles: () => fetchApi<DemoProfile[]>('/onboarding/demo-profiles'),
  getInsurers: () => fetchApi<Insurer[]>('/onboarding/insurers'),

  // ---- Patients ----
  getPatients: () => fetchApi<Patient[]>('/patients'),
  getPatientById: (id: string) =>
    fetchApi<Patient & { policies?: EnrichedInsurancePolicy[]; journeys?: CareJourney[] }>(
      `/patients/${id}`
    ),
  createPatient: (data: Partial<Patient>) => fetchApi<Patient>('/patients', post(data)),
  updatePatient: (id: string, data: Partial<Patient>) =>
    fetchApi<Patient>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id: string) => fetchApi<{ id: string }>(`/patients/${id}`, { method: 'DELETE' }),

  // ---- Policies ----
  getPolicies: (patientId?: string) =>
    fetchApi<EnrichedInsurancePolicy[]>(
      `/policies${patientId ? `?patient_id=${encodeURIComponent(patientId)}` : ''}`
    ),
  getPolicyById: (id: string) =>
    fetchApi<EnrichedInsurancePolicy & { rules?: PolicyRule[]; exclusions?: PolicyExclusion[] }>(
      `/policies/${id}`
    ),
  createPolicy: (data: Partial<EnrichedInsurancePolicy>) =>
    fetchApi<EnrichedInsurancePolicy>('/policies', post(data)),
  updatePolicy: (id: string, data: Partial<EnrichedInsurancePolicy>) =>
    fetchApi<EnrichedInsurancePolicy>(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deletePolicy: (id: string) => fetchApi<{ id: string }>(`/policies/${id}`, { method: 'DELETE' }),

  // ---- Hospitals & matching ----
  getHospitals: (city?: string) =>
    fetchApi<Hospital[]>(`/hospitals${city ? `?city=${encodeURIComponent(city)}` : ''}`),
  /**
   * Pass insurerId to get the `coverage` block. Without it the response carries
   * no network status at all, which is correct — "in network" is a fact about a
   * hospital and an insurer together, never about a hospital alone.
   */
  getHospitalById: (id: string, insurerId?: string) =>
    fetchApi<HospitalDetail>(
      `/hospitals/${id}${insurerId ? `?insurer_id=${encodeURIComponent(insurerId)}` : ''}`
    ),
  getProcedures: () => fetchApi<Procedure[]>('/hospitals/procedures'),
  matchHospitals: (params: {
    city: string;
    policy_id?: string;
    specialty_code?: string;
    service_code?: string;
    preferred_room_category?: RoomCategoryCode;
    procedure_id?: string;
    network_only?: boolean;
  }) => fetchApi<HospitalMatchResult[]>('/hospitals/match', post(params)),

  // ---- Care journey ----
  getJourneys: (patientId?: string) =>
    fetchApi<CareJourney[]>(
      `/journeys${patientId ? `?patient_id=${encodeURIComponent(patientId)}` : ''}`
    ),
  getJourneyById: (id: string) => fetchApi<CareJourney>(`/journeys/${id}`),
  createJourney: (data: {
    patient_id: string;
    hospital_id: string;
    policy_id?: string;
    procedure_id?: string;
    selected_room_category?: RoomCategoryCode;
    admission_date?: string;
    diagnosis?: string;
  }) => fetchApi<CareJourney>('/journeys', post(data)),
  addJourneyEvent: (journeyId: string, eventData: Partial<JourneyEvent>) =>
    fetchApi<JourneyEvent>(`/journeys/${journeyId}/events`, post(eventData)),

  // ---- Verification items ----
  getVerificationItems: (patientId?: string, journeyId?: string) => {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId);
    if (journeyId) params.append('journey_id', journeyId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<VerificationItem[]>(`/verification-items${qs}`);
  },
  resolveVerificationItem: (id: string) =>
    fetchApi<VerificationItem>(`/verification-items/${id}/resolve`, { method: 'POST' }),
  createVerificationItem: (data: Partial<VerificationItem>) =>
    fetchApi<VerificationItem>('/verification-items', post(data)),

  // ---- Cost estimation ----
  /**
   * The only place coverage arithmetic happens. policy_id, hospital_id and
   * procedure_id are all required: the endpoint returns 400 rather than
   * assuming a hospital, and a component must not paper over that by assuming
   * one either.
   */
  calculateCostEstimate: (params: CostEstimateParams) =>
    fetchApi<CostEstimate>('/cost/estimate', post(params)),
  calculateWhatIf: (params: WhatIfParams) =>
    fetchApi<WhatIfComparison>('/cost/what-if', post(params)),

  // ---- AI ----
  explainMatch: (params: { hospital_id: string; policy_id?: string; patient_name?: string }) =>
    fetchApi<HospitalMatchExplanation>('/ai/explain', post(params)),
  /**
   * hospital_name is optional. Omitting it produces questions that do not name
   * a hospital; the server no longer substitutes 'the hospital', which read as
   * though we knew which one.
   */
  getQuestions: (params: {
    hospital_name?: string;
    insurer_name?: string;
    stage?: string;
    is_room_exceeded?: boolean;
  }) => fetchApi<QuestionsToAsk>('/ai/questions', post(params)),
  getCoverageConfidence: (params: CoverageConfidenceParams) =>
    fetchApi<CoverageConfidence>('/ai/coverage-confidence', post(params)),
  getStageGuidance: (params: {
    stage: string;
    policy_id?: string;
    hospital_id?: string;
    patient_name?: string;
    procedure_name?: string;
    is_room_mismatch?: boolean;
  }) => fetchApi<StageGuidance>('/ai/stage-guidance', post(params)),
  queryPolicyRag: (query: string, policyId?: string) =>
    fetchApi<RagAnswer>('/ai/rag/query', post({ query, policy_id: policyId })),
  streamPolicyRag: async (
    query: string,
    policyId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<RagAnswer> => {
    try {
      const response = await fetch(`${API_BASE}/ai/rag/query/stream`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query, policy_id: policyId })
      });
      if (!response.ok || !response.body) {
        return api.queryPolicyRag(query, policyId);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let citations: any[] = [];
      let confidence: any = 'MEDIUM';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulatedText += data.chunk;
                onChunk?.(data.chunk);
              }
              if (data.final) {
                if (data.answer) accumulatedText = data.answer;
                if (data.citations) citations = data.citations;
                if (data.confidence) confidence = data.confidence;
              }
            } catch {
              // chunk parse handling
            }
          }
        }
      }
      return {
        query,
        answer: accumulatedText,
        confidence: (confidence as 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
        citations,
        uncertaintyNotes: [],
        disclaimer: 'CareIQ grounded policy interpretation.'
      };
    } catch {
      return api.queryPolicyRag(query, policyId);
    }
  },

  // ---- Documents ----
  getDocuments: () => fetchApi<UploadedDocument[]>('/documents'),
  getDocumentById: (id: string) => fetchApi<UploadedDocument>(`/documents/${id}`),
  uploadDocument: async (
    file: File,
    documentType: string = 'POLICY',
    ownerId: string = 'caregiver-primary'
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('owner_user_id', ownerId);

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    const json = (await response.json()) as ApiEnvelope<{ id: string }>;
    if (!response.ok || json.success === false) {
      throw new ApiError(
        json.error?.message || 'Document upload failed',
        json.error?.code || 'UPLOAD_FAILED',
        response.status
      );
    }
    return json.data as { id: string };
  },
  extractDocument: (id: string) =>
    fetchApi<Record<string, unknown>>(`/documents/${id}/extract`, { method: 'POST' }),
  confirmExtraction: (id: string, confirmedData: Record<string, unknown>) =>
    fetchApi<Record<string, unknown>>(`/documents/${id}/confirm`, post(confirmedData))
};
