'use client';

import type { RestaurantTable } from '@/lib/types';
import { clsx } from '@/lib/helpers/clsx';
import { visualForKind, type TableVisualKind } from '@/lib/helpers/statusColors';

// A single table rendered as a tactile card on the floor map. Used by both the
// customer booking map and the manager dashboard.
export function TableCard({
  table,
  kind,
  selectable,
  reason,
  onSelect,
}: {
  table: RestaurantTable;
  kind: TableVisualKind;
  selectable: boolean;
  reason?: string;
  onSelect?: (table: RestaurantTable) => void;
}) {
  const v = visualForKind(kind);
  const isSelected = kind === 'selected';

  return (
    <button
      type="button"
      disabled={!onSelect}
      onClick={() => onSelect?.(table)}
      title={reason}
      className={clsx(
        'relative flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-center transition-all duration-150',
        v.card,
        onSelect && (selectable || isSelected) ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-not-allowed',
        isSelected && 'animate-pop',
      )}
    >
      {/* Selected check badge */}
      {isSelected && (
        <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-soft">
          ✓
        </span>
      )}
      {!isSelected && <span className={clsx('absolute right-2 top-2 h-2.5 w-2.5 rounded-full', v.dot)} />}

      <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Table</span>
      <span className="text-2xl font-bold leading-none text-stone-900">{table.tableNumber}</span>

      {/* Seat pips give a quick visual read of capacity */}
      <span className="flex max-w-[3.5rem] flex-wrap justify-center gap-0.5">
        {Array.from({ length: table.capacity }).map((_, i) => (
          <span key={i} className={clsx('h-1.5 w-1.5 rounded-full', v.dot, 'opacity-70')} />
        ))}
      </span>
      <span className="text-[11px] font-medium text-stone-500">{table.capacity} seats</span>

      <span className={clsx('mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold', v.badge)}>
        {v.label}
      </span>
    </button>
  );
}