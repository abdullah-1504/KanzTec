import type { Guest, Reservation } from '@/lib/types';
import { toDateStr } from '@/lib/helpers/datetime';

// =============================================================================
// ROI / analytics (the retention feature). Everything here is COMPUTED from
// reservations + guests — nothing is hardcoded or stored.
// =============================================================================

export type AnalyticsRange = 'today' | 'week' | 'month';

export interface AnalyticsResult {
  range: AnalyticsRange;
  depositRevenueRecovered: number; // hero metric
  covers: number;
  confirmedCount: number;
  noShowCount: number;
  noShowRate: number; // 0-1
  repeatGuestRate: number; // 0-1
  totalSpend: number;
  revenuePerCover: number;
  coversOverTime: { label: string; covers: number }[];
  peakSlots: { hour: number; label: string; count: number }[];
}

/** Inclusive start date (YYYY-MM-DD) for a range relative to `now`. */
export function rangeStart(range: AnalyticsRange, now = new Date()): string {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (range === 'week') d.setDate(d.getDate() - 6);
  if (range === 'month') d.setDate(d.getDate() - 29);
  return toDateStr(d);
}

function inRange(date: string, range: AnalyticsRange, now = new Date()): boolean {
  const start = rangeStart(range, now);
  const end = toDateStr(now);
  return date >= start && date <= end;
}

export function computeAnalytics(
  reservations: Reservation[],
  guests: Guest[],
  range: AnalyticsRange,
  now = new Date(),
): AnalyticsResult {
  const inWindow = reservations.filter((r) => inRange(r.reservationDate, range, now));

  // Hero: deposits actually collected (paid mock) in the window.
  const depositRevenueRecovered = inWindow
    .filter((r) => r.depositStatus === 'paid')
    .reduce((s, r) => s + r.depositAmount, 0);

  const completed = inWindow.filter((r) => r.status === 'completed');
  const covers = completed.reduce((s, r) => s + r.guests, 0);
  const totalSpend = completed.reduce((s, r) => s + (r.totalSpend || 0), 0);

  const noShowCount = inWindow.filter((r) => r.status === 'no-show').length;
  // Denominator = bookings that reached their slot (completed + no-show).
  const reached = completed.length + noShowCount;
  const noShowRate = reached ? noShowCount / reached : 0;
  const confirmedCount = inWindow.filter((r) => r.status === 'confirmed').length;

  // Repeat-guest rate: share of bookings made by guests with >1 lifetime visit.
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const returning = inWindow.filter((r) => (guestById.get(r.guestId)?.totalVisits ?? 0) > 1);
  const repeatGuestRate = inWindow.length ? returning.length / inWindow.length : 0;

  const revenuePerCover = covers ? Math.round(totalSpend / covers) : 0;

  return {
    range,
    depositRevenueRecovered,
    covers,
    confirmedCount,
    noShowCount,
    noShowRate,
    repeatGuestRate,
    totalSpend,
    revenuePerCover,
    coversOverTime: coversOverTime(completed, range, now),
    peakSlots: peakSlots(inWindow),
  };
}

function coversOverTime(
  completed: Reservation[],
  range: AnalyticsRange,
  now: Date,
): { label: string; covers: number }[] {
  const days = range === 'today' ? 1 : range === 'week' ? 7 : 30;
  const buckets: { label: string; covers: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = toDateStr(d);
    const covers = completed
      .filter((r) => r.reservationDate === key)
      .reduce((s, r) => s + r.guests, 0);
    buckets.push({
      label: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      covers,
    });
  }
  return buckets;
}

function peakSlots(reservations: Reservation[]): { hour: number; label: string; count: number }[] {
  const counts = new Map<number, number>();
  for (const r of reservations) {
    const hour = parseInt(r.reservationTime.split(':')[0] ?? '0', 10);
    counts.set(hour, (counts.get(hour) ?? 0) + r.guests);
  }
  return Array.from(counts.entries())
    .map(([hour, count]) => ({
      hour,
      label: `${((hour + 11) % 12) + 1}${hour < 12 ? 'am' : 'pm'}`,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}