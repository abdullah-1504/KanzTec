import type { Guest, GuestTag, Reservation } from '@/lib/types';

// =============================================================================
// Guest CRM helpers (USP #3 — own your guests). Matching is by phone number so
// the same guest is recognised across web, widget, WhatsApp and walk-ins.
// =============================================================================

/** Normalise a phone number to digits (with a leading +) for matching. */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const plus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return plus ? `+${digits}` : digits;
}

export function findGuestByPhone(guests: Guest[], phone: string): Guest | undefined {
  const key = normalizePhone(phone);
  return guests.find((g) => normalizePhone(g.phone) === key);
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