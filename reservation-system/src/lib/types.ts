// =============================================================================
// Core domain types. These model the whole platform and are shared by every
// channel (web page, embeddable widget, WhatsApp agent) and the manager tools.
// =============================================================================

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface RestaurantTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  currentReservationId: string | null;
  /** Position on the floor-plan map (percentage 0-100 of the floor container). */
  x: number;
  y: number;
}

export type ReservationStatus =
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no-show';

/** Where a booking came from — used for analytics and the dashboard feed. */
export type BookingSource = 'web' | 'widget' | 'whatsapp' | 'walk-in';

export type DepositStatus =
  | 'none'
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'forfeited';

export interface PreOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Reservation {
  id: string;
  guestId: string;
  customerName: string;
  phone: string;
  guests: number;
  tableId: string;
  /** ISO date, YYYY-MM-DD */
  reservationDate: string;
  /** 24h time, HH:mm */
  reservationTime: string;
  status: ReservationStatus;
  source: BookingSource;
  hasPreOrder: boolean;
  preOrderItems: PreOrderItem[];
  depositRequired: boolean;
  depositAmount: number;
  depositStatus: DepositStatus;
  /** Filled on completion; drives revenue-per-cover analytics. */
  totalSpend: number;
  notes?: string;
  createdAt: string;
}

export type GuestTag = 'VIP' | 'regular' | 'repeat-no-show' | 'new';

export interface Guest {
  id: string;
  name: string;
  /** Unique key used to match guests across bookings and channels. */
  phone: string;
  email?: string;
  totalVisits: number;
  totalSpend: number;
  averagePartySize: number;
  lastVisitDate: string | null;
  preferences: string;
  allergies: string;
  tags: GuestTag[];
  birthday?: string;
  anniversary?: string;
  createdAt: string;
}

export type MenuCategory = 'Starters' | 'Main Course' | 'Drinks' | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  available: boolean;
}

export interface Review {
  id: string;
  guestId: string;
  reservationId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

// ----- Restaurant configuration (editable in /manager/settings) --------------

export interface DepositRules {
  enabled: boolean;
  /** Parties of this size or larger require a deposit. */
  largePartyThreshold: number;
  /** Per-guest deposit charged for large parties (in minor display currency). */
  perGuestAmount: number;
  /** Days considered "peak" (0=Sun … 6=Sat). */
  peakDays: number[];
  /** Bookings at/after this hour on peak days require a deposit. */
  peakStartHour: number;
  /** Flat deposit for peak bookings. */
  peakDeposit: number;
  /** Share of the pre-order total taken as an advance (0.2 = 20%). */
  preOrderAdvanceRate: number;
}

export interface Branding {
  restaurantName: string;
  primaryColor: string;
  logoText: string;
  currency: string; // ISO-ish display code, e.g. "PKR"
  currencySymbol: string; // e.g. "Rs"
}

export interface RestaurantSettings {
  branding: Branding;
  deposit: DepositRules;
  /** Default minutes a table is held per reservation. */
  reservationDurationMinutes: number;
}

// ----- The whole local "database" persisted to localStorage ------------------

export interface DB {
  version: number;
  tables: RestaurantTable[];
  reservations: Reservation[];
  guests: Guest[];
  menu: MenuItem[];
  reviews: Review[];
  settings: RestaurantSettings;
}

// ----- Input shape used by every booking channel -----------------------------

export interface BookingInput {
  customerName: string;
  phone: string;
  guests: number;
  tableId: string;
  reservationDate: string;
  reservationTime: string;
  source: BookingSource;
  notes?: string;
  preOrderItems?: PreOrderItem[];
  /** Whether the guest paid the deposit in the (mock) payment step. */
  depositPaid?: boolean;
}

export type BookingResult =
  | { ok: true; reservation: Reservation; guest: Guest }
  | { ok: false; error: string };