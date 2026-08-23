/**
 * Money and date formatting, in one place.
 *
 * Every view had its own `₹${n.toLocaleString()}` — which uses the browser's
 * locale, so the same figure rendered as ₹2,65,000 in Mumbai and ₹265,000 in
 * a US-locale browser. Indian digit grouping is not cosmetic here: lakh
 * grouping is how the numbers on a policy schedule are written, and a reader
 * checking our figure against their own document needs the same shape.
 */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const INR_PLAIN = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** ₹2,65,000 — no decimals, Indian grouping. Nullish renders as an em dash. */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return INR.format(Math.round(amount));
}

/** 2,65,000 without the symbol, for use next to an existing ₹. */
export function formatNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return INR_PLAIN.format(Math.round(amount));
}

/**
 * ₹2.65L / ₹1.2Cr — the compact form used on dense cards.
 * Lakh and crore rather than K/M, because that is the unit a sum insured is
 * quoted in on an Indian policy schedule.
 */
export function formatINRCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  if (abs >= 100000) return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  if (abs >= 1000) return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return formatINR(amount);
}

/** ₹3,000/day. */
export function formatPerDay(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return `${formatINR(amount)}/day`;
}

/** 12 Mar 2026. Returns 'Not recorded' for a missing date rather than today. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not recorded';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Not recorded';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** 12 Mar 2026, 4:30 pm. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Not recorded';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Not recorded';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/** '12 Mar 2026 – 18 Mar 2026', or a single date, or 'Not recorded'. */
export function formatDateRange(
  from: string | null | undefined,
  to: string | null | undefined
): string {
  if (!from && !to) return 'Not recorded';
  if (from && !to) return `${formatDate(from)} onwards`;
  if (!from && to) return `until ${formatDate(to)}`;
  return `${formatDate(from)} – ${formatDate(to)}`;
}

/** 42% — clamped, and 0 when the denominator is zero rather than NaN. */
export function toPercent(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / whole) * 100)));
}

/** Turns SEMI_PRIVATE into 'Semi private' for display. */
export function humanizeCode(code: string | null | undefined): string {
  if (!code) return 'Not recorded';
  const spaced = code.replace(/_/g, ' ').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
