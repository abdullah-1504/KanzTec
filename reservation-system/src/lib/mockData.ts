import type {
  Guest,
  MenuItem,
  Reservation,
  RestaurantTable,
  Review,
} from '@/lib/types';
import { toDateStr } from '@/lib/helpers/datetime';

// =============================================================================
// Sample restaurant data + a realistic seed history so the dashboards and the
// ROI panel show meaningful numbers on first run.
// =============================================================================

// --- Tables (x/y are % positions for the floor-plan map) ---------------------
export const SAMPLE_TABLES: RestaurantTable[] = [
  { id: 't1', tableNumber: 1, capacity: 2, status: 'available', currentReservationId: null, x: 12, y: 18 },
  { id: 't2', tableNumber: 2, capacity: 2, status: 'available', currentReservationId: null, x: 38, y: 18 },
  { id: 't3', tableNumber: 3, capacity: 4, status: 'available', currentReservationId: null, x: 66, y: 18 },
  { id: 't4', tableNumber: 4, capacity: 4, status: 'available', currentReservationId: null, x: 12, y: 50 },
  { id: 't5', tableNumber: 5, capacity: 4, status: 'available', currentReservationId: null, x: 38, y: 50 },
  { id: 't6', tableNumber: 6, capacity: 6, status: 'available', currentReservationId: null, x: 66, y: 50 },
  { id: 't7', tableNumber: 7, capacity: 6, status: 'available', currentReservationId: null, x: 12, y: 82 },
  { id: 't8', tableNumber: 8, capacity: 8, status: 'available', currentReservationId: null, x: 42, y: 82 },
  { id: 't9', tableNumber: 9, capacity: 10, status: 'available', currentReservationId: null, x: 76, y: 82 },
];

// --- Menu ---------------------------------------------------------------------
export const SAMPLE_MENU: MenuItem[] = [
  // Starters
  { id: 'm1', name: 'Fries', description: 'Crispy salted shoestring fries', price: 350, category: 'Starters', available: true },
  { id: 'm2', name: 'Soup of the Day', description: 'Chef’s daily soup with garlic bread', price: 450, category: 'Starters', available: true },
  { id: 'm3', name: 'Chicken Wings', description: 'Six wings, buffalo or BBQ glaze', price: 650, category: 'Starters', available: true },
  // Main Course
  { id: 'm4', name: 'Chicken Burger', description: 'Grilled chicken, brioche bun, fries', price: 950, category: 'Main Course', available: true },
  { id: 'm5', name: 'Beef Burger', description: 'Smashed beef patty, cheddar, fries', price: 1150, category: 'Main Course', available: true },
  { id: 'm6', name: 'Alfredo Pasta', description: 'Creamy parmesan alfredo', price: 1050, category: 'Main Course', available: true },
  { id: 'm7', name: 'Chicken Steak', description: 'Grilled steak, mushroom sauce, mash', price: 1450, category: 'Main Course', available: true },
  { id: 'm8', name: 'Grilled Fish', description: 'Lemon-butter fish, seasonal greens', price: 1650, category: 'Main Course', available: true },
  // Drinks
  { id: 'm9', name: 'Mint Margarita', description: 'Fresh mint & lime mocktail', price: 400, category: 'Drinks', available: true },
  { id: 'm10', name: 'Fresh Lime', description: 'Sweet or salted', price: 300, category: 'Drinks', available: true },
  { id: 'm11', name: 'Soft Drink', description: 'Assorted canned beverages', price: 200, category: 'Drinks', available: true },
  { id: 'm12', name: 'Water', description: 'Mineral water 500ml', price: 100, category: 'Drinks', available: true },
  // Desserts
  { id: 'm13', name: 'Brownie', description: 'Warm fudge brownie', price: 550, category: 'Desserts', available: true },
  { id: 'm14', name: 'Ice Cream', description: 'Two scoops, choice of flavour', price: 400, category: 'Desserts', available: true },
  { id: 'm15', name: 'Cheesecake', description: 'New York style, berry compote', price: 600, category: 'Desserts', available: true },
];

// --- Seed guests (CRM) --------------------------------------------------------
export const SAMPLE_GUESTS: Guest[] = [
  { id: 'g1', name: 'Ayesha Khan', phone: '+923001234567', email: 'ayesha@example.com', totalVisits: 7, totalSpend: 48200, averagePartySize: 3.4, lastVisitDate: null, preferences: 'Prefers the window booth; still water only.', allergies: 'None', tags: ['VIP', 'regular'], birthday: '1992-03-14', createdAt: '2025-09-01T10:00:00.000Z' },
  { id: 'g2', name: 'Bilal Ahmed', phone: '+923009876543', email: '', totalVisits: 3, totalSpend: 12600, averagePartySize: 2, lastVisitDate: null, preferences: 'Likes a quiet corner.', allergies: 'Nuts', tags: ['regular'], createdAt: '2025-11-12T10:00:00.000Z' },
  { id: 'g3', name: 'Sara Malik', phone: '+923331112233', email: '', totalVisits: 1, totalSpend: 3100, averagePartySize: 4, lastVisitDate: null, preferences: '', allergies: '', tags: ['repeat-no-show'], createdAt: '2026-01-05T10:00:00.000Z' },
  { id: 'g4', name: 'Usman Tariq', phone: '+923215557788', email: 'usman@example.com', totalVisits: 4, totalSpend: 21800, averagePartySize: 5, lastVisitDate: null, preferences: 'Celebrates anniversaries here.', allergies: '', tags: ['regular'], anniversary: '06-30', createdAt: '2025-10-20T10:00:00.000Z' },
  { id: 'g5', name: 'Fatima Noor', phone: '+923004445566', email: '', totalVisits: 6, totalSpend: 39500, averagePartySize: 4.2, lastVisitDate: null, preferences: 'Big family bookings on weekends.', allergies: 'Shellfish', tags: ['VIP'], createdAt: '2025-08-15T10:00:00.000Z' },
];

// --- Seed reservation + review history ---------------------------------------
// Generated relative to "today" so the ROI dashboard always has fresh data.
function offsetDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return toDateStr(d);
}

interface SeedSpec {
  id: string;
  guestId: string;
  name: string;
  phone: string;
  guests: number;
  tableId: string;
  daysAgo: number;
  time: string;
  status: Reservation['status'];
  source: Reservation['source'];
  deposit: number;
  depositStatus: Reservation['depositStatus'];
  spend: number;
}

const SEED_SPECS: SeedSpec[] = [
  // Completed history (drives covers, revenue, deposits recovered)
  { id: 'r1', guestId: 'g1', name: 'Ayesha Khan', phone: '+923001234567', guests: 2, tableId: 't1', daysAgo: 26, time: '20:00', status: 'completed', source: 'whatsapp', deposit: 0, depositStatus: 'none', spend: 4200 },
  { id: 'r2', guestId: 'g5', name: 'Fatima Noor', phone: '+923004445566', guests: 8, tableId: 't8', daysAgo: 24, time: '19:30', status: 'completed', source: 'web', deposit: 4000, depositStatus: 'paid', spend: 18600 },
  { id: 'r3', guestId: 'g2', name: 'Bilal Ahmed', phone: '+923009876543', guests: 2, tableId: 't2', daysAgo: 20, time: '13:00', status: 'completed', source: 'walk-in', deposit: 0, depositStatus: 'none', spend: 3800 },
  { id: 'r4', guestId: 'g4', name: 'Usman Tariq', phone: '+923215557788', guests: 6, tableId: 't6', daysAgo: 18, time: '21:00', status: 'completed', source: 'whatsapp', deposit: 3000, depositStatus: 'paid', spend: 14200 },
  { id: 'r5', guestId: 'g3', name: 'Sara Malik', phone: '+923331112233', guests: 4, tableId: 't3', daysAgo: 16, time: '20:30', status: 'no-show', source: 'widget', deposit: 1500, depositStatus: 'forfeited', spend: 0 },
  { id: 'r6', guestId: 'g1', name: 'Ayesha Khan', phone: '+923001234567', guests: 4, tableId: 't5', daysAgo: 12, time: '19:00', status: 'completed', source: 'whatsapp', deposit: 1500, depositStatus: 'paid', spend: 9100 },
  { id: 'r7', guestId: 'g5', name: 'Fatima Noor', phone: '+923004445566', guests: 6, tableId: 't7', daysAgo: 9, time: '20:00', status: 'completed', source: 'web', deposit: 3000, depositStatus: 'paid', spend: 15400 },
  { id: 'r8', guestId: 'g2', name: 'Bilal Ahmed', phone: '+923009876543', guests: 2, tableId: 't1', daysAgo: 6, time: '14:00', status: 'completed', source: 'widget', deposit: 0, depositStatus: 'none', spend: 4100 },
  { id: 'r9', guestId: 'g4', name: 'Usman Tariq', phone: '+923215557788', guests: 4, tableId: 't4', daysAgo: 4, time: '19:30', status: 'completed', source: 'web', deposit: 1500, depositStatus: 'paid', spend: 8700 },
  { id: 'r10', guestId: 'g1', name: 'Ayesha Khan', phone: '+923001234567', guests: 3, tableId: 't3', daysAgo: 2, time: '20:30', status: 'completed', source: 'whatsapp', deposit: 1500, depositStatus: 'paid', spend: 7600 },
  // Today / upcoming (live on the dashboard)
  { id: 'r11', guestId: 'g5', name: 'Fatima Noor', phone: '+923004445566', guests: 6, tableId: 't6', daysAgo: 0, time: '21:00', status: 'confirmed', source: 'web', deposit: 3000, depositStatus: 'paid', spend: 0 },
  { id: 'r12', guestId: 'g2', name: 'Bilal Ahmed', phone: '+923009876543', guests: 2, tableId: 't2', daysAgo: 0, time: '22:00', status: 'confirmed', source: 'whatsapp', deposit: 0, depositStatus: 'none', spend: 0 },
];

export function buildSeedReservations(): Reservation[] {
  return SEED_SPECS.map((s) => ({
    id: s.id,
    guestId: s.guestId,
    customerName: s.name,
    phone: s.phone,
    guests: s.guests,
    tableId: s.tableId,
    reservationDate: offsetDate(s.daysAgo),
    reservationTime: s.time,
    status: s.status,
    source: s.source,
    hasPreOrder: s.deposit > 0 && s.source !== 'walk-in',
    preOrderItems: [],
    depositRequired: s.deposit > 0,
    depositAmount: s.deposit,
    depositStatus: s.depositStatus,
    totalSpend: s.spend,
    createdAt: new Date(Date.now() - s.daysAgo * 86_400_000).toISOString(),
  }));
}

export function buildSeedReviews(): Review[] {
  return [
    { id: 'rv1', guestId: 'g1', reservationId: 'r1', rating: 5, comment: 'Perfect window table, great service.', createdAt: offsetDate(26) },
    { id: 'rv2', guestId: 'g5', reservationId: 'r2', rating: 5, comment: 'Handled our big family booking flawlessly.', createdAt: offsetDate(24) },
    { id: 'rv3', guestId: 'g4', reservationId: 'r4', rating: 4, comment: 'Lovely anniversary dinner.', createdAt: offsetDate(18) },
    { id: 'rv4', guestId: 'g1', reservationId: 'r6', rating: 4, createdAt: offsetDate(12) },
    { id: 'rv5', guestId: 'g5', reservationId: 'r7', rating: 5, comment: 'Always our favourite spot.', createdAt: offsetDate(9) },
  ];
}