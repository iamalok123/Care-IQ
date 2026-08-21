# 🏥 CareIQ — Coverage-Aware Hospital Care Navigation & Decision Support Platform

[![GE HealthCare Precision Care Challenge 2026](https://img.shields.io/badge/GE%20HealthCare-Precision%20Care%20Challenge%202026-0284c7.svg)](https://github.com/iamalok123/Care-IQ)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%2F%207.x-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-5.2-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285f4.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **GE HealthCare Precision Care Challenge 2026**  
> **Problem Statement**: *Hospitality: Holistic Optimization System for Policy-Integrated Admission & Treatment Intelligence*  
> **Tagline**: *Transforming health insurance from a source of post-discharge financial shock into an active, protective navigator throughout the hospital care journey.*

---

## 📌 Executive Summary & Context

Healthcare admissions in India are fraught with administrative anxiety. While over **70% of urban families** hold private health insurance, corporate group cover, or government health schemes (*Ayushman Bharat PM-JAY, ESI, Arogya Karnataka*), **less than 15% understand their policy limits prior to hospitalization**.

During planned procedures or medical emergencies, caregivers are forced to interpret 40-page legal policy documents while simultaneously comforting the patient. Critical questions are typically discovered too late at the billing counter:
- **Cashless vs. Reimbursement Confusion**: *Is this hospital truly empanelled for cashless admission, or will we be forced to pay out-of-pocket and fight for reimbursement later?*
- **The Room Rent Proportionate Deduction Trap**: *If we choose a Single Private Room (₹6,000/day) when our policy caps room rent at 1% of Sum Insured (₹3,000/day), will our surgeon and OT charges also be penalized by 50%?*
- **Consumable & Non-Payable Exclusions**: *What portion of surgical gloves, PPE kits, disposables, and implants are excluded from insurance coverage?*
- **Pre & Post-Hospitalization Windows**: *Which pre-admission diagnostic scans and post-discharge medications are eligible for claim reimbursement?*

**CareIQ** is a deterministic, AI-grounded care navigation platform specifically architected for the Indian healthcare ecosystem. It bridges the critical divide between complex insurance policy terms, hospital room tariffs, and caregiver decision-making.

---

## 🌟 Core System Innovations & Value Pillars

```
                     ┌─────────────────────────────────────────────────────────┐
                     │                 CareIQ Value Pillars                    │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
         ┌────────────────────────────────────────┼────────────────────────────────────────┐
         │                                        │                                        │
┌────────▼────────┐                     ┌─────────▼────────────┐                 ┌─────────▼────────┐
│  Deterministic  │                     │   Zero-Hallucination │                 │ Dual-Repository  │
│   Calculation   │                     │   Grounded AI RAG    │                 │   Architecture   │
├─────────────────┤                     ├──────────────────────┤                 ├──────────────────┤
│ 100% auditable  │                     │ Semantic clause      │                 │ Supabase Postgre-│
│ math on room    │                     │ retrieval, verbatim  │                 │ SQL + in-memory  │
│ caps, deductions│                     │ quotes, and citation │                 │ fallback for zero│
│ & out-of-pocket │                     │ grounding (0% error) │                 │ external lock-in │
└─────────────────┘                     └──────────────────────┘                 └──────────────────┘
```

1. **Deterministic Core + Auditable Intelligence**: All financial calculations (proportionate penalties, co-payments, sub-limits, out-of-pocket estimates) are executed by deterministic mathematical rule engines. Generative AI is strictly restricted to plain-English explanations, question generation, and grounded clause extraction.
2. **"Uncertainty is Not Falsehood" Principle**: If an insurance network status or room limit is unconfirmed, CareIQ assigns an explicit `UNKNOWN` status and generates actionable verification checklists rather than making dangerous assumptions.
3. **0.0% Hallucination & 100% Grounding**: Built with an automated AI evaluation harness (`aiEvaluationHarness.ts`) testing 6 safety scenarios with 100% factual grounding and strict adherence to non-clinical boundaries.
4. **Dual Data Architecture**: Operates with a production Supabase PostgreSQL backend with automated schema migrations (`dbCli.ts`) and a seamless in-memory fallback for zero-configuration standalone demos.

---

## 🚀 Key Product Features & Modules

### 1. 📊 Executive Navigation & Overview Dashboard
- **Patient & City Context Switcher**: Seamlessly switch between active patient profiles (*e.g., Ananya Sharma, Bengaluru*) or load synthetic scenarios.
- **Visual Confidence Gauge (`CoverageConfidenceGauge`)**: Instant visual metric representing policy clarity, document completeness, and pre-auth verification status.
- **Top Financial Summary**: At-a-glance visibility into Base Sum Insured, Available Room Rent Cap, Estimated Out-of-Pocket Exposure, and In-Network Hospital Status.
- **Missing Information Prompts (`MissingInfoCard`)**: Proactively flags missing policy parameters (e.g., *Pre-existing condition waiting period unconfirmed*).

### 2. 📄 Policy Ingestion & AI Extraction Engine
- **Multi-Format Ingestion**: Upload health insurance policy booklets, schedules, and cards (PDF, PNG, JPG, TXT) with SHA-256 cryptographic checksums for tamper-proof auditing.
- **Automated Extraction**: Extracts core parameters: Base Sum Insured, NCB, Room Rent Caps (% or daily limit), ICU limits, Copay %, Pre/Post Hospitalization day limits, PED waiting periods, and disease sublimits.
- **Interactive Review Modal (`ExtractionReviewModal`)**: Allows users and caregivers to review extracted terms against original page citations and verbatim text evidence before committing to context.

### 3. 🏥 Deterministic 5-Factor Hospital Matching Engine
Ranks empanelled and regional hospitals using a multi-factor scoring model tailored to Indian healthcare:
- **Network Status (35%)**: In-Network Cashless (100 pts), Reimbursement/Unknown (50 pts), Out-of-Network (0 pts).
- **Room Tariff Compatibility (25%)**: Full compatibility (100 pts), Proportionate deduction penalty risk (30 pts).
- **Clinical Department Match (15%)**: Specialized clinical infrastructure for the required procedure.
- **24x7 Critical Care Infrastructure (10%)**: Level-1 ICU, emergency readiness, and NABH accreditation.
- **Cost & Tariff Alignment (15%)**: Gross estimated package fits within remaining policy headroom.
- **Transparent Reasoning Badges**: Displays positive factors (*Cashless Empanelled*, *Full Room Rent Match*) and clear warning alerts (*Room Rent Exceeded — Proportionate Deduction Applies*).

### 4. ⚖️ Side-by-Side Hospital Comparison Modal (`HospitalCompare`)
- Compare up to 3 candidate hospitals side-by-side.
- Evaluates cashless empanelment, estimated out-of-pocket expenses, room category eligibility, and distance/ICU readiness in a single structured view.

### 5. 🗺️ Interactive 6-Stage Care Journey Timeline
Guides the patient and caregiver step-by-step through the hospitalization trajectory:
```
  [1. Admission] ➔ [2. Investigation] ➔ [3. Procedure] ➔ [4. Recovery] ➔ [5. Discharge] ➔ [6. Claim Support]
```
- **Milestone Trigger Checks**: Evaluates policy rules at each milestone (e.g., 24-hour emergency pre-auth submission window, diagnostic bill retention, discharge summary verification).
- **Stage Guidance Cards (`StageGuidanceCard`)**: Contextual advice, required documents list, and stage-specific checklists for each phase.

### 6. 💰 Itemized Cost Breakdown & Proportionate Deduction Calculator
- **Itemized Bill vs. Covered vs. Out-of-Pocket**: Clear breakdown of Room Rent, Surgeon/OT Charges, Anesthetist Fees, Diagnostic Investigations, and Medications.
- **Proportionate Deduction Penalty Engine**: Automatically calculates penalties on associate medical expenses when a patient chooses a room category above their policy limit.
- **Consumables Breakdown**: Explicitly calculates non-payable medical items (gloves, PPE kits, surgical disposables, syringes) typically excluded from claims.

### 7. 🔮 Interactive "What-If" Admission Simulator (`WhatIfSimulator`)
- Real-time simulation of different admission choices:
  - *What happens if I upgrade from Semi-Private to a Single Deluxe AC room?*
  - *What if I select an alternative in-network hospital vs. an out-of-network clinic?*
  - *What if additional add-on procedures or implants are added to the bill?*
- Instantly visualizes the change in out-of-pocket expenses and proportionate penalty impact.

### 8. 🛡️ Actionable Verification Center (`VerificationCenter`)
- Pre-admission guardrail checklist (*"Verify Before You Rely"*).
- Categorized into `PREAUTH`, `ROOM`, `COST`, `DOCUMENT`, and `NETWORK`.
- Resolve items, track pending queries, and copy pre-written questions directly for the hospital TPA desk.

### 9. 🔍 Policy Document Vector RAG Search (`PolicyRagAssistant`)
- **Semantic Clause Search**: Powered by Google Gemini 2.0/2.5 Flash with fallback to in-memory TF-IDF cosine similarity vector search.
- **Grounded Responses**: Generates AI answers backed by exact clause numbers, section titles, and verbatim text quotes.
- **Interactive Query Chips**: Common queries (*"Is robotic surgery covered?"*, *"What are the cataract sub-limits?"*, *"How does day-care treatment work?"*).

### 10. 🤖 Contextual AI Explanations & Questions Generator (`AiQuestionsModal`)
- Translates legalistic insurance terminology into plain, compassionate English for family members.
- Generates tailored, copyable questions specifically for:
  - **Hospital TPA Desk** (*"Will this pre-auth cover the implant cost under package code X?"*)
  - **Billing Counter** (*"Can you provide an itemized estimate separating consumables from surgeon fees?"*)
  - **Treating Doctor / Nursing Desk** (*"Is the proposed procedure classified as a 24-hour admission or Day-Care?"*)

### 11. 📲 Caregiver Sharing & Summary Mode (`CaregiverShareModal`)
- One-click shareable briefing for family members and caregivers.
- Exports via **WhatsApp**, **SMS**, **Email**, or formatted **Print / PDF**.
- Summarizes the active patient, hospital choice, cashless status, expected out-of-pocket expense, and immediate action items.

### 12. 🚀 Interactive Persona Onboarding Wizard (`OnboardingWizard`)
- Step-by-step guided onboarding workflow for first-time users.
- Allows immediate persona selection, policy document upload, or custom patient profile configuration.

---

## 🏛️ System Architecture

CareIQ follows a clean, modular architecture separating presentation, API routing, deterministic intelligence services, AI RAG retrieval, and repository persistence.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND LAYER                                      │
│  React 19 • Vite 8 • TypeScript • Tailwind CSS v4 • Lucide Icons                       │
│                                                                                        │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐  ┌───────────────────┐  │
│  │ Left Sidebar │  │ Top Header Navbar│  │ Dynamic Views     │  │ AI Modals & Tools │  │
│  │ (Navigation) │  │ (Context/Persona)│  │ (Dashboard, Match,│  │ (RAG Assistant,   │  │
│  │              │  │                  │  │  Journey, Costs)  │  │  Simulator, Share)│  │
│  └──────────────┘  └──────────────────┘  └───────────────────┘  └───────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST API (JSON / HTTP)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                                    BACKEND LAYER                                       │
│  Node.js • Express 5 • TypeScript • Zod Validation Schemas                             │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ CONTROLLERS & API ROUTES                                                         │  │
│  │  • /api/patients    • /api/policies   • /api/hospitals  • /api/journeys          │  │
│  │  • /api/costs       • /api/documents  • /api/ai         • /api/scenarios         │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ CORE DETERMINISTIC INTELLIGENCE ENGINES                                          │  │
│  │  • Policy Rules Engine (rulesEngine.ts)                                          │  │
│  │  • 5-Factor Hospital Matching Engine (matchingEngine.ts)                         │  │
│  │  • Cost Breakdown & Proportionate Deduction Engine (costEngine.ts)               │  │
│  │  • 6-Stage Care Journey State Machine (journeyEngine.ts)                         │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ AI & SEMANTIC RAG LAYER                                                          │  │
│  │  • Gemini Service (geminiService.ts - Google Generative AI 2.0 Flash)            │  │
│  │  • Document Extraction Engine (policyExtractionEngine.ts)                        │  │
│  │  • Vector RAG & Cosine Similarity Search (documentRagEngine.ts)                  │  │
│  │  • AI Plain-Language Explanations & TPA Questions (aiExplanationEngine.ts)       │  │
│  │  • AI Safety & Grounding Benchmark Suite (aiEvaluationHarness.ts)                │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ DUAL-REPOSITORY DATA LAYER                                                       │  │
│  │  • Supabase PostgreSQL Repository (supabaseRepository.ts)                        │  │
│  │  • In-Memory Fallback Repository (dataRepository.ts)                             │  │
│  │  • Automated Migration & CLI Tooling (migrator.ts, seeder.ts, dbCli.ts)          │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```text
CareIQ/
├── frontend/                         # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── components/               # UI Views, Modals & Components
│   │   │   ├── AiQuestionsModal.tsx       # Targeted TPA Questions Modal
│   │   │   ├── CareJourneyView.tsx        # 6-Stage Interactive Timeline
│   │   │   ├── CaregiverShareModal.tsx    # Shareable Briefing Modal (WhatsApp/PDF)
│   │   │   ├── CostBreakdownView.tsx      # Financial Exposure & Deductions
│   │   │   ├── CoverageConfidenceGauge.tsx# Visual Policy Confidence Metric
│   │   │   ├── Dashboard.tsx              # Executive Overview Dashboard
│   │   │   ├── ExtractionReviewModal.tsx  # Document Extraction Review & Citations
│   │   │   ├── HospitalCompare.tsx        # Side-by-Side Hospital Comparison
│   │   │   ├── HospitalMatchView.tsx      # 5-Factor Hospital Matcher
│   │   │   ├── InsuranceView.tsx          # Policy Management & Document Upload
│   │   │   ├── MissingInfoCard.tsx        # Missing Information Prompts
│   │   │   ├── Navbar.tsx                 # Top Header Bar with Persona/Patient Controls
│   │   │   ├── OnboardingWizard.tsx       # Interactive User Onboarding Flow
│   │   │   ├── PolicyRagAssistant.tsx     # Vector Clause Search & Gemini Assistant
│   │   │   ├── Sidebar.tsx                # Classical Fixed Left Navigation Sidebar
│   │   │   ├── StageGuidanceCard.tsx      # Stage-Specific Caregiver Checklist
│   │   │   ├── VerificationCenter.tsx     # Pre-admission Guardrails Checklist
│   │   │   └── WhatIfSimulator.tsx        # Dynamic Admission & Room Simulator
│   │   ├── services/
│   │   │   └── api.ts                # Frontend REST API Service Client
│   │   ├── App.tsx                   # Main Layout Container & Global State
│   │   ├── App.css                   # Tailwind v4 & Application Styles
│   │   └── main.tsx                  # Application Entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                          # Node.js + Express 5 + TypeScript Backend
│   ├── src/
│   │   ├── config/                   # Environment & Configuration Constants
│   │   ├── controllers/              # API Request Handlers
│   │   │   ├── aiController.ts       # AI RAG & Question Endpoints
│   │   │   ├── costController.ts     # Cost & Exposure Endpoints
│   │   │   ├── documentController.ts # Document Ingestion & Extraction Endpoints
│   │   │   ├── hospitalController.ts # Hospital Matching Endpoints
│   │   │   ├── journeyController.ts  # Care Journey Timeline Endpoints
│   │   │   ├── patientController.ts  # Patient Profile Endpoints
│   │   │   ├── policyController.ts   # Insurance Policy Endpoints
│   │   │   ├── scenarioController.ts # Demo Persona Scenario Loader
│   │   │   └── verificationController.ts # Pre-admission Guardrails Endpoints
│   │   ├── db/                       # Database Management & SQL Migrations
│   │   │   ├── dbManager.ts          # Unified Database Connection Manager
│   │   │   ├── migrator.ts           # PostgreSQL Migration Runner
│   │   │   ├── seeder.ts             # Synthetic Master Data Database Seeder
│   │   │   └── migrations/           # Versioned SQL Migration Files
│   │   ├── routes/                   # Express Router Definitions
│   │   ├── schemas/                  # Zod Request & Domain Validation Schemas
│   │   ├── scripts/                  # CLI & Verification Scripts
│   │   │   ├── dbCli.ts              # Database CLI Tool (status, migrate, seed)
│   │   │   ├── runAiEvaluation.ts    # AI Safety & Benchmark Runner
│   │   │   ├── seedSyntheticData.ts  # Standalone Data Seeding Script
│   │   │   ├── testApi.ts            # Automated API Route Test Suite
│   │   │   ├── testScenarioMatrix.ts # 14-Scenario Comprehensive Matrix Test
│   │   │   ├── verifyDemoCriteria.ts # Precision Care Challenge Verification
│   │   │   └── verifySupabaseData.ts # Supabase Data Parity Verification
│   │   ├── services/                 # Core Intelligence & Service Engines
│   │   │   ├── aiEvaluationHarness.ts # AI Benchmark & Evaluation Suite
│   │   │   ├── aiExplanationEngine.ts # Plain-Language Explanations & Questions
│   │   │   ├── costEngine.ts          # Proportionate Deductions & Bills
│   │   │   ├── dataRepository.ts      # In-Memory Repository
│   │   │   ├── documentRagEngine.ts   # Vector Clause Search & RAG
│   │   │   ├── geminiService.ts       # Google Gemini 2.0 Flash Integration
│   │   │   ├── journeyEngine.ts       # 6-Stage Care Journey State Machine
│   │   │   ├── matchingEngine.ts      # Deterministic 5-Factor Matcher
│   │   │   ├── policyExtractionEngine.ts # Policy Parameter Extraction
│   │   │   ├── rulesEngine.ts         # Policy Rules & Constraint Evaluation
│   │   │   └── supabaseRepository.ts  # Supabase PostgreSQL Repository
│   │   ├── types/                    # Core TypeScript Interfaces & Types
│   │   └── index.ts                  # Express Server Entrypoint
│   ├── .env.example                  # Environment Variables Template
│   ├── package.json
│   └── tsconfig.json
│
├── data/                             # Reference & Seed Data
│   ├── cleaned/                      # Normalized Policy & Hospital Reference Data
│   ├── scenarios/                    # Scenario Seed Definitions
│   └── synthetic/                    # Synthetic Patient & Treatment Data
│
└── docs/                             # Comprehensive System Documentation
    ├── PRODUCT_VISION.md             # Strategic Vision & Value Charter
    ├── ARCHITECTURE.md               # System Architecture & Technical Specifications
    ├── DOMAIN_MODEL.md               # Core Data Models & Relationships
    ├── API_CONTRACT.md               # REST API Specifications
    ├── DEMO_SCENARIOS.md             # 11 Synthetic Persona Specifications
    ├── AI_EVALUATION_REPORT.md       # AI Safety & Benchmark Report
    ├── AI_RULES.md                   # AI Behavior & Non-Clinical Safety Rules
    ├── SAFETY_RULES.md               # Clinical & Administrative Safety Constraints
    ├── RECOMMENDATION_LOGIC.md       # 5-Factor Scoring & Matching Algorithms
    ├── DATA_DICTIONARY.md            # Comprehensive Field-Level Data Dictionary
    ├── USER_GUIDE.md                 # End-User Navigation & Operations Guide
    ├── VIDEO_STORYBOARD.md           # 3-Minute Demo Video Walkthrough Script
    ├── PRESENTATION_SCRIPT.md        # Pitch & Presentation Script
    └── IMPLEMENTATION_STATUS.md      # Feature Completeness & Roadmap Status
```

---

## 🛠️ Tech Stack & Technologies

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | **React 19**, **TypeScript 5/7**, **Vite 8**, **Tailwind CSS v4**, **Lucide React Icons** |
| **Backend API** | **Node.js (v18+)**, **Express 5**, **TypeScript**, **Multer** (File Uploads), **Zod** (Validation) |
| **AI & RAG** | **Google Gemini 2.0/2.5 Flash** (`@google/generative-ai`), In-Memory TF-IDF Vector RAG, Cosine Similarity Engine |
| **Database & Persistence** | **Supabase PostgreSQL** (`@supabase/supabase-js`, `pg`), Dual-Repository In-Memory Fallback |
| **Testing & Evaluation** | **Vitest**, **tsx**, Automated AI Grounding Benchmark Harness |

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone & Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create local environment configuration
cp .env.example .env
```

#### Environment Variables Configuration (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DEMO_MODE=true

# Optional: Google Gemini AI API Key (Enables live LLM RAG & Explanations)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Optional: Supabase PostgreSQL Database (Enables persistent cloud DB)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_optional
DB_PASSWORD_SUPABASE=your_database_password_optional
```

> **Note**: If `GEMINI_API_KEY` or `SUPABASE_URL` are omitted, CareIQ automatically falls back to its built-in in-memory TF-IDF RAG engine and in-memory repository with zero disruption!

```bash
# Start backend Express server
npm run dev
```
The backend will be running at **`http://localhost:5000`**.

---

### 2. Set Up Frontend

In a separate terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend Vite development server
npm run dev
```
The frontend application will be running at **`http://localhost:5173`**.

---

## 🧪 Database CLI, Migrations & Test Execution

All database and verification scripts can be executed directly from the `backend/` directory:

```bash
cd backend

# 1. Run Complete API & Route Test Suite
npm test

# 2. Run Comprehensive 14-Scenario Matrix Test Suite
npm run test:matrix

# 3. Check Supabase Database Status & Migration History
npm run db:status

# 4. Run Pending Database Migrations on Supabase PostgreSQL
npm run db:migrate

# 5. Seed / Reset Master Data & Persona Scenarios into Database
npm run db:seed

# 6. Complete End-to-End Database Setup (Migrate + Seed)
npm run db:setup

# 7. Verify 100% Supabase PostgreSQL Data Parity
npm run verify:supabase

# 8. Run AI Safety & Grounding Benchmark Suite
npm run test:eval

# 9. Verify Precision Care Challenge Evaluation Criteria
npm run test:criteria
```

---

## 📋 Catalog of Preconfigured Demo Personas

CareIQ includes **11 deterministic synthetic scenarios** showcasing realistic clinical, insurance, and administrative situations across India:

| ID | Persona | Insurance Scheme | Hospital & City | Procedure | Key Dilemma & Decision Support Outcome |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **`sc-01`** | **Ananya Sharma** | Star Health Comprehensive (₹5L) | Manipal Hospital, Bengaluru | Total Knee Replacement | **In-Network Cashless Match**: 100% Cashless pre-auth match with ₹0 unexpected out-of-pocket expenses. |
| **`sc-02`** | **Rahul Mehta** | HDFC ERGO Optima Secure (₹4L) | Apollo Hospital, Bengaluru | Angioplasty | **Room Rent Mismatch**: Single AC Room chosen over policy limit triggers 50% proportionate penalty on surgeon & OT fees. |
| **`sc-03`** | **Rajesh Kumar** | Care Health Care Advantage (₹7L) | Fortis Hospital, Bengaluru | Inguinal Hernia Repair | **Network Status UNKNOWN**: Preserves uncertain network status and generates targeted verification questions for TPA desk. |
| **`sc-04`** | **Priya Patel** | Niva Bupa Health Companion (₹10L) | Aster CMI, Bengaluru | Laparoscopic Cholecystectomy | **Emergency Pre-Auth Pending**: Triggers 24-hour pre-authorization submission checklist and emergency cashless protocols. |
| **`sc-05`** | **Vikram Singh** | ICICI Lombard Health Care (₹15L) | Sakra World Hospital, Bengaluru | Robotic Prostatectomy | **Sub-Limits & Consumables**: Flags robotic surgery sub-limit caps and breaks down ₹28,000 in non-payable consumable items. |
| **`sc-06`** | **Meera Iyer** | *Custom Document Upload* | *Any City* | *Any Procedure* | **Document Ingestion**: Demonstrates uploading policy PDF/images with SHA-256 checksums and side-by-side OCR review. |
| **`sc-07`** | **Arjun Reddy** | Corporate Cover (₹3L) + Super Top-Up (₹10L) | Narayana Health, Bengaluru | CABG Bypass Surgery | **Multi-Policy Coordination**: Calculates deductible threshold crossover and dual-claim submission sequence. |
| **`sc-08`** | **Ramesh Kumar** | Ayushman Bharat PM-JAY (₹5L) | Bowring Hospital, Bengaluru | Cataract Surgery | **Government Scheme Package**: Validates 100% cashless statutory package rate under PM-JAY with ₹0 out-of-pocket expense. |
| **`sc-09`** | **Sunita Rao** | National Insurance (₹3L) | Manipal Hospital North, Bengaluru | Total Laparoscopic Hysterectomy | **OCR Ambiguity Review**: Demonstrates human-in-the-loop review modal for uncertain policy clauses before locking into context. |
| **`sc-10`** | **Kavita Nair** | Star Health Comprehensive (₹5L) | Non-Empanelled Day Clinic | Knee Arthroscopy | **Out-of-Network Alternative**: Flags reimbursement delay risks and recommends 3 nearby in-network cashless alternatives. |
| **`sc-11`** | **Full Demo Tour** | Star Health Comprehensive (₹5L) | Manipal Hospital, Bengaluru | Total Knee Replacement | **Complete Closed-Loop Tour**: Interactive walk through all 6 core dashboard views, What-If simulator, and RAG Assistant. |

---

## 📡 Key REST API Contract & Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/patients` | Retrieve all active patient profiles |
| `GET` | `/api/patients/:id` | Retrieve patient profile by ID |
| `GET` | `/api/policies` | Retrieve insurance policies for active patient |
| `POST` | `/api/policies/upload` | Upload policy PDF/image document for AI extraction |
| `POST` | `/api/policies/override` | Save human-in-the-loop verified policy parameter overrides |
| `GET` | `/api/hospitals/match` | Get ranked 5-factor hospital matches for active patient |
| `GET` | `/api/journeys` | Retrieve 6-stage care journey timeline and milestone triggers |
| `POST` | `/api/journeys` | Initiate or transition hospital care journey |
| `GET` | `/api/costs/breakdown` | Retrieve itemized financial exposure & proportionate deductions |
| `POST` | `/api/costs/simulate` | Execute "What-If" admission tariff simulation |
| `GET` | `/api/verifications` | Retrieve actionable pre-admission guardrail checklist items |
| `PATCH` | `/api/verifications/:id` | Update status (RESOLVED/OPEN) of verification item |
| `POST` | `/api/ai/rag-search` | Perform grounded vector clause search across policy documents |
| `POST` | `/api/ai/explain` | Generate plain-English explanation for complex insurance terms |
| `POST` | `/api/ai/questions` | Generate targeted questions for hospital TPA / billing desks |
| `POST` | `/api/scenarios/load` | Load preconfigured demo persona scenario |

---

## 📚 Comprehensive Documentation Index

Explore the detailed system architecture, clinical safety rules, and operational specifications in the [`/docs`](file:///c:/Users/LENOVO/Desktop/CareIQ/docs) directory:

- 🏛️ [System Architecture (`docs/ARCHITECTURE.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/ARCHITECTURE.md) — Comprehensive technical architecture, state machines, and microservice components.
- 🎯 [Product Strategic Vision (`docs/PRODUCT_VISION.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/PRODUCT_VISION.md) — Strategic charter, problem statement, and user value propositions.
- 📐 [Domain Models (`docs/DOMAIN_MODEL.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/DOMAIN_MODEL.md) — Entity relationships, database schemas, and business logic.
- 🔌 [API Contract Specifications (`docs/API_CONTRACT.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/API_CONTRACT.md) — Full REST API specifications, request payloads, and response examples.
- 🎭 [Demo Scenarios Catalog (`docs/DEMO_SCENARIOS.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/DEMO_SCENARIOS.md) — Complete specifications for all 11 preconfigured persona scenarios.
- 🧪 [AI Evaluation & Safety Report (`docs/AI_EVALUATION_REPORT.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/AI_EVALUATION_REPORT.md) — Empirical safety benchmarks, hallucination metrics, and grounding evaluation.
- 🛡️ [AI Safety & Grounding Rules (`docs/AI_RULES.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/AI_RULES.md) — Non-clinical safety constraints, prompt engineering rules, and verification bounds.
- ⚖️ [Non-Clinical Safety Constraints (`docs/SAFETY_RULES.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/SAFETY_RULES.md) — Ethical guidelines, data privacy guardrails, and liability boundaries.
- 🧮 [Recommendation & Scoring Logic (`docs/RECOMMENDATION_LOGIC.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/RECOMMENDATION_LOGIC.md) — Mathematical formulation of the 5-factor scoring model and proportionate deductions.
- 📖 [Field-Level Data Dictionary (`docs/DATA_DICTIONARY.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/DATA_DICTIONARY.md) — Exhaustive data dictionary covering all database fields and enum values.
- 👤 [End-User Operations Guide (`docs/USER_GUIDE.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/USER_GUIDE.md) — Visual user guide for patients, caregivers, and hospital coordinators.
- 🎬 [3-Minute Demo Video Script (`docs/VIDEO_STORYBOARD.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/VIDEO_STORYBOARD.md) — Step-by-step storyboard and script for competition video demonstration.
- 🎤 [Presentation & Pitch Script (`docs/PRESENTATION_SCRIPT.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/PRESENTATION_SCRIPT.md) — Presentation deck outline and verbal script for jury presentation.
- 📊 [Implementation & Feature Status (`docs/IMPLEMENTATION_STATUS.md`)](file:///c:/Users/LENOVO/Desktop/CareIQ/docs/IMPLEMENTATION_STATUS.md) — Audit of implemented capabilities, test coverage, and roadmap.

---

## 🛡️ Non-Clinical Safety & Ethical Disclaimer

> **IMPORTANT NOTICE: CareIQ is strictly an administrative, insurance, and financial decision-support tool.**
> - **No Medical Advice**: CareIQ does not diagnose clinical conditions, prescribe medications, or recommend specific medical treatments. All clinical decisions rest exclusively with the treating physician.
> - **Indicative Estimates**: All financial figures, room tariff caps, and coverage estimates are indicative calculations based on available policy terms. Final cashless approval and payable amounts are subject to final settlement by the insurance TPA.
> - **Synthetic Persona Data**: All demonstration profiles (*Ananya Sharma, Rahul Mehta, Ramesh Kumar, etc.*) utilize 100% synthetic, non-identifiable test data.

---

## 📜 Challenge Information & Credits

- **Challenge**: [GE HealthCare Precision Care Challenge 2026](https://github.com/iamalok123/Care-IQ)
- **Track**: *Hospitality: Holistic Optimization System for Policy-Integrated Admission & Treatment Intelligence*
- **Target Ecosystem**: Indian Healthcare & Health Insurance Navigation
- **Repository**: [iamalok123/Care-IQ](https://github.com/iamalok123/Care-IQ)

---

<div align="center">
  <sub>Built with ❤️ for patients and caregivers navigating hospital admissions across India.</sub>
</div>
