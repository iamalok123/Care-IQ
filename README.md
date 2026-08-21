# 🏥 CareIQ — Insurance-Aware Hospital Care Navigation Platform

> **GE HealthCare Precision Care Challenge 2026**  
> **Problem Statement**: *Hospitality: Holistic Optimization System for Policy-Integrated Admission & Treatment Intelligence*  
> **Tagline**: *Coverage-Aware Hospital Care Navigation & Decision Support for Patients & Caregivers*

---

## 📌 Executive Summary

Healthcare admissions in India are fraught with administrative anxiety. While over 70% of urban families hold private health insurance, employer covers, or government schemes (such as Ayushman Bharat PM-JAY, ESI, or Arogya Karnataka), less than 15% understand their exact policy limits prior to hospitalization.

During medical emergencies, caregivers are forced to interpret 40-page legal policy documents while simultaneously comforting the patient. Critical administrative questions are answered too late:
- *Is this hospital truly in-network for cashless admission?*
- *What happens to doctor and surgery fees if we choose a Single Private AC room over a Shared Room?*
- *Which pre-admission diagnostic tests are covered under pre-hospitalization clauses?*
- *What portion of surgical consumables, implants, and PPE kits must be paid out-of-pocket?*

**CareIQ** is a unified, India-specific decision-support platform that transforms health insurance from a source of post-discharge financial shock into an active, protective navigator throughout the hospital care journey.

---

## 🌟 Key Product Features & Modules

### 1. 📊 Interactive Decision Dashboard
- **Patient Context Header**: Switch between active patient profiles and city contexts (e.g. Ananya Sharma, Bengaluru).
- **Demo Persona Loader**: Instantly test 11 preconfigured persona scenarios (In-network Cashless, Room Mismatch, Ayushman PM-JAY, etc.).
- **Classical Left Navigation Sidebar**: Quick navigation across all 6 core dashboard views with real-time pending verification badges.
- **Top Financial & Care Overview**: Visualizes active policy status, sum insured, room rent limits, active hospital journey, and active verification guardrails.

### 2. 📄 Policy Ingestion & AI Extraction Engine
- **Multi-Format Upload**: Upload insurance policy booklets and schedules (PDF, PNG, JPG, TXT) with SHA-256 cryptographic checksums.
- **Automated Extraction**: Uses AI to extract structured policy parameters:
  - Base Sum Insured & No-Claim Bonus (NCB)
  - Room Rent Caps (% of Sum Insured or Daily Limit) & ICU Caps
  - Copayment Percentage & Pre/Post Hospitalization Days
  - Pre-Existing Diseases (PED) Waiting Period (months)
  - Specific Disease Sub-limits & Exclusions
- **Evidence Provenance & Review**: Shows exact verbatim quotation evidence and page citations (`source_page`) with human-in-the-loop review before locking rules into patient context.

### 3. 🏥 Multi-Factor Hospital Matching & Alignment Scoring
- **Deterministic 5-Factor Scoring Model**:
  1. **Network Status (35%)**: In-network Cashless (100 pts), Reimbursement/Unknown (50 pts), Out-of-network (0 pts).
  2. **Room Compatibility (25%)**: Room tariff fully within policy cap (100 pts), Room tariff exceeds limit triggering proportionate deduction penalty (30 pts).
  3. **Clinical Specialty Availability (15%)**: Department match for required procedure.
  4. **24x7 Critical Care Readiness (10%)**: ICU & Emergency care infrastructure.
  5. **Cost Alignment & Tariff Headroom (15%)**: Estimated gross treatment cost fits within remaining sum insured.
- **Transparent Reasoning Badges**: Highlights positive matches, warnings (e.g. *Room Rent Exceeded — 15% Proportionate Penalty Applies*), and actionable verification items.

### 4. 🗺️ Interactive 6-Stage Care Journey Timeline
- **Stage Trajectory**: `Admission` ➔ `Investigation` ➔ `Procedure` ➔ `Recovery` ➔ `Discharge` ➔ `Claim Support`.
- **Real-Time Trigger Checks**: Evaluates policy rules at each milestone (e.g., pre-authorization submission window, diagnostic bill retention, discharge summary verification).
- **Caregiver Guidance**: Provides clear action items, required documents, and milestone checklist items.

### 5. 💰 Transparent Cost Breakdown & Exposure Calculator
- **Itemized Financial Exposure**: Gross estimated treatment bill vs. estimated insurance coverage vs. estimated out-of-pocket payment.
- **Proportionate Deduction Penalty Engine**: Automatically calculates proportionate reduction penalties on associate medical expenses (doctor fees, OT charges) when an eligible room category is exceeded.
- **Consumables Breakdown**: Identifies non-payable medical items (gloves, PPE kits, surgical disposables) typically excluded from claims.

### 6. 🛡️ Actionable Verification Center
- **Pre-Admission Guardrail Checklist**: Identifies critical verification items (*"Things you should verify before you rely"*).
- **Categorized Verification Items**: Categorized into `PREAUTH`, `ROOM`, `COST`, `DOCUMENT`, and `NETWORK`.
- **Status Management**: Mark items as resolved or open with clear rationale for hospital TPA desks.

### 7. 🤖 Contextual AI Explanations & Questions-to-Ask Generator
- **Caregiver-Friendly Explanations**: Translates complex insurance math (copayments, sublimits, proportionate deductions) into plain, reassuring English.
- **Targeted Questions Generator**: Provides exact copyable questions for:
  - Hospital Billing Desk
  - TPA Insurance Desk
  - Nursing & Administration

### 8. 🔍 Policy Document Vector RAG Search
- **Semantic Clause Search**: In-memory TF-IDF and cosine similarity vector search across uploaded policy documents.
- **Grounded Responses**: Generates AI answers backed by exact clause numbers, section titles, and verbatim text quotes.

### 9. 🧪 AI Safety & Benchmark Evaluation Suite
- **Automated Harness**: Includes an automated evaluation harness testing 6 core safety scenarios with **0.0% Hallucination Rate** and **100% Evidence Grounding**.

---

## 🏛️ System Architecture

```text
CAREIQ PLATFORM ARCHITECTURE
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                               FRONTEND LAYER                                     │
 │  React 19 + Vite + TypeScript + Tailwind CSS                                      │
 │                                                                                  │
 │  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────┐  │
 │  │ Left Sidebar │  │ Top Header Navbar│  │ Dynamic Views     │  │ AI Modals   │  │
 │  │ (Navigation) │  │ (Persona/Patient)│  │ (Dashboard, Match)│  │ (RAG/Q&A)   │  │
 │  └──────────────┘  └──────────────────┘  └───────────────────┘  └─────────────┘  │
 └─────────────────────────────────────────┬────────────────────────────────────────┘
                                           │ REST API (JSON)
 ┌─────────────────────────────────────────▼────────────────────────────────────────┐
 │                               BACKEND LAYER                                      │
 │  Node.js + Express 5 + TypeScript                                                │
 │                                                                                  │
 │  ┌────────────────────────────────────────────────────────────────────────────┐  │
 │  │ CORE INTELLIGENCE ENGINES                                                  │  │
 │  │  • Policy Rules Engine      • Hospital Matching Engine (5-Factor)          │  │
 │  │  • Cost & Exposure Engine   • Care Journey State Machine                   │  │
 │  └────────────────────────────────────────────────────────────────────────────┘  │
 │  ┌────────────────────────────────────────────────────────────────────────────┐  │
 │  │ AI & RAG LAYER                                                             │  │
 │  │  • Policy Extraction Engine  • Explanation Engine                          │  │
 │  │  • Questions Generator       • Vector RAG Engine (TF-IDF Cosine Similarity)│  │
 │  └────────────────────────────────────────────────────────────────────────────┘  │
 │  ┌────────────────────────────────────────────────────────────────────────────┐  │
 │  │ REPOSITORY LAYER                                                           │  │
 │  │  • Patients Data  • Policies Data  • Hospitals Data  • Scenarios Engine    │  │
 │  └────────────────────────────────────────────────────────────────────────────┘  │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```text
CareIQ/
├── frontend/                     # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── components/           # UI Views & Components
│   │   │   ├── Sidebar.tsx       # Classical Fixed Left Navigation Sidebar
│   │   │   ├── Navbar.tsx        # Top Header Bar with Persona/Patient Controls
│   │   │   ├── Dashboard.tsx     # Overview Dashboard View
│   │   │   ├── HospitalMatchView.tsx # 5-Factor Hospital Matcher
│   │   │   ├── InsuranceView.tsx # Policy Management & Extraction Upload
│   │   │   ├── CareJourneyView.tsx # 6-Stage Interactive Timeline
│   │   │   ├── CostBreakdownView.tsx # Financial Exposure & Deductions
│   │   │   ├── VerificationCenter.tsx # Pre-admission Guardrails Checklist
│   │   │   ├── PolicyRagAssistant.tsx # Vector Search Assistant
│   │   │   ├── AiQuestionsModal.tsx   # Targeted TPA Questions Modal
│   │   │   └── ExtractionReviewModal.tsx # Document Extraction Review
│   │   ├── services/
│   │   │   └── api.ts            # Frontend REST API Service Client
│   │   ├── App.tsx               # Main Layout Container & State
│   │   ├── App.css               # Application Styles
│   │   └── main.tsx              # Application Entrypoint
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/          # Request Handlers & API Controllers
│   │   ├── services/             # Core Intelligence & AI Service Engines
│   │   │   ├── policyRulesEngine.ts    # Policy Constraints & Deductions
│   │   │   ├── hospitalMatchEngine.ts  # 5-Factor Matching & Scoring
│   │   │   ├── costEngine.ts           # Gross vs Covered Cost Calculator
│   │   │   ├── journeyEngine.ts        # 6-Stage Care Trajectory Engine
│   │   │   ├── aiPolicyExtractor.ts    # Document Structuring & Evidence
│   │   │   ├── aiExplanationEngine.ts  # Plain Language Explanations
│   │   │   ├── aiVectorRag.ts          # Policy Clause Vector RAG Search
│   │   │   ├── aiQuestionsGenerator.ts # Targeted TPA Questions
│   │   │   └── aiEvaluationHarness.ts  # Benchmark Evaluation Suite
│   │   ├── routes/               # Express API Route Declarations
│   │   ├── data/                 # Seed Master Reference Data & Scenarios
│   │   └── server.ts             # Express Server Initialization
│   ├── tests/                    # Core Unit & Integration Test Suites
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                         # Comprehensive Product Documentation
    ├── PRODUCT_VISION.md         # Product Strategic Charter
    ├── ARCHITECTURE.md           # System Architecture & Component Design
    ├── DOMAIN_MODEL.md           # Domain Models & Business Logic
    ├── API_CONTRACT.md           # REST API Endpoint Specifications
    ├── DEMO_SCENARIOS.md         # 11 Synthetic Persona Specifications
    └── AI_EVALUATION_REPORT.md   # AI Safety & Benchmark Report
```

---

## 🛠️ Tech Stack & Technologies Used

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js (v18+), Express 5, TypeScript, Multer, Crypto
- **AI & RAG**: In-memory TF-IDF Cosine Similarity Vector Search, Automated Grounding & Hallucination Evaluation Harness
- **Testing & Tooling**: Vitest, tsx, ESLint

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Set Up Backend

```bash
cd backend
npm install
npm run dev
```
The backend Express server will start on **`http://localhost:5000`**.

### 2. Set Up Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
The frontend Vite application will start on **`http://localhost:5173`**.

---

## 🧪 Database Management & Test Execution

From the `backend/` directory:

```bash
# 1. Run Unit & Integration Test Suite
npm test

# 2. Run Comprehensive 14-Scenario Matrix Suite
npm run test:matrix

# 3. Check Supabase Database Status & Migration History
npm run db:status

# 4. Run Pending Database Migrations
npm run db:migrate

# 5. Seed / Reset Master Data & Persona Scenarios into Database
npm run db:seed

# 6. Verify 100% Supabase PostgreSQL Data Parity
npm run verify:supabase

# 7. Run AI Safety & Evaluation Benchmark Suite
npm run test:eval
```

---

## 📋 Preconfigured Persona Scenarios

CareIQ includes **11 preconfigured synthetic scenarios** accessible via the **Demo Persona** dropdown:

| Scenario ID | Persona Name | Key Insurance / Admission Condition | Primary Decision Support Outcome |
| :--- | :--- | :--- | :--- |
| `sc-01` | **Ananya Sharma** | Star Health Comprehensive • Total Knee Replacement • In-Network | 100% Cashless approval pre-auth match. Zero out-of-pocket exposure. |
| `sc-02` | **Rahul Mehta** | HDFC ERGO Optima Secure • Single Private AC Room chosen over Shared Room cap | Proportionate deduction penalty alert on OT & Surgeon fees. |
| `sc-03` | **Rajesh Kumar** | Care Health Care Advantage • Network status UNKNOWN at city hospital | Actionable TPA verification items generated before admission. |
| `sc-04` | **Priya Patel** | ICICI Lombard Health Care • Emergency admission with pending pre-auth | Emergency cashless protocol & 24h pre-auth submission checklist. |
| `sc-05` | **Vikram Singh** | Niva Bupa Health Companion • Robotic Surgery sublimit & Consumables | Sublimit cap alert & itemized non-payable consumable breakdown. |
| `sc-08` | **Ramesh Kumar** | Ayushman Bharat PM-JAY • Empaneled Public/Private Hospital | 100% Cashless package validation under PM-JAY scheme rules. |

---

## 📡 Key API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/patients` | Retrieve list of patient profiles |
| `GET` | `/api/policies` | Retrieve policies for active patient |
| `POST` | `/api/policies/upload` | Upload policy PDF/image document for AI extraction |
| `GET` | `/api/hospitals/match` | Get ranked 5-factor hospital matches for active patient |
| `GET` | `/api/journeys` | Retrieve 6-stage care journey timeline |
| `POST` | `/api/journeys` | Initiate new hospital care journey |
| `GET` | `/api/verifications` | Retrieve actionable verification guardrail items |
| `PATCH` | `/api/verifications/:id` | Resolve or update verification item status |
| `POST` | `/api/ai/rag-search` | Perform vector RAG search across policy documents |
| `POST` | `/api/scenarios/load` | Load preconfigured demo persona scenario |

---

## 🛡️ Non-Clinical Safety & Ethical Disclaimer

> **CareIQ is strictly an administrative, financial, and insurance decision-support platform.**
> - CareIQ does not diagnose medical conditions, prescribe medications, or dictate clinical treatment pathways.
> - All cost estimates, coverage percentages, and tariff calculations are indicative and must be confirmed with the respective hospital billing and TPA insurance desks.
> - Demonstrations run strictly on synthetic, non-identifiable persona data.

---

## 📜 License & Challenge Details

Built for the **GE HealthCare Precision Care Challenge 2026**.  
Non-clinical decision support software designed for caregiver empowerment.
