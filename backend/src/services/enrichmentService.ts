/**
 * Enrichment helpers — the single place where derived, non-column fields get
 * attached to domain records before they leave the API.
 *
 * Why this exists: the frontend was reading `policy.insurer_name` and
 * `policy.scheme_type`, neither of which is a column on insurance_policies.
 * Both are always undefined, so every UI that showed an insurer name was
 * showing a hardcoded fallback. The facts do exist — public.insurers has ten
 * correctly-named rows joined by a valid insurer_id FK — nothing had ever
 * joined them. Same story for hospital cashless status, which the UI treated
 * as "true unless explicitly false" instead of asking hospital_networks.
 *
 * Rule: one helper, used everywhere. If a controller needs an insurer name it
 * calls enrichPolicy(); it does not do its own join.
 */
import { dataRepository } from './dataRepository';
import {
  InsurerType,
  NetworkStatus,
  type EnrichedInsurancePolicy,
  type Hospital,
  type InsurancePolicy
} from '../types/domain';

/**
 * A hospital plus the coverage facts that only make sense relative to one
 * insurer. `cashless_available` on the hospital row means "cashless with at
 * least one insurer"; that is not the question a patient is asking.
 */
export interface HospitalCoverageContext {
  network_status: NetworkStatus;
  cashless_available: boolean;
  preauth_required: boolean;
  /** True when no hospital_networks row exists for this pair — unknown, not "no". */
  network_data_missing: boolean;
}

export type EnrichedHospital = Hospital & { coverage?: HospitalCoverageContext };

/** Attaches insurer_name / short_name / scheme_type from the insurer_id FK. */
export function enrichPolicy(policy: InsurancePolicy): EnrichedInsurancePolicy;
export function enrichPolicy(policy: undefined | null): undefined;
export function enrichPolicy(
  policy: InsurancePolicy | undefined | null
): EnrichedInsurancePolicy | undefined;
export function enrichPolicy(
  policy: InsurancePolicy | undefined | null
): EnrichedInsurancePolicy | undefined {
  if (!policy) return undefined;

  const insurer = policy.insurer_id ? dataRepository.getInsurerById(policy.insurer_id) : undefined;

  // No insurer row is a data-integrity problem, not something to paper over
  // with a plausible brand name. Say so instead.
  if (!insurer) {
    console.warn(
      `enrichPolicy: policy ${policy.id} references unknown insurer_id "${policy.insurer_id}"`
    );
    return {
      ...policy,
      insurer_name: 'Insurer not on record',
      insurer_short_name: 'Unknown',
      scheme_type: InsurerType.PRIVATE,
      is_government_scheme: false
    };
  }

  const schemeType = insurer.insurer_type;
  return {
    ...policy,
    insurer_name: insurer.name,
    insurer_short_name: insurer.short_name || insurer.name,
    scheme_type: schemeType,
    is_government_scheme:
      schemeType === InsurerType.SCHEME_ADMINISTRATOR || schemeType === InsurerType.PUBLIC
  };
}

export function enrichPolicies(policies: InsurancePolicy[]): EnrichedInsurancePolicy[] {
  return policies.map((p) => enrichPolicy(p));
}

/**
 * Derives real cashless/network facts for one hospital-insurer pair from
 * hospital_networks. When no row exists the caller gets
 * network_data_missing: true and must render "not confirmed", never "cashless".
 */
export function getHospitalCoverage(
  hospitalId: string,
  insurerId: string | undefined
): HospitalCoverageContext {
  if (!hospitalId || !insurerId) {
    return {
      network_status: NetworkStatus.UNKNOWN,
      cashless_available: false,
      preauth_required: true,
      network_data_missing: true
    };
  }

  const network = dataRepository.getNetworkRelationship(hospitalId, insurerId);
  if (!network) {
    return {
      network_status: NetworkStatus.UNKNOWN,
      cashless_available: false,
      preauth_required: true,
      network_data_missing: true
    };
  }

  return {
    network_status: network.network_status,
    cashless_available:
      network.cashless_status === true && network.network_status === NetworkStatus.IN_NETWORK,
    preauth_required: network.preauth_required !== false,
    network_data_missing: false
  };
}

/** Hospital + per-insurer coverage facts, for detail responses. */
export function enrichHospitalForInsurer(
  hospital: Hospital,
  insurerId: string | undefined
): EnrichedHospital {
  return { ...hospital, coverage: getHospitalCoverage(hospital.id, insurerId) };
}
