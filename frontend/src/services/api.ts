const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const json = await response.json();
  if (!response.ok || json.success === false) {
    const msg = json.error?.message || `API request failed with status ${response.status}`;
    throw new Error(msg);
  }
  return json.data as T;
}

export const api = {
  // Patients
  getPatients: () => fetchApi<any[]>('/patients'),
  getPatientById: (id: string) => fetchApi<any>(`/patients/${id}`),
  createPatient: (data: any) => fetchApi<any>('/patients', { method: 'POST', body: JSON.stringify(data) }),

  // Policies
  getPolicies: (patientId?: string) => fetchApi<any[]>(`/policies${patientId ? `?patient_id=${patientId}` : ''}`),
  getPolicyById: (id: string) => fetchApi<any>(`/policies/${id}`),
  createPolicy: (data: any) => fetchApi<any>('/policies', { method: 'POST', body: JSON.stringify(data) }),

  // Hospitals & Matching
  getHospitals: (city?: string) => fetchApi<any[]>(`/hospitals${city ? `?city=${encodeURIComponent(city)}` : ''}`),
  getHospitalById: (id: string) => fetchApi<any>(`/hospitals/${id}`),
  matchHospitals: (params: {
    city: string;
    policy_id?: string;
    specialty_code?: string;
    service_code?: string;
    preferred_room_category?: string;
    procedure_id?: string;
    network_only?: boolean;
  }) => fetchApi<any[]>('/hospitals/match', { method: 'POST', body: JSON.stringify(params) }),

  // Care Journey
  getJourneys: (patientId?: string) => fetchApi<any[]>(`/journeys${patientId ? `?patient_id=${patientId}` : ''}`),
  getJourneyById: (id: string) => fetchApi<any>(`/journeys/${id}`),
  createJourney: (data: { patient_id: string; hospital_id: string; policy_id?: string }) =>
    fetchApi<any>('/journeys', { method: 'POST', body: JSON.stringify(data) }),
  addJourneyEvent: (journeyId: string, eventData: any) =>
    fetchApi<any>(`/journeys/${journeyId}/events`, { method: 'POST', body: JSON.stringify(eventData) }),

  // Verification Items
  getVerificationItems: (patientId?: string, journeyId?: string) => {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId);
    if (journeyId) params.append('journey_id', journeyId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/verification-items${qs}`);
  },
  resolveVerificationItem: (id: string) =>
    fetchApi<any>(`/verification-items/${id}/resolve`, { method: 'POST' }),
  createVerificationItem: (data: any) =>
    fetchApi<any>('/verification-items', { method: 'POST', body: JSON.stringify(data) }),

  // Cost Estimation
  calculateCostEstimate: (params: {
    policy_id: string;
    hospital_id?: string;
    procedure_id?: string;
    preferred_room_category?: string;
    selected_tariff?: number;
  }) => fetchApi<any>('/cost/estimate', { method: 'POST', body: JSON.stringify(params) }),

  // AI Explanations & Questions
  explainMatch: (params: { hospital_id: string; policy_id?: string; patient_name?: string }) =>
    fetchApi<any>('/ai/explain', { method: 'POST', body: JSON.stringify(params) }),
  getQuestions: (params: {
    hospital_name: string;
    insurer_name?: string;
    stage?: string;
    is_room_exceeded?: boolean;
  }) => fetchApi<any>('/ai/questions', { method: 'POST', body: JSON.stringify(params) }),

  // Documents & Extraction (Phases 12 & 13)
  getDocuments: () => fetchApi<any[]>('/documents'),
  getDocumentById: (id: string) => fetchApi<any>(`/documents/${id}`),
  uploadDocument: async (file: File, documentType: string = 'POLICY', ownerId: string = 'caregiver-primary') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('owner_user_id', ownerId);

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.error?.message || 'Document upload failed');
    }
    return json.data;
  },
  extractDocument: (id: string) => fetchApi<any>(`/documents/${id}/extract`, { method: 'POST' }),
  confirmExtraction: (id: string, confirmedData: any) =>
    fetchApi<any>(`/documents/${id}/confirm`, { method: 'POST', body: JSON.stringify(confirmedData) }),

  // Document RAG (Phase 24)
  queryPolicyRag: (query: string, policyId?: string) =>
    fetchApi<any>('/ai/rag/query', { method: 'POST', body: JSON.stringify({ query, policy_id: policyId }) }),

  // Scenarios
  getScenarios: () => fetchApi<any[]>('/scenarios'),
  loadScenario: (id: string) => fetchApi<any>(`/scenarios/${id}/load`, { method: 'POST' })
};

