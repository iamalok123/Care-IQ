# CareIQ - Current Repository State Audit (Phase 00)

**Date**: 2026-08-16  
**Auditor**: CareIQ Agent  

## Executive Summary
This document records the baseline state of the CareIQ codebase prior to starting Phase 01 implementation.

## Project Structure Overview

```text
CareIQ/
├── backend/
│   ├── src/
│   │   └── index.ts          # Minimal Express server with /api/health endpoint
│   ├── package.json          # Express 5, Cors, Dotenv, TSX
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # React + Vite default starter template
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── App.css
│   ├── package.json          # React 19, Vite, TypeScript
│   └── vite.config.ts
├── build.md                  # Master specification & phase playbook (4,853 lines)
├── ps.md                     # Precision Care Challenge 2026 Problem Statement
└── README.md
```

## Existing Functionality & Audit Findings

1. **Backend**:
   - Running on Node.js / Express 5 with TypeScript (`tsx watch`).
   - Single route `/api/health` returning basic health check status.
   - Missing domain models, database connections, schemas, rules engines, or synthetic data seeds.

2. **Frontend**:
   - Vite + React + TypeScript setup with standard boilerplates.
   - Missing routing, UI component libraries, domain features (Insurance, Hospitals, Care Journey, Costs, Verification).

3. **Data Infrastructure**:
   - No data contracts, JSON schemas, master reference tables, or synthetic generator pipelines created yet.

## Action Plan (Phase 01 - Phase 04)
- Establish target directory structure for schemas, reference data, synthetic data, and documentation.
- Implement comprehensive TypeScript domain types and Zod schemas in `backend/src/types/domain.ts` and `backend/src/schemas/zodSchemas.ts`.
- Build JSON Schema definitions for key entities (`policy`, `hospital`, `journey`).
- Build data provenance helpers in `backend/src/models/provenance.ts`.
- Seed deterministic master reference data for India-specific insurers/schemes, specialties, hospital services, room category rankings, and medical procedures.
