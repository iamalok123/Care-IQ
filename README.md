# 🏥 CareIQ — Coverage-Aware Hospital Care Navigation Platform

[![GE HealthCare Precision Care Challenge 2026](https://img.shields.io/badge/GE%20HealthCare-Precision%20Care%20Challenge%202026-0284c7.svg)](https://github.com/iamalok123/Care-IQ)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express 5](https://img.shields.io/badge/Express-5.2-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285f4.svg?logo=google&logoColor=white)](https://ai.google.dev/)

> **GE HealthCare - Precision Care Challenge 2026** — *Hospitality: Holistic Optimization System for Policy-Integrated Admission & Treatment Intelligence*  
> An India-specific decision-support platform bridging health insurance constraints with hospital capabilities and real-time treatment tracking.


---

## 📌 Problem & Solution Overview

In India, over **70% of urban families** hold private health insurance or government schemes (*PM-JAY, ESI, State Schemes*), yet **fewer than 15% understand policy limits prior to hospitalization**. This leads to severe billing shocks:
- **Proportionate Deductions**: Exceeding room caps triggers up to 50% penalties on doctor fees, OT charges, and diagnostics.
- **Cashless vs. Reimbursement Ambiguity**: Unconfirmed network empanelment forces unexpected out-of-pocket expenses.
- **Consumables & PED Clauses**: Undisclosed non-payable items and hidden pre-existing disease waiting periods.

**CareIQ** eliminates surprises through a **deterministic calculation engine** combined with **verifiable, zero-hallucination AI** for stress-free hospital navigation.

---

## 🚀 Key Features & Capabilities

### 1. 📊 Executive Care Dashboard & Patient Hub (`/` or `/dashboard`)
- **Real-Time Patient Context**: Switch between multiple patient profiles, track blood group, PED history, vitals, and active prescriptions.
- **Financial Metric Cards**: Live telemetry on Base Cover, Cashless Status, Estimated Out-of-Pocket, and Room Rent Caps.
- **Coverage Allocation Dial & Progress Tracker**: Visual sum-insured utilization and interactive 5-stage care progress checkpoints.

### 2. 🏥 5-Factor Hospital Matching Engine (`/hospital-matcher`)
- **Weighted Multi-Factor Scoring**: Evaluates Cashless Network Status (35%), Room Tariff Fit (25%), Department Specialty (15%), 24x7 Critical Care/NABH (10%), and Cost Headroom (15%).
- **Side-by-Side Comparison**: Compare infrastructure, room tiers, and tariffs across candidate hospitals.
- **"What to Ask Desk" Tool**: Generates tailored pre-admission inquiry scripts for TPA & billing counters.

### 3. 📄 Policy OCR & Extraction Engine (`/insurance`)
- **Multi-Format Ingestion**: Upload PDF, PNG, JPG, or TXT policy documents with SHA-256 integrity verification.
- **Grounded Clause Extraction**: Gemini 2.0 Flash extracts Sum Insured, Room/ICU caps, Copay, PED waiting windows, and sub-limits.
- **Human-in-the-Loop Verification**: Review extracted data with side-by-side verbatim clause evidence before saving.

### 4. 🗺️ 5-Stage Trajectory & Stage Guidance (`/care-journey`)
- **Full Admission Lifecycle**: Step-by-step guidance across `ADMISSION` ➔ `INVESTIGATION` ➔ `PROCEDURE` ➔ `RECOVERY` ➔ `DISCHARGE`.
- **Phase Kits & Action Items**: Context-aware checklists, required document packets, and proactive claim alerts at each milestone.

### 5. 💰 Cost Calculator & Room Upgrade Simulator (`/costs`)
- **Itemized Billing Engine**: Predicts room rent, surgeon/OT fees, anesthetist charges, pharmacy, consumables, and labs.
- **Proportionate Deduction Formula**:
  $$\text{Eligible Medical Expense} = \text{Billed Charge} \times \min\left(1, \frac{\text{Eligible Room Limit}}{\text{Actual Room Rent}}\right)$$
- **"What-If" Room Upgrade Simulator**: Visualizes out-of-pocket exposure across Twin Sharing, Single Private, and Deluxe Suites.

### 6. 🛡️ Verification Center & Policy Copilot (`/verification-center`)
- **Pre-Admission Checkpoints**: Systematic pre-authorization codes, network validation, and PED clause verification.
- **Floating Policy Copilot**: Grounded vector RAG assistant answering policy queries with direct clause citations and fallback to `UNKNOWN` on missing data.

### 7. 🎭 Preloaded Demonstration Personas (`/demo`)
- **Rajesh Verma (55 M, Mumbai)**: Ayushman Bharat PM-JAY (₹5L) — Total Knee Replacement at KEM Hospital.
- **Ananya Sharma (34 F, Bengaluru)**: Star Health Optima (₹10L) — Emergency Laparoscopic Appendectomy.
- **Vikram Malhotra (62 M, Delhi NCR)**: HDFC ERGO Optima Restore (₹15L) — Coronary Angioplasty (PTCA).

---

## 🏗️ Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: React 19 • Vite 8 • Tailwind CSS v4 • Lucide Icons • 3D CSS Loader           │
│ Views: Dashboard • Hospital Matcher • Insurance Vault • Care Journey • Costs • Copilot │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST API (JSON / HTTP)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│ BACKEND: Node.js • Express 5 • TypeScript • Zod Validation • Google Gemini 2.0 Flash   │
│ Services: Matching Engine • Cost & Deduction Engine • Policy OCR • Vector RAG Engine   │
│ Database: Supabase PostgreSQL (Dual-mode: Cloud Database + In-Memory Fallback)         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` & `/api/auth/login` | User registration and JWT authentication |
| `GET` | `/api/auth/me` | Retrieve current user profile and patient context |
| `GET` | `/api/hospitals/match` | Compute 5-factor hospital rankings and cost estimates |
| `POST` | `/api/documents/upload` | Upload insurance policy and run Gemini OCR extraction |
| `POST` | `/api/documents/confirm-extraction` | Save human-verified policy limits and clauses |
| `POST` | `/api/costs/breakdown` | Calculate itemized expenses and proportionate deductions |
| `POST` | `/api/ai/policy-query` | Query vector RAG with verbatim clause citations |
| `GET` | `/api/journeys/active` | Fetch active care stage, checklists, and guidance kits |

---

## 🛡️ AI Grounding & Guardrails

- **Zero Hallucination**: AI responses strictly reference extracted policy clauses. Missing terms default to `UNKNOWN`.
- **Non-Clinical Boundary**: Non-medical advisory guardrail blocks diagnostic advice and redirects to qualified practitioners.
- **Deterministic Math**: Financial computations and proportionate deductions run on explicit mathematical rules, not LLM guesses.

---

## 📂 Project Structure

```text
CareIQ/
├── frontend/                     # React 19 + Vite 8 SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # 3D Isometric Loader, Badges, Stat Cards
│   │   │   ├── layout/           # AppLayout, Sidebar, MobileTabBar, Floating Copilot
│   │   │   ├── modals/           # ExtractionReviewModal, AiQuestionsModal, CompareModal
│   │   │   ├── views/            # Dashboard, HospitalMatch, Insurance, CareJourney, Costs...
│   │   │   └── widgets/          # PolicyRagAssistant, StageGuidanceCard, CostBreakdown
│   │   ├── context/              # AuthContext, CareIqContext (Global State)
│   │   └── services/             # Typed API Client
├── backend/                      # Node.js + Express 5 + TypeScript API
│   ├── src/
│   │   ├── controllers/          # authController, hospitalController, costController...
│   │   ├── services/             # matchingEngine, costEngine, geminiService, documentRagEngine
│   │   ├── db/                   # supabaseClient, migrations, seedProductionData
│   │   └── scripts/              # testScenarioMatrix, benchmarkHarness
└── supabase/migrations/          # PostgreSQL schemas, RLS security policies, and indexes
```

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js 18+** & **npm**
- **Google Gemini API Key** (for OCR and Policy RAG Assistant)
- **Supabase Account** (optional — runs with built-in in-memory repository if not configured)

### 2. Environment Setup

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Installation & Run

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Seed database (optional if using Supabase)
cd ../backend && npx tsx src/scripts/seedProductionData.ts

# 3. Start development servers
# Terminal 1 (Backend - Port 5000):
npm run dev

# Terminal 2 (Frontend - Port 5173):
cd ../frontend && npm run dev
```

---

## 📜 License & Compliance

Built for the **GE HealthCare Precision Care Challenge 2026**.  
Licensed under the [MIT License](LICENSE).
