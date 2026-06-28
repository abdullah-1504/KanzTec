import type {
  Reservation,
  RestaurantTable,
} from '@/lib/types';
import { toDateTime, todayStr, nowTimeStr } from '@/lib/helpers/datetime';
import type { TableVisualKind } from '@/lib/helpers/statusColors';

// =============================================================================
// THE booking core. Every channel (web page, embeddable widget, WhatsApp agent)
// calls these functions — booking rules live here and nowhere else.
// =============================================================================

export const DEFAULT_DURATION_MINUTES = 90;

/** A reservation is "active" (occupies its table) only if confirmed. */
function isActive(r: Reservation): boolean {
  return r.status === 'confirmed';
}

/** Does the requested party fit at this table? Rule #2. */
export function tableFitsGuests(table: RestaurantTable, guests: number): boolean {
  return table.capacity >= guests;
}

/** Two [start,end) intervals overlap. */
function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Is the table free for a given date/time window? Rules #1, #3, #4, #5, #6.
 * Checks every confirmed reservation on that table for a time conflict.
 */
export function hasReservationConflict(
  tableId: string,
  reservations: Reservation[],
  date: string,
  time: string,
  durationMin = DEFAULT_DURATION_MINUTES,
  excludeReservationId?: string,
): boolean {
  const start = toDateTime(date, time).getTime();
  const end = start + durationMin * 60_000;

  return reservations.some((r) => {
    if (r.tableId !== tableId) return false;
    if (!isActive(r)) return false;
    if (excludeReservationId && r.id === excludeReservationId) return false;
    const rStart = toDateTime(r.reservationDate, r.reservationTime).getTime();
    const rEnd = rStart + durationMin * 60_000;
    return overlaps(start, end, rStart, rEnd);
  });
}

/** Is the chosen date/time effectively "right now"? (within 10 minutes) */
export function isNowBooking(date: string, time: string): boolean {
  if (date !== todayStr()) return false;
  const diff = Math.abs(toDateTime(date, time).getTime() - Date.now());
  return diff <= 10 * 60_000;
}

/**
 * Full availability check used before creating any booking. Returns a reason
 * string when unavailable so each channel can surface a clear message.
 */
export function checkTableAvailable(
  table: RestaurantTable,
  reservations: Reservation[],
  date: string,
  time: string,
  guests: number,
  durationMin = DEFAULT_DURATION_MINUTES,
): { ok: true } | { ok: false; reason: string } {
  if (!tableFitsGuests(table, guests)) {
    return { ok: false, reason: `Table ${table.tableNumber} seats ${table.capacity}, too small for ${guests}.` };
  }

  const now = isNowBooking(date, time);

  // For "right now" bookings the physical table state matters.
  if (now && table.status !== 'available') {
    return { ok: false, reason: `Table ${table.tableNumber} is currently ${table.status}.` };
  }

  // For future bookings a table in long-term cleaning is still blockable now,
  // but the deciding factor is time-based reservation conflicts.
  if (hasReservationConflict(table.id, reservations, date, time, durationMin)) {
    return { ok: false, reason: `Table ${table.tableNumber} is already booked for that time.` };
  }

  return { ok: true };
}

/** All tables that can be booked for this party at this time. */
export function availableTablesFor(
  tables: RestaurantTable[],
  reservations: Reservation[],
  date: string,
  time: string,
  guests: number,
  durationMin = DEFAULT_DURATION_MINUTES,
): RestaurantTable[] {
  return tables.filter(
    (t) => checkTableAvailable(t, reservations, date, time, guests, durationMin).ok,
  );
}

/**
 * Compute how a table should render on the map for a given party + time +
 * current selection. Keeps all the color/selection logic out of the UI.
 */
export function computeTableVisual(
  table: RestaurantTable,
  reservations: Reservation[],
  date: string,
  time: string,
  guests: number,
  selectedTableId: string | null,
): { kind: TableVisualKind; selectable: boolean; reason?: string } {
  if (selectedTableId === table.id) {
    return { kind: 'selected', selectable: true };
  }

  if (guests > 0 && !tableFitsGuests(table, guests)) {
    return { kind: 'too-small', selectable: false, reason: 'Too small for this party' };
  }

  const now = isNowBooking(date, time);

  if (now) {
    if (table.status === 'occupied') return { kind: 'occupied', selectable: false };
    if (table.status === 'cleaning') return { kind: 'cleaning', selectable: false };
    if (table.status === 'reserved') return { kind: 'reserved', selectable: false };
  }

  if (hasReservationConflict(table.id, reservations, date, time)) {
    return { kind: 'occupied', selectable: false, reason: 'Booked for this time' };
  }

  // Available now, but is there a confirmed reservation later today? -> yellow.
  if (hasUpcomingReservationToday(table.id, reservations, date, time)) {
    return { kind: 'upcoming', selectable: true, reason: 'Free now, reserved later' };
  }

  return { kind: 'available', selectable: true };
}

/** Any confirmed reservation later the same day (after the requested time). */
export function hasUpcomingReservationToday(
  tableId: string,
  reservations: Reservation[],
  date: string,
  time: string,
): boolean {
  const ref = toDateTime(date, time).getTime();
  return reservations.some((r) => {
    if (r.tableId !== tableId || !isActive(r)) return false;
    if (r.reservationDate !== date) return false;
    const rStart = toDateTime(r.reservationDate, r.reservationTime).getTime();
    return rStart > ref;
  });
}

/** Largest party the restaurant can currently seat (sum of free-table seats). */
export function walkInCapacity(tables: RestaurantTable[]): number {
  return tables
    .filter((t) => t.status === 'available')
    .reduce((sum, t) => sum + t.capacity, 0);
}

/** Suggest up to `limit` open time slots today for a party (WhatsApp/widget). */
export function suggestSlots(
  tables: RestaurantTable[],
  reservations: Reservation[],
  guests: number,
  date = todayStr(),
  candidateTimes: string[] = [],
  limit = 4,
): string[] {
  const from = date === todayStr() ? nowTimeStr() : '00:00';
  const out: string[] = [];
  for (const time of candidateTimes) {
    if (time < from) continue;
    const free = availableTablesFor(tables, reservations, date, time, guests);
    if (free.length > 0) out.push(time);
    if (out.length >= limit) break;
  }
  return out;
}