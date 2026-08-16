# CareIQ — Project Context & Problem Statement

**Event**: GE HealthCare Precision Care Challenge 2026  
**Problem Statement**: Hospitality: Holistic Optimization System for Policy-Integrated Admission & Treatment Intelligence  
**Solution Working Name**: **CareIQ**  
**Tagline**: *Insurance-aware care navigation for patients and caregivers.*

---

## 1. Problem Overview

In medical emergencies and planned hospitalizations across India, patients and caregivers face acute financial and operational uncertainty due to fragmented information:

- **Policy Complexity**: Room rent capping, proportionate deductions on doctor/OT fees, waiting periods on pre-existing diseases (PED), and non-payable consumables are buried in 40-page policy PDFs.
- **Hospital Network Uncertainty**: Cashless empanelment varies by insurer, TPA, and specific hospital branch.
- **Treatment Journey Stress**: Admission workflows, preauthorization timing, mid-treatment cost escalations, and discharge documentation overwhelm caregivers while managing patient health.
- **Disconnected Data**: Information exists in silos across insurance documents, hospital reception desks, TPA portals, and government scheme websites (PM-JAY, ESI, Arogya Karnataka).

---

## 2. Core Mission & Objectives

CareIQ unifies insurance constraints, hospital capability datasets, and admission stage tracking into a single, intuitive caregiver decision-support platform:

1. **Map Insurance Constraints**: Translate policy rules into actionable boundaries (room eligibility, network status, non-covered items).
2. **Rank Suitable Hospitals**: Match facilities using transparent, weighted criteria (cashless support, room compatibility, critical care capabilities, procedure tariffs).
3. **Track Care Journeys**: Provide a 6-stage interactive timeline (Admission $\rightarrow$ Investigation $\rightarrow$ Procedure $\rightarrow$ Recovery $\rightarrow$ Discharge $\rightarrow$ Claim Support) that dynamically fires policy alerts.
4. **Generate Actionable Desk Questions**: Surface targeted questions for caregivers to ask Hospital Billing, TPA Insurance Desks, and Nursing Administration before billing surprises occur.
5. **Grounded RAG Assistant**: Enable natural language policy Q&A strictly grounded in indexed policy clauses with verbatim page citations.

---

## 3. Strict Non-Clinical Safety Guardrails

> [!IMPORTANT]
> **CareIQ is an administrative and insurance decision-support platform.**
> - It **does not** diagnose diseases or prescribe medications.
> - It **does not** recommend or alter clinical treatment pathways.
> - It **does not** make binding claim approvals or represent insurance companies.
> - All cost breakdowns and coverage indicators are strictly **indicative** decision support, explicitly directing users to hospital billing and TPA desks for binding quotations.
