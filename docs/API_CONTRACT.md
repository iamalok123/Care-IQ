# CareIQ — REST API Specifications

The backend server exposes modular REST endpoints on `http://localhost:5000/api`.

---

## 1. Patients API (`/api/patients`)

- `GET /api/patients`: List all active patient profiles.
- `GET /api/patients/:id`: Retrieve single patient by ID.
- `POST /api/patients`: Create a new patient profile.

---

## 2. Policies & Documents API (`/api/policies`, `/api/documents`)

- `GET /api/policies?patient_id={id}`: List policies for a specific patient.
- `GET /api/policies/:id`: Get policy details, including normalized rules and exclusions.
- `POST /api/policies`: Create or update a policy manually.
- `POST /api/documents/upload`: Multipart upload for policy documents (`file`, `document_type`, `owner_user_id`).
- `GET /api/documents/:id`: Get document metadata, extraction records, and evidence citations.
- `POST /api/documents/:id/extract`: Run AI structured extraction and evidence citation binding.
- `POST /api/documents/:id/confirm`: Confirm reviewed extraction fields and normalize into active policy rules.

---

## 3. Hospitals & Matching API (`/api/hospitals`)

- `GET /api/hospitals?city={city}`: List all hospitals in a target city.
- `GET /api/hospitals/:id`: Get hospital details (rooms, specialties, services, networks).
- `POST /api/hospitals/match`:
  - **Request**:
    ```json
    {
      "city": "Bengaluru",
      "policy_id": "pol-syn-ananya",
      "procedure_id": "proc-knee-replacement",
      "preferred_room_category": "PRIVATE_AC"
    }
    ```
  - **Response**: Ranked hospital array with `matchScore`, `networkStatus`, `roomCategoryMatch`, `estimatedPatientExposure`, and `reasons`.

---

## 4. Care Journey API (`/api/journeys`)

- `GET /api/journeys?patient_id={id}`: Get active care journeys for a patient.
- `GET /api/journeys/:id`: Get journey details with chronologically logged timeline events.
- `POST /api/journeys`: Initialize a care journey for a patient at a selected hospital.
- `POST /api/journeys/:id/events`: Log an admission/procedure event (triggers policy-aware checks).

---

## 5. Cost Engine API (`/api/cost`)

- `POST /api/cost/estimate`:
  - **Request**: `{ policy_id, hospital_id, procedure_id, preferred_room_category, selected_tariff }`
  - **Response**:
    ```json
    {
      "typicalGrossCost": 240000,
      "estimatedCoveredAmount": 226000,
      "potentialNonCoveredAmount": 14000,
      "proportionateDeductionPenalty": 0,
      "indicativePatientExposure": 14000,
      "costComponents": [...]
    }
    ```

---

## 6. AI & RAG API (`/api/ai`)

- `POST /api/ai/explain`: Natural language plain-English explanation for a hospital match result.
- `POST /api/ai/questions`: Context-aware questions for Billing, TPA, and Nursing desks.
- `POST /api/ai/rag/query`:
  - **Request**: `{ "query": "Is robotic knee surgery covered?", "policy_id": "pol-syn-ananya" }`
  - **Response**:
    ```json
    {
      "query": "Is robotic knee surgery covered?",
      "answer": "According to Star Comprehensive Health Insurance (Clause 6.12, Page 11)...",
      "confidence": "HIGH",
      "citations": [
        { "pageNumber": 11, "sectionTitle": "Clause 6.12", "quoteExcerpt": "..." }
      ],
      "disclaimer": "..."
    }
    ```

---

## 7. Scenarios API (`/api/scenarios`)

- `GET /api/scenarios`: List all 11 preconfigured persona scenarios.
- `POST /api/scenarios/:id/load`: Instantly activate a target scenario state for presentations.
