-- =====================================================================
-- Migration 003: Journey Clinical Context & Hospital Classification
-- Description: Lets a care journey record WHICH procedure and room the
--              patient actually chose, plus admission/discharge dates and
--              the working diagnosis. Without these columns the coverage
--              math has no honest inputs and the UI is forced to invent
--              them. Also adds hospital tier + cashless flag, both of
--              which the frontend already reads but which never existed.
--
-- Deliberately NOT added:
--   insurance_policies.insurer_name  -> derive by joining public.insurers
--   insurance_policies.scheme_type   -> derive from insurers.insurer_type
--   patients.diagnosis               -> a diagnosis belongs to an episode
--                                       of care, not permanently to a person
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Care journey clinical context
-- ---------------------------------------------------------------------
ALTER TABLE public.care_journeys ADD COLUMN IF NOT EXISTS procedure_id TEXT;
ALTER TABLE public.care_journeys ADD COLUMN IF NOT EXISTS selected_room_category TEXT;
ALTER TABLE public.care_journeys ADD COLUMN IF NOT EXISTS admission_date DATE;
ALTER TABLE public.care_journeys ADD COLUMN IF NOT EXISTS discharge_date DATE;
ALTER TABLE public.care_journeys ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE public.care_journeys ADD COLUMN IF NOT EXISTS selected_room_tariff NUMERIC(12, 2);

-- FK added separately so a re-run cannot fail on an existing constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'care_journeys_procedure_id_fkey'
  ) THEN
    ALTER TABLE public.care_journeys
      ADD CONSTRAINT care_journeys_procedure_id_fkey
      FOREIGN KEY (procedure_id) REFERENCES public.procedures(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 2. Hospital classification the UI already reads
-- ---------------------------------------------------------------------
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS cashless_available BOOLEAN;

-- Backfill tier from city. In Indian health-insurance pricing "tier" is a
-- city classification (metro vs non-metro), not a quality rating.
UPDATE public.hospitals
SET tier = CASE
  WHEN city IN (
    'Mumbai', 'Delhi', 'New Delhi', 'Bengaluru', 'Bangalore', 'Chennai',
    'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'
  ) THEN 'Tier 1'
  WHEN city IN (
    'Jaipur', 'Lucknow', 'Nagpur', 'Indore', 'Bhopal', 'Kochi', 'Coimbatore',
    'Visakhapatnam', 'Surat', 'Chandigarh', 'Vadodara', 'Nashik', 'Thane',
    'Navi Mumbai', 'Mysuru', 'Mysore'
  ) THEN 'Tier 2'
  ELSE 'Tier 3'
END
WHERE tier IS NULL;

-- Backfill cashless_available from the real network table rather than
-- assuming true. A hospital is cashless-capable if at least one insurer
-- network row says so.
UPDATE public.hospitals h
SET cashless_available = EXISTS (
  SELECT 1 FROM public.hospital_networks n
  WHERE n.hospital_id = h.id
    AND n.cashless_status = true
    AND n.network_status = 'IN_NETWORK'
)
WHERE cashless_available IS NULL;

-- ---------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_care_journeys_procedure_id ON public.care_journeys(procedure_id);
CREATE INDEX IF NOT EXISTS idx_care_journeys_admission_date ON public.care_journeys(admission_date);
CREATE INDEX IF NOT EXISTS idx_hospitals_tier ON public.hospitals(tier);
CREATE INDEX IF NOT EXISTS idx_hospitals_cashless ON public.hospitals(cashless_available);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON public.hospitals(city);
