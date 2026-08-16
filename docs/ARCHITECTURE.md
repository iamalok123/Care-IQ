# CareIQ — System Architecture Blueprint

CareIQ follows a clean, layered architecture ensuring strict separation between user interface, deterministic business logic, AI explanation/RAG pipelines, and data stores.

---

## 1. High-Level Architectural Flow

```text
                           ┌──────────────────────────────┐
                           │      CAREGIVER / USER        │
                           └──────────────┬───────────────┘
                                          │
                                   HTTPS / REST
                                          │
                     ┌────────────────────▼────────────────────┐
                     │          FRONTEND (React + Vite)        │
                     │  - Dashboard & Active Patient Context   │
                     │  - Insurance View & Document Upload     │
                     │  - Hospital Matcher & Ranked Cards      │
                     │  - Care Journey 6-Stage Timeline        │
                     │  - Cost Breakdown & Exposure Calculator │
                     │  - Verification Center Checklist        │
                     │  - Policy RAG Assistant (Q&A)           │
                     └────────────────────┬────────────────────┘
                                          │
                                      REST APIs
                                          │
                     ┌────────────────────▼────────────────────┐
                     │         BACKEND (Node.js + TS)          │
                     │  - /api/patients    - /api/hospitals    │
                     │  - /api/policies    - /api/cost         │
                     │  - /api/documents   - /api/journeys     │
                     │  - /api/ai          - /api/scenarios    │
                     └─────────┬───────────────────┬───────────┘
                               │                   │
             ┌─────────────────▼──┐             ┌──▼──────────────────┐
             │ INTELLIGENCE LAYER │             │      AI LAYER       │
             │ - Rules Engine     │             │ - Policy Extractor  │
             │ - Matching Engine  │             │ - Explanation Engine│
             │ - Cost Engine      │             │ - RAG Vector Search │
             │ - Journey Engine   │             │ - Question Engine   │
             └─────────────────┬──┘             └──┬──────────────────┘
                               │                   │
                               └─────────┬─────────┘
                                         │
                        ┌────────────────▼────────────────┐
                        │      DATA REPOSITORY (Store)    │
                        │ - Cleaned Master Reference Data │
                        │ - Deterministic Synthetic Seeds │
                        │ - Provenance & Verification Logs│
                        │ - File Storage (/uploads)       │
                        └─────────────────────────────────┘
```

---

## 2. Layer Responsibilities

### Layer 1: Presentation (React 19 + Tailwind CSS)
- **Zero Business Logic Rule**: The UI never directly calculates proportionate deductions or cashless eligibility. It renders responses calculated by backend engines.
- **Auditable Citations**: Surfaces quote cards and source page badges for all AI extracted values.

### Layer 2: API Gateway & Routing (Express 5 + TypeScript)
- Strict request validation via **Zod schemas**.
- Uniform response wrappers: `{ success: true, data: T, meta?: any }` or `{ success: false, error: { code, message } }`.

### Layer 3: Deterministic Intelligence Layer
- **Matching Engine**: Evaluates hospitals across 5 dimensions (Network, Room Category, Services, ICU, Cost).
- **Cost Engine**: Computes typical gross charges, covered items, proportionate deduction penalties, and non-payable consumables exposure.
- **Rules Engine & Journey Tracker**: Evaluates timeline events and generates targeted verification flags.

### Layer 4: AI & RAG Subsystem
- **Policy Extraction Engine**: Parses uploaded policy documents and structures them with citation grounding.
- **Document RAG Engine**: Performs in-memory tokenization, TF-IDF vector indexing, and cosine similarity search across policy clauses.
- **AI Explanation Engine**: Transforms complex tariff math and network findings into concise, plain-English summaries.

### Layer 5: Data & Provenance Layer
- Centralized in `dataRepository.ts`.
- Every entity embeds `DataProvenance`: `data_status`, `verification_status`, `confidence`, `source_id`, `created_at`, `updated_at`.
