# CareIQ — Insurance-Aware Hospital Care Navigation Platform

> **GE HealthCare Precision Care Challenge 2026**  
> **Problem Statement**: *Hospitality: Holistic Optimization System for Policy-Integrated Admission & Treatment Intelligence*  
> **Mission**: Empower patients and caregivers to make informed, real-time hospital decisions using their insurance coverage as a guiding constraint.

---

## 🌟 Key Features

1. **Policy Ingestion & AI Extraction (Phases 11–14)**:
   - File upload (PDF, PNG, JPG, TXT) with SHA-256 checksum tracking.
   - Structured extraction of sum insured, room rent limits, ICU caps, copay %, PED waiting periods, and exclusions.
   - Verbatim quotation evidence with `source_page` citations and human confirmation review.

2. **Hospital Matching & Alignment Scoring (Phases 15–17)**:
   - Deterministic 5-factor matching (Network status, Room compatibility, Specialties/Services, 24x7 Critical Care, Tariff alignment).
   - Clear positive and warning badges with transparent scoring reasons.

3. **Care Journey Tracking (Phases 19–20)**:
   - Interactive 6-stage timeline: `Admission` $\rightarrow$ `Investigation` $\rightarrow$ `Procedure` $\rightarrow$ `Recovery` $\rightarrow$ `Discharge` $\rightarrow$ `Claim Support`.
   - Dynamic policy-aware trigger checks at each care stage.

4. **Transparent Cost Breakdown (Phase 18 & 29)**:
   - Itemized gross cost estimate vs. estimated covered amount.
   - Calculates out-of-pocket exposure for non-payable consumables and proportionate deduction penalties.

5. **Actionable Verification Center (Phases 21 & 30)**:
   - Pre-admission checklist (*"Things you should verify before you rely"*).
   - Preauthorization timing alerts, room mismatch flags, and network desk confirmations.

6. **Contextual AI Explanations & Questions-to-Ask (Phases 22–23)**:
   - Converts complex insurance mathematics into plain, caregiver-friendly explanations.
   - Generates targeted questions for Hospital Billing, TPA Desks, and Nursing Administration.

7. **Policy Document Vector RAG Search (Phase 24)**:
   - In-memory TF-IDF and cosine similarity vector search across policy clauses.
   - Synthesizes grounded answers with explicit page numbers, section headers, and quotation excerpts.

8. **AI Safety & Benchmark Suite (Phase 35)**:
   - Automated evaluation suite validating 6 core safety scenarios with **0.0% Hallucination Rate** and **100% Evidence Grounding**.

---

## 🏛️ System Architecture

```text
CAREIQ
  │
  ├── FRONTEND (React 19 + Vite + Tailwind CSS)
  │    ├── Dashboard (Patient Context & Journey Health)
  │    ├── Insurance View (Policy Normalization & Document Upload)
  │    ├── Hospital Matcher (Ranked Cards & Badges)
  │    ├── Care Journey (6-Stage Interactive Timeline)
  │    ├── Cost Breakdown (Itemized Exposure Calculator)
  │    ├── Verification Center (Pre-admission Checklist)
  │    └── Policy RAG Assistant (Semantic Policy Search)
  │
  ├── BACKEND (Node.js + Express 5 + TypeScript)
  │    ├── Intelligence Layer (Rules, Cost, Matching, Journey Engines)
  │    ├── AI Layer (Policy Extractor, Explanation, RAG, Questions)
  │    └── Data Repository (Master Reference Data & 15 Persona Scenarios)
  │
  └── DOCUMENTATION SUITE (docs/)
       ├── PROJECT_CONTEXT.md  ├── ARCHITECTURE.md
       ├── DOMAIN_MODEL.md     ├── API_CONTRACT.md
       ├── AI_RULES.md         ├── DEMO_SCENARIOS.md
       └── IMPLEMENTATION_STATUS.md
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```
The backend API starts on **`http://localhost:5000`**.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The frontend web application opens on **`http://localhost:5173`**.

---

## 🧪 Testing & Evaluation Commands

Run tests from the `backend/` directory:

```bash
# Run Core Intelligence & Matching Verification Suite
npm test

# Run AI Safety & Evaluation Benchmark Suite (6 Scenarios)
npm run test:eval

# Seed / Reset Deterministic Synthetic Scenarios
npm run seed
```

---

## 📋 Preconfigured Demo Scenarios

CareIQ includes **11 preconfigured persona scenarios** accessible in Demo Mode:
- **Scenario 01 (Ananya Sharma)**: In-Network cashless knee replacement (Star Health).
- **Scenario 02 (Rahul Mehta)**: Room mismatch & proportionate deduction warning.
- **Scenario 03 (Rajesh Kumar)**: Network unknown uncertainty & desk verification.
- **Scenario 04 (Priya Patel)**: Preauthorization pending admission warning.
- **Scenario 05 (Vikram Singh)**: Consumables breakdown & robotic surgery sublimits.
- **Scenario 08 (Ramesh Kumar)**: Ayushman Bharat PM-JAY 100% cashless package.

---

## 🛡️ Non-Clinical Safety Notice

> **CareIQ is an administrative and insurance decision-support platform.**
> - It does not diagnose medical conditions, recommend medical treatments, or make binding insurance claim decisions.
> - All cost estimates and coverage figures are strictly indicative and require confirmation with the respective hospital billing and TPA insurance desks.
