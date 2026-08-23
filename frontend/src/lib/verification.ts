/**
 * Verification item status helpers.
 *
 * Several components tested for `status === 'VERIFIED'`. That value does not
 * exist — the four states are PENDING, IN_PROGRESS, RESOLVED and DISMISSED —
 * so those checks matched nothing and the "confirmed" count read zero while the
 * "resolved" filter counted the same rows. Worse, DISMISSED was being counted
 * as confirmed in one place: a checkpoint someone waved away is not a
 * checkpoint that was verified, and conflating them inflates the count that the
 * whole dashboard's reassurance rests on.
 */
import type { VerificationItem, VerificationCategory } from '../types/domain';

/** Still needs someone to do something. */
export function isOpen(item: VerificationItem): boolean {
  return item.status === 'PENDING' || item.status === 'IN_PROGRESS';
}

/** Actually checked and confirmed. DISMISSED is deliberately not included. */
export function isResolved(item: VerificationItem): boolean {
  return item.status === 'RESOLVED';
}

/** No longer needs action, whether that is because it was confirmed or waved off. */
export function isSettled(item: VerificationItem): boolean {
  return item.status === 'RESOLVED' || item.status === 'DISMISSED';
}

export function countOpen(items: VerificationItem[]): number {
  return items.filter(isOpen).length;
}

export function countResolved(items: VerificationItem[]): number {
  return items.filter(isResolved).length;
}

export function openItems(items: VerificationItem[]): VerificationItem[] {
  return items.filter(isOpen);
}

/** Open items in a given category, e.g. an unresolved room-cap question. */
export function openInCategory(
  items: VerificationItem[],
  category: VerificationCategory
): VerificationItem[] {
  return items.filter((item) => item.category === category && isOpen(item));
}

export function hasOpenInCategory(
  items: VerificationItem[],
  category: VerificationCategory
): boolean {
  return openInCategory(items, category).length > 0;
}

/** Which desk the patient should raise this with. */
export const CATEGORY_DESK: Record<VerificationCategory, string> = {
  ROOM: 'Admission desk',
  NETWORK: 'TPA cashless desk',
  PREAUTH: 'TPA cashless desk',
  COST: 'Billing desk',
  EXCLUSION: 'Insurer helpline',
  DOCUMENT: 'Admission desk',
  CLAIM: 'Insurer helpline',
  HOSPITAL: 'Hospital front office',
  POLICY: 'Insurer helpline'
};

export const CATEGORY_LABEL: Record<VerificationCategory, string> = {
  ROOM: 'Room category',
  NETWORK: 'Network status',
  PREAUTH: 'Pre-authorisation',
  COST: 'Cost & tariffs',
  EXCLUSION: 'Exclusions',
  DOCUMENT: 'Documents',
  CLAIM: 'Claim',
  HOSPITAL: 'Hospital',
  POLICY: 'Policy terms'
};

export const STATUS_LABEL: Record<VerificationItem['status'], string> = {
  PENDING: 'Action required',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Confirmed',
  DISMISSED: 'Dismissed'
};
