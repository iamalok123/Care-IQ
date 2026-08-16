# CareIQ

CareIQ is an insurance-aware care navigation platform designed for patients and caregivers. It consolidates policy details, hospital networks, procedure estimates, and care journeys into an intuitive decision-support system.

## Project Structure

```text
CareIQ/
├── backend/    # Node.js + TypeScript Express REST API
└── frontend/   # React + TypeScript + Vite frontend
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm / yarn / pnpm

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server runs on `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend development server runs on `http://localhost:5173`.

## Environment Variables

Copy `.env.example` to `.env` in both `backend` and `frontend` subdirectories before running the application.

```bash
cp backend/.env.example backend/.env
```
