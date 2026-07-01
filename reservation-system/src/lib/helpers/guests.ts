import type { Guest, GuestTag, Reservation } from '@/lib/types';

// =============================================================================
// Guest CRM helpers (USP #3 — own your guests). Matching is by phone number so
// the same guest is recognised across web, widget, WhatsApp and walk-ins.
// =============================================================================

// Default country calling code used to expand numbers typed in local form
// (e.g. Pakistani "0300 1234567"). Kept here so matching is consistent across
// every channel. A real deployment would source this from restaurant settings.
const DEFAULT_COUNTRY_CODE = '92';

/**
 * Normalise a phone number to a canonical E.164-style string (`+<countrycode><number>`).
 * Handles the many ways guests type the SAME number:
 *   "+92 300 1234567", "0092-300-1234567", "0300 1234567", "(0300) 123 4567"
 * all collapse to "+923001234567" so recognition works across every channel.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, ''); // keep digits only

  // International access prefix "00" (e.g. 0092…) → drop it, rest is country+number.
  if (digits.startsWith('00')) digits = digits.slice(2);
  // National trunk prefix "0" (e.g. 0300…) → replace with the default country code.
  else if (digits.startsWith('0')) digits = DEFAULT_COUNTRY_CODE + digits.slice(1);

  if (!digits) return '';
  return `+${digits}`;
}

/**
 * A tolerant matching key: the national significant number (the last 10 digits).
 * This lets the same subscriber match whether or not the country code was typed,
 * which is the common real-world case ("+923001234567" vs "03001234567").
 */
export function phoneMatchKey(phone: string): string {
  const digits = normalizePhone(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** Just the digits of a phone number — for format-agnostic substring search. */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function findGuestByPhone(guests: Guest[], phone: string): Guest | undefined {
  const key = phoneMatchKey(phone);
  if (!key) return undefined;
  return guests.find((g) => phoneMatchKey(g.phone) === key);
}

export function isVip(guest: Guest): boolean {
  return guest.tags.includes('VIP');
}

export function isRepeatNoShow(guest: Guest): boolean {
  return guest.tags.includes('repeat-no-show');
}

export function isReturning(guest: Guest): boolean {
  return guest.totalVisits > 0;
}

/** A short, friendly recognition line for the booking flow. */
export function recognitionMessage(guest: Guest): string | null {
  if (isVip(guest)) return `Welcome back, ${guest.name} — VIP guest 🌟`;
  if (isRepeatNoShow(guest)) return `${guest.name} — flagged as a repeat no-show. A deposit is recommended.`;
  if (isReturning(guest)) return `Welcome back, ${guest.name}! ${guest.totalVisits} previous ${guest.totalVisits === 1 ? 'visit' : 'visits'}.`;
  return null;
}

/** Recompute lifetime stats for a guest from their reservation history. */
export function recomputeGuestStats(guest: Guest, reservations: Reservation[]): Guest {
  const mine = reservations.filter((r) => r.guestId === guest.id);
  const completed = mine.filter((r) => r.status === 'completed');
  const totalVisits = completed.length;
  const totalSpend = completed.reduce((s, r) => s + (r.totalSpend || 0), 0);
  const parties = completed.map((r) => r.guests);
  const averagePartySize = parties.length
    ? Math.round((parties.reduce((s, n) => s + n, 0) / parties.length) * 10) / 10
    : guest.averagePartySize;
  const lastVisitDate = completed
    .map((r) => r.reservationDate)
    .sort()
    .at(-1) ?? guest.lastVisitDate;

  const noShows = mine.filter((r) => r.status === 'no-show').length;
  const tags = deriveTags(guest.tags, { totalVisits, totalSpend, noShows });

  return {
    ...guest,
    totalVisits,
    totalSpend,
    averagePartySize,
    lastVisitDate,
    tags,
  };
}

/** Auto-derive tags from behaviour while preserving manual tags. */
export function deriveTags(
  current: GuestTag[],
  stats: { totalVisits: number; totalSpend: number; noShows: number },
): GuestTag[] {
  const set = new Set<GuestTag>(current.filter((t) => t === 'VIP')); // keep manual VIP

  if (stats.noShows >= 2) set.add('repeat-no-show');
  if (stats.totalVisits >= 5 || stats.totalSpend >= 30000) set.add('VIP');
  else if (stats.totalVisits >= 2) set.add('regular');
  else set.add('new');

  return Array.from(set);
}