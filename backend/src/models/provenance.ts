import { DataProvenance, DataStatus, VerificationStatus, ConfidenceLevel } from '../types/domain';

export function createProvenance(
  status: DataStatus = DataStatus.SYNTHETIC,
  verificationStatus: VerificationStatus = VerificationStatus.VERIFIED,
  confidence: ConfidenceLevel = ConfidenceLevel.HIGH,
  sourceId?: string
): DataProvenance {
  const now = new Date().toISOString();
  return {
    data_status: status,
    verification_status: verificationStatus,
    confidence: confidence,
    source_id: sourceId,
    last_verified_at: now,
    created_at: now,
    updated_at: now
  };
}

export function formatProvenanceBadge(provenance: Partial<DataProvenance>): {
  label: string;
  variant: 'success' | 'warning' | 'info' | 'neutral';
} {
  switch (provenance.verification_status) {
    case VerificationStatus.VERIFIED:
      return { label: 'Verified Reference', variant: 'success' };
    case VerificationStatus.PARTIALLY_VERIFIED:
      return { label: 'Partially Verified', variant: 'warning' };
    case VerificationStatus.NEEDS_VERIFICATION:
      return { label: 'Needs Verification', variant: 'warning' };
    case VerificationStatus.UNVERIFIED:
      return { label: 'Unverified / User Provided', variant: 'neutral' };
    default:
      return { label: 'Synthetic / Demo Data', variant: 'info' };
  }
}
