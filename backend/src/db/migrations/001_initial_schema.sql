-- =====================================================================
-- Migration 001: Initial CareIQ Master Schema
-- Description: Creates master tables, foreign keys, indexes, and RLS policies
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Migration Tracking Table
CREATE TABLE IF NOT EXISTS public._migrations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    batch INTEGER NOT NULL DEFAULT 1,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Room Categories
CREATE TABLE IF NOT EXISTS public.room_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    rank INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Specialties
CREATE TABLE IF NOT EXISTS public.specialties (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clinical Services
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insurers
CREATE TABLE IF NOT EXISTS public.insurers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    insurer_type TEXT NOT NULL DEFAULT 'PRIVATE',
    website TEXT,
    data_status TEXT DEFAULT 'PUBLIC_REFERENCE',
    verification_status TEXT DEFAULT 'VERIFIED',
    confidence TEXT DEFAULT 'HIGH',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Hospitals
CREATE TABLE IF NOT EXISTS public.hospitals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    facility_id TEXT,
    name TEXT NOT NULL,
    hospital_type TEXT NOT NULL DEFAULT 'MULTISPECIALTY',
    ownership_type TEXT NOT NULL DEFAULT 'CORPORATE',
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    state TEXT NOT NULL,
    pincode TEXT,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    beds INTEGER,
    icu_beds INTEGER,
    emergency_available BOOLEAN DEFAULT true,
    ambulance_available BOOLEAN DEFAULT true,
    open_24x7 BOOLEAN DEFAULT true,
    website TEXT,
    data_status TEXT DEFAULT 'PUBLIC_REFERENCE',
    verification_status TEXT DEFAULT 'VERIFIED',
    confidence TEXT DEFAULT 'HIGH',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Hospital Specialties
CREATE TABLE IF NOT EXISTS public.hospital_specialties (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id TEXT NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    specialty_id TEXT NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
    availability_status BOOLEAN DEFAULT true,
    source_id TEXT,
    confidence TEXT DEFAULT 'HIGH',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, specialty_id)
);

-- 7. Hospital Services
CREATE TABLE IF NOT EXISTS public.hospital_services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id TEXT NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    availability_status BOOLEAN DEFAULT true,
    operating_hours TEXT DEFAULT '24x7',
    source_id TEXT,
    confidence TEXT DEFAULT 'HIGH',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, service_id)
);

-- 8. Hospital Rooms
CREATE TABLE IF NOT EXISTS public.hospital_rooms (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id TEXT NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    room_category_id TEXT NOT NULL REFERENCES public.room_categories(id) ON DELETE CASCADE,
    tariff_per_day NUMERIC(12, 2) NOT NULL,
    total_rooms INTEGER,
    availability_status TEXT DEFAULT 'SIMULATED',
    data_status TEXT DEFAULT 'SYNTHETIC',
    verification_status TEXT DEFAULT 'VERIFIED',
    confidence TEXT DEFAULT 'HIGH',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, room_category_id)
);

-- 9. Hospital Networks
CREATE TABLE IF NOT EXISTS public.hospital_networks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id TEXT NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    insurer_id TEXT NOT NULL REFERENCES public.insurers(id) ON DELETE CASCADE,
    network_status TEXT NOT NULL DEFAULT 'IN_NETWORK',
    cashless_status BOOLEAN DEFAULT true,
    preauth_required BOOLEAN DEFAULT true,
    confidence TEXT DEFAULT 'HIGH',
    data_status TEXT DEFAULT 'PUBLIC_REFERENCE',
    verification_status TEXT DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, insurer_id)
);

-- 10. Procedures
CREATE TABLE IF NOT EXISTS public.procedures (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    decision_support_only BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Procedure Costs
CREATE TABLE IF NOT EXISTS public.procedure_costs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id TEXT NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    procedure_id TEXT NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
    min_cost NUMERIC(12, 2) NOT NULL,
    max_cost NUMERIC(12, 2) NOT NULL,
    typical_cost NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    data_status TEXT DEFAULT 'SYNTHETIC',
    confidence TEXT DEFAULT 'HIGH',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, procedure_id)
);

-- 12. Cost Components
CREATE TABLE IF NOT EXISTS public.cost_components (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    procedure_cost_id TEXT NOT NULL REFERENCES public.procedure_costs(id) ON DELETE CASCADE,
    component_code TEXT NOT NULL,
    component_name TEXT NOT NULL,
    estimated_amount NUMERIC(12, 2) NOT NULL,
    coverage_candidate BOOLEAN DEFAULT true,
    data_status TEXT DEFAULT 'SYNTHETIC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Patients
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    date_of_birth TEXT,
    age_band TEXT,
    gender TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    preferred_language TEXT DEFAULT 'English',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Insurance Policies
CREATE TABLE IF NOT EXISTS public.insurance_policies (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
    insurer_id TEXT NOT NULL REFERENCES public.insurers(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    policy_type TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    policy_number_masked TEXT,
    sum_insured NUMERIC(12, 2) NOT NULL,
    remaining_sum_insured NUMERIC(12, 2),
    room_eligibility TEXT NOT NULL DEFAULT 'PRIVATE_AC',
    copay_percentage NUMERIC(5, 2) DEFAULT 0,
    deductible_amount NUMERIC(12, 2) DEFAULT 0,
    cashless_supported BOOLEAN DEFAULT true,
    preauthorization_supported BOOLEAN DEFAULT true,
    pre_hospitalization_days INTEGER DEFAULT 30,
    post_hospitalization_days INTEGER DEFAULT 60,
    policy_start_date TEXT,
    policy_end_date TEXT,
    source_document_id TEXT,
    data_status TEXT DEFAULT 'USER_PROVIDED',
    verification_status TEXT DEFAULT 'VERIFIED',
    confidence TEXT DEFAULT 'HIGH',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Policy Rules
CREATE TABLE IF NOT EXISTS public.policy_rules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    policy_id TEXT NOT NULL REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
    rule_code TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    condition_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    priority INTEGER DEFAULT 1,
    source_document_id TEXT,
    source_page INTEGER,
    confidence TEXT DEFAULT 'HIGH',
    verification_status TEXT DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Policy Exclusions
CREATE TABLE IF NOT EXISTS public.policy_exclusions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    policy_id TEXT NOT NULL REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    normalized_code TEXT,
    source_document_id TEXT,
    source_page INTEGER,
    confidence TEXT DEFAULT 'HIGH',
    verification_status TEXT DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Care Journeys
CREATE TABLE IF NOT EXISTS public.care_journeys (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    hospital_id TEXT NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    policy_id TEXT REFERENCES public.insurance_policies(id) ON DELETE SET NULL,
    scheme_id TEXT,
    current_stage TEXT NOT NULL DEFAULT 'ADMISSION',
    journey_status TEXT NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Journey Events
CREATE TABLE IF NOT EXISTS public.journey_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    journey_id TEXT NOT NULL REFERENCES public.care_journeys(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    insurance_relevance TEXT,
    requires_verification BOOLEAN DEFAULT false,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Verification Items
CREATE TABLE IF NOT EXISTS public.verification_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    journey_id TEXT REFERENCES public.care_journeys(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    reason TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'PENDING',
    target_entity_type TEXT,
    target_entity_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 20. Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    owner_user_id TEXT,
    document_type TEXT NOT NULL DEFAULT 'POLICY',
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    checksum TEXT NOT NULL,
    extraction_status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Document Extractions
CREATE TABLE IF NOT EXISTS public.document_extractions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    extraction_version TEXT DEFAULT 'v1.0',
    structured_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence TEXT DEFAULT 'HIGH',
    status TEXT DEFAULT 'PENDING',
    model_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Extraction Evidences
CREATE TABLE IF NOT EXISTS public.extraction_evidences (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    extraction_id TEXT NOT NULL REFERENCES public.document_extractions(id) ON DELETE CASCADE,
    field_path TEXT NOT NULL,
    extracted_value TEXT NOT NULL,
    source_page INTEGER,
    source_text TEXT,
    confidence TEXT DEFAULT 'HIGH',
    verification_status TEXT DEFAULT 'UNVERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Scenarios
CREATE TABLE IF NOT EXISTS public.scenarios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    patient_id TEXT,
    hospital_id TEXT,
    policy_id TEXT,
    procedure_id TEXT,
    room_category TEXT,
    raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON public.hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hosp_specs_hosp ON public.hospital_specialties(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hosp_srvs_hosp ON public.hospital_services(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hosp_rooms_hosp ON public.hospital_rooms(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hosp_net_hosp ON public.hospital_networks(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hosp_net_ins ON public.hospital_networks(insurer_id);
CREATE INDEX IF NOT EXISTS idx_proc_costs_hosp ON public.procedure_costs(hospital_id);
CREATE INDEX IF NOT EXISTS idx_proc_costs_proc ON public.procedure_costs(procedure_id);
CREATE INDEX IF NOT EXISTS idx_cost_comp_proc ON public.cost_components(procedure_cost_id);
CREATE INDEX IF NOT EXISTS idx_policies_pat ON public.insurance_policies(patient_id);
CREATE INDEX IF NOT EXISTS idx_policies_ins ON public.insurance_policies(insurer_id);
CREATE INDEX IF NOT EXISTS idx_policy_rules_pol ON public.policy_rules(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_excl_pol ON public.policy_exclusions(policy_id);
CREATE INDEX IF NOT EXISTS idx_journeys_pat ON public.care_journeys(patient_id);
CREATE INDEX IF NOT EXISTS idx_journey_events_jrn ON public.journey_events(journey_id);
CREATE INDEX IF NOT EXISTS idx_ver_items_pat ON public.verification_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_ver_items_jrn ON public.verification_items(journey_id);
CREATE INDEX IF NOT EXISTS idx_docs_owner ON public.documents(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_doc_ext_doc ON public.document_extractions(document_id);
CREATE INDEX IF NOT EXISTS idx_ext_ev_ext ON public.extraction_evidences(extraction_id);

-- Enable RLS
ALTER TABLE public.room_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_exclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extraction_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Allow public read and full access policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access room_categories') THEN
        CREATE POLICY "Allow all access room_categories" ON public.room_categories FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access specialties') THEN
        CREATE POLICY "Allow all access specialties" ON public.specialties FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access services') THEN
        CREATE POLICY "Allow all access services" ON public.services FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access insurers') THEN
        CREATE POLICY "Allow all access insurers" ON public.insurers FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access hospitals') THEN
        CREATE POLICY "Allow all access hospitals" ON public.hospitals FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access hospital_specialties') THEN
        CREATE POLICY "Allow all access hospital_specialties" ON public.hospital_specialties FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access hospital_services') THEN
        CREATE POLICY "Allow all access hospital_services" ON public.hospital_services FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access hospital_rooms') THEN
        CREATE POLICY "Allow all access hospital_rooms" ON public.hospital_rooms FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access hospital_networks') THEN
        CREATE POLICY "Allow all access hospital_networks" ON public.hospital_networks FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access procedures') THEN
        CREATE POLICY "Allow all access procedures" ON public.procedures FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access procedure_costs') THEN
        CREATE POLICY "Allow all access procedure_costs" ON public.procedure_costs FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access cost_components') THEN
        CREATE POLICY "Allow all access cost_components" ON public.cost_components FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access patients') THEN
        CREATE POLICY "Allow all access patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access insurance_policies') THEN
        CREATE POLICY "Allow all access insurance_policies" ON public.insurance_policies FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access policy_rules') THEN
        CREATE POLICY "Allow all access policy_rules" ON public.policy_rules FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access policy_exclusions') THEN
        CREATE POLICY "Allow all access policy_exclusions" ON public.policy_exclusions FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access care_journeys') THEN
        CREATE POLICY "Allow all access care_journeys" ON public.care_journeys FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access journey_events') THEN
        CREATE POLICY "Allow all access journey_events" ON public.journey_events FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access verification_items') THEN
        CREATE POLICY "Allow all access verification_items" ON public.verification_items FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access documents') THEN
        CREATE POLICY "Allow all access documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access document_extractions') THEN
        CREATE POLICY "Allow all access document_extractions" ON public.document_extractions FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access extraction_evidences') THEN
        CREATE POLICY "Allow all access extraction_evidences" ON public.extraction_evidences FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access scenarios') THEN
        CREATE POLICY "Allow all access scenarios" ON public.scenarios FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
