import type { TableStatus } from '@/lib/types';

// The "visual kind" a table can render as on the map. This is richer than the
// stored TableStatus because it also encodes guest-facing states like
// "selected", "too small for this party", and "reserved soon".
export type TableVisualKind =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'selected'
  | 'upcoming'
  | 'too-small';

interface VisualStyle {
  label: string;
  /** Classes for the table card body. */
  card: string;
  /** Classes for the small status badge. */
  badge: string;
  dot: string;
  selectable: boolean;
}

// Single source of truth for the color legend used on both the customer map and
// the manager dashboard. Grey=available, Red=busy, Green=selected, Yellow=soon,
// Blue/Purple=cleaning.
export const TABLE_VISUALS: Record<TableVisualKind, VisualStyle> = {
  available: {
    label: 'Available',
    card: 'border-stone-200 bg-white hover:border-brand-400 hover:shadow-lift',
    badge: 'bg-stone-100 text-stone-600',
    dot: 'bg-stone-400',
    selectable: true,
  },
  selected: {
    label: 'Selected',
    card: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30 shadow-lift',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    selectable: true,
  },
  occupied: {
    label: 'Occupied',
    card: 'border-rose-200 bg-rose-50 opacity-95',
    badge: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
    selectable: false,
  },
  reserved: {
    label: 'Reserved',
    card: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    selectable: false,
  },
  upcoming: {
    label: 'Reserved soon',
    card: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    selectable: false,
  },
  cleaning: {
    label: 'Cleaning',
    card: 'border-violet-200 bg-violet-50',
    badge: 'bg-violet-100 text-violet-700',
    dot: 'bg-violet-500',
    selectable: false,
  },
  'too-small': {
    label: 'Too small',
    card: 'border-stone-200 bg-stone-50 opacity-40',
    badge: 'bg-stone-100 text-stone-400',
    dot: 'bg-stone-300',
    selectable: false,
  },
};

export function visualForKind(kind: TableVisualKind): VisualStyle {
  return TABLE_VISUALS[kind];
}

/** Badge styling for the stored table status (manager controls / lists). */
export function statusBadge(status: TableStatus): string {
  const map: Record<TableStatus, string> = {
    available: 'bg-stone-100 text-stone-600',
    occupied: 'bg-rose-100 text-rose-700',
    reserved: 'bg-amber-100 text-amber-700',
    cleaning: 'bg-violet-100 text-violet-700',
  };
  return map[status];
}

export const LEGEND: { kind: TableVisualKind; label: string }[] = [
  { kind: 'available', label: 'Available' },
  { kind: 'occupied', label: 'Occupied / Booked' },
  { kind: 'selected', label: 'Selected' },
  { kind: 'upcoming', label: 'Reserved soon' },
  { kind: 'cleaning', label: 'Cleaning' },
];