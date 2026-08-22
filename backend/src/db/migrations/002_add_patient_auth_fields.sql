-- =====================================================================
-- Migration 002: Add Patient Auth Fields, Demographics & Medical Profile
-- Description: Extends patients table with account_type, auth_user_id, email,
--              age, blood group, medical conditions, medications, allergies,
--              and emergency contact info.
-- =====================================================================

ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'NEW_USER';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS medical_conditions TEXT[];
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS current_medications TEXT[];
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_patients_account_type ON public.patients(account_type);
CREATE INDEX IF NOT EXISTS idx_patients_auth_user_id ON public.patients(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
