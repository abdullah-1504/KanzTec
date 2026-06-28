'use client';

import type {
  BookingInput,
  BookingResult,
  DB,
  Guest,
  Reservation,
  RestaurantSettings,
  Review,
  TableStatus,
} from '@/lib/types';
import { DB_VERSION, DEFAULT_SETTINGS, STORAGE_KEY } from '@/lib/config';
import {
  SAMPLE_GUESTS,
  SAMPLE_MENU,
  SAMPLE_TABLES,
  buildSeedReservations,
  buildSeedReviews,
} from '@/lib/mockData';
import {
  checkTableAvailable,
  isNowBooking,
} from '@/lib/helpers/availability';
import { evaluateDeposit } from '@/lib/helpers/deposits';
import {
  findGuestByPhone,
  recomputeGuestStats,
} from '@/lib/helpers/guests';
import { preOrderTotal } from '@/lib/helpers/pricing';
import { todayStr, nowTimeStr } from '@/lib/helpers/datetime';

// =============================================================================
// Service layer. Today this is backed by localStorage; every function maps 1:1
// to a future REST endpoint (see src/app/api/*). Swap the bodies for `fetch`
// calls and the rest of the app keeps working unchanged.
// =============================================================================

const listeners = new Set<() => void>();
let cache: DB | null = null;

function freshSeed(): DB {
  return {
    version: DB_VERSION,
    tables: structuredClone(SAMPLE_TABLES),
    menu: structuredClone(SAMPLE_MENU),
    guests: structuredClone(SAMPLE_GUESTS),
    reservations: buildSeedReservations(),
    reviews: buildSeedReviews(),
    settings: structuredClone(DEFAULT_SETTINGS),
  };
}

function loadDB(): DB {
  if (cache) return cache;
  if (typeof window === 'undefined') {
    cache = freshSeed();
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed.version === DB_VERSION) {
        cache = parsed;
        return cache;
      }
    }
  } catch {
    // fall through to seeding
  }
  cache = freshSeed();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  return cache;
}

function persist(db: DB): void {
  // New root identity on every write so subscribers (useSyncExternalStore-style
  // hooks) detect the change and re-render.
  cache = { ...db };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  }
  notify();
}

function notify(): void {
  listeners.forEach((l) => l());
}

let id = 0;
function genId(prefix: string): string {
  id += 1;
  return `${prefix}_${Date.now().toString(36)}${id}${Math.random().toString(36).slice(2, 6)}`;
}

// Cross-tab real-time: when another tab writes, drop our cache and re-render.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      notify();
    }
  });
}

// ----- subscriptions (used by hooks) -----------------------------------------
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): DB {
  return loadDB();
}

// ----- reads (GET endpoints) -------------------------------------------------
export const getTables = () => loadDB().tables;
export const getReservations = () => loadDB().reservations;
export const getGuests = () => loadDB().guests;
export const getMenuItems = () => loadDB().menu;
export const getReviews = () => loadDB().reviews;
export const getSettings = () => loadDB().settings;

// ----- guest matching (CRM write used by every booking) ----------------------
function findOrCreateGuest(db: DB, name: string, phone: string): Guest {
  const existing = findGuestByPhone(db.guests, phone);
  if (existing) {
    if (name && existing.name !== name && !existing.name) existing.name = name;
    return existing;
  }
  const guest: Guest = {
    id: genId('g'),
    name: name || 'Guest',
    phone,
    totalVisits: 0,
    totalSpend: 0,
    averagePartySize: 0,
    lastVisitDate: null,
    preferences: '',
    allergies: '',
    tags: ['new'],
    createdAt: new Date().toISOString(),
  };
  db.guests.push(guest);
  return guest;
}

// ----- POST /reservations (shared by web, widget, WhatsApp) ------------------
export function createReservation(input: BookingInput): BookingResult {
  const db = loadDB();
  const table = db.tables.find((t) => t.id === input.tableId);
  if (!table) return { ok: false, error: 'That table no longer exists.' };

  // Conflict prevention — the single source of truth for booking rules.
  const avail = checkTableAvailable(
    table,
    db.reservations,
    input.reservationDate,
    input.reservationTime,
    input.guests,
    db.settings.reservationDurationMinutes,
  );
  if (!avail.ok) return { ok: false, error: avail.reason };

  const guest = findOrCreateGuest(db, input.customerName, input.phone);

  const decision = evaluateDeposit(db.settings.deposit, {
    guests: input.guests,
    date: input.reservationDate,
    time: input.reservationTime,
    preOrderItems: input.preOrderItems,
  });

  const depositStatus = !decision.required
    ? 'none'
    : input.depositPaid
      ? 'paid'
      : 'pending';

  const reservation: Reservation = {
    id: genId('r'),
    guestId: guest.id,
    customerName: input.customerName,
    phone: input.phone,
    guests: input.guests,
    tableId: input.tableId,
    reservationDate: input.reservationDate,
    reservationTime: input.reservationTime,
    status: 'confirmed',
    source: input.source,
    hasPreOrder: (input.preOrderItems?.length ?? 0) > 0,
    preOrderItems: input.preOrderItems ?? [],
    depositRequired: decision.required,
    depositAmount: decision.amount,
    depositStatus,
    totalSpend: 0,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };

  db.reservations.push(reservation);

  // "Right now" bookings seat the table immediately.
  if (isNowBooking(input.reservationDate, input.reservationTime)) {
    table.status = 'occupied';
    table.currentReservationId = reservation.id;
  }

  persist(db);
  return { ok: true, reservation, guest };
}

// ----- POST /walk-in ---------------------------------------------------------
export function addWalkIn(input: {
  customerName: string;
  phone: string;
  guests: number;
  tableId: string;
  notes?: string;
}): BookingResult {
  return createReservation({
    ...input,
    reservationDate: todayStr(),
    reservationTime: nowTimeStr(),
    source: 'walk-in',
  });
}

// ----- PATCH /tables/:id/status ----------------------------------------------
export function updateTableStatus(tableId: string, status: TableStatus): void {
  const db = loadDB();
  const table = db.tables.find((t) => t.id === tableId);
  if (!table) return;
  table.status = status;
  if (status === 'available') table.currentReservationId = null;
  persist(db);
}

// ----- PATCH /reservations/:id/status ----------------------------------------
export function updateReservationStatus(
  reservationId: string,
  status: Reservation['status'],
): void {
  const db = loadDB();
  const res = db.reservations.find((r) => r.id === reservationId);
  if (!res) return;
  res.status = status;

  if (status === 'completed') {
    // Record spend so revenue-per-cover analytics work. Use the pre-order total
    // when present, otherwise estimate an average cover spend.
    if (res.totalSpend === 0) {
      const pre = preOrderTotal(res.preOrderItems);
      res.totalSpend = pre > 0 ? pre : res.guests * 1900;
    }
    if (res.depositStatus === 'pending') res.depositStatus = 'paid';
  }
  if (status === 'no-show' && res.depositStatus === 'paid') {
    res.depositStatus = 'forfeited';
  }

  // Free the physical table if this reservation was seated at it.
  if (status !== 'confirmed') {
    const table = db.tables.find((t) => t.currentReservationId === res.id);
    if (table) {
      table.status = 'available';
      table.currentReservationId = null;
    }
  }

  // Keep the guest's CRM stats in sync with their history.
  const guest = db.guests.find((g) => g.id === res.guestId);
  if (guest) {
    Object.assign(guest, recomputeGuestStats(guest, db.reservations));
  }

  persist(db);
}

// ----- POST /reviews ---------------------------------------------------------
export function addReview(input: {
  guestId: string;
  reservationId: string;
  rating: number;
  comment?: string;
}): Review {
  const db = loadDB();
  const review: Review = {
    id: genId('rv'),
    guestId: input.guestId,
    reservationId: input.reservationId,
    rating: input.rating,
    comment: input.comment,
    createdAt: new Date().toISOString(),
  };
  db.reviews.push(review);
  persist(db);
  return review;
}

// ----- guest profile edits (tags / notes) ------------------------------------
export function updateGuest(guestId: string, patch: Partial<Guest>): void {
  const db = loadDB();
  const guest = db.guests.find((g) => g.id === guestId);
  if (!guest) return;
  Object.assign(guest, patch);
  persist(db);
}

// ----- settings (deposit rules, branding) ------------------------------------
export function updateSettings(patch: Partial<RestaurantSettings>): void {
  const db = loadDB();
  db.settings = { ...db.settings, ...patch };
  persist(db);
}

// ----- demo reset ------------------------------------------------------------
export function resetDemo(): void {
  cache = freshSeed();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  }
  notify();
}