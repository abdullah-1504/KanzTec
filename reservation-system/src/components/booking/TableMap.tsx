'use client';

import type { Reservation, RestaurantTable } from '@/lib/types';
import { computeTableVisual } from '@/lib/helpers/availability';
import { LEGEND, visualForKind, type TableVisualKind } from '@/lib/helpers/statusColors';
import { clsx } from '@/lib/helpers/clsx';

// =============================================================================
// Visual restaurant FLOOR PLAN. Tables are positioned by their x/y (% of the
// floor) and drawn as table-tops with chairs around them, sized by capacity.
// "booking" mode colours tables by the chosen party/time/selection;
// "manager" mode reflects each table's stored status.
// =============================================================================

// Per-status styling for the floor tokens (kept local to the floor look).
const FLOOR: Record<TableVisualKind, { surface: string; chair: string; text: string }> = {
  available: { surface: 'bg-white border-stone-300', chair: 'bg-stone-300', text: 'text-stone-900' },
  selected: { surface: 'bg-emerald-500 border-emerald-600 ring-4 ring-emerald-200', chair: 'bg-emerald-300', text: 'text-white' },
  occupied: { surface: 'bg-rose-100 border-rose-300', chair: 'bg-rose-300', text: 'text-rose-900' },
  reserved: { surface: 'bg-amber-100 border-amber-300', chair: 'bg-amber-300', text: 'text-amber-900' },
  upcoming: { surface: 'bg-amber-100 border-amber-300', chair: 'bg-amber-300', text: 'text-amber-900' },
  cleaning: { surface: 'bg-violet-100 border-violet-300', chair: 'bg-violet-300', text: 'text-violet-900' },
  'too-small': { surface: 'bg-stone-100 border-stone-200 opacity-40', chair: 'bg-stone-200', text: 'text-stone-400' },
};

export function TableMap({
  tables,
  reservations,
  mode,
  guests = 0,
  date = '',
  time = '',
  selectedTableId = null,
  onSelect,
}: {
  tables: RestaurantTable[];
  reservations: Reservation[];
  mode: 'booking' | 'manager';
  guests?: number;
  date?: string;
  time?: string;
  selectedTableId?: string | null;
  onSelect?: (table: RestaurantTable) => void;
}) {
  return (
    <div>
      {/* Scroll horizontally on small screens so the plan never squashes. */}
      <div className="scroll-thin overflow-x-auto">
        <div
          className="relative mx-auto h-[460px] min-w-[560px] overflow-hidden rounded-3xl border border-stone-200"
          style={{
            // Subtle wooden-floor feel with faint grid lines.
            backgroundColor: '#fbf7f1',
            backgroundImage:
              'linear-gradient(0deg, rgba(120,90,60,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(120,90,60,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        >
          {/* Room zones for orientation */}
          <span className="absolute right-3 top-3 rounded-lg bg-stone-200/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Kitchen &amp; Bar
          </span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg border border-dashed border-stone-300 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            ⬍ Entrance
          </span>

          {tables.map((table) => {
            let kind: TableVisualKind;
            let selectable: boolean;
            let reason: string | undefined;

            if (mode === 'booking') {
              const v = computeTableVisual(table, reservations, date, time, guests, selectedTableId);
              kind = v.kind;
              selectable = v.selectable;
              reason = v.reason;
            } else {
              kind = selectedTableId === table.id ? 'selected' : (table.status as TableVisualKind);
              selectable = true;
            }

            const clickable = Boolean(onSelect) && (mode === 'manager' || selectable || kind === 'selected');

            return (
              <FloorTable
                key={table.id}
                table={table}
                kind={kind}
                reason={reason}
                onClick={clickable ? () => onSelect?.(table) : undefined}
              />
            );
          })}
        </div>
      </div>
      <Legend />
    </div>
  );
}

// Distribute chairs around a table based on capacity.
function chairLayout(capacity: number): { top: number; bottom: number; left: number; right: number } {
  const perSide = capacity >= 8 ? 1 : 0; // big tables get a chair at each end
  const remaining = capacity - perSide * 2;
  const top = Math.ceil(remaining / 2);
  const bottom = remaining - top;
  return { top, bottom, left: perSide, right: perSide };
}

function Chairs({ count, axis, color }: { count: number; axis: 'h' | 'v'; color: string }) {
  if (count <= 0) return null;
  return (
    <div className={clsx('flex justify-center', axis === 'h' ? 'flex-row gap-1.5' : 'flex-col gap-1.5')}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={clsx('rounded-full', color, axis === 'h' ? 'h-2 w-4' : 'h-4 w-2')}
        />
      ))}
    </div>
  );
}

function FloorTable({
  table,
  kind,
  reason,
  onClick,
}: {
  table: RestaurantTable;
  kind: TableVisualKind;
  reason?: string;
  onClick?: () => void;
}) {
  const s = FLOOR[kind];
  const layout = chairLayout(table.capacity);
  const isSelected = kind === 'selected';

  // Surface width grows with chairs along the long edge.
  const cols = Math.max(layout.top, layout.bottom, 1);
  const surfaceW = Math.max(56, cols * 22 + 18);
  const surfaceH = layout.left || layout.right ? 60 : 50;

  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      title={reason ? `Table ${table.tableNumber} — ${reason}` : `Table ${table.tableNumber}`}
      className={clsx(
        'group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform',
        onClick ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed',
        isSelected && 'z-10 animate-pop',
      )}
      style={{ left: `${table.x}%`, top: `${table.y}%` }}
    >
      <Chairs count={layout.top} axis="h" color={s.chair} />
      <div className="my-1 flex items-center gap-1.5">
        <Chairs count={layout.left} axis="v" color={s.chair} />
        <div
          className={clsx('relative flex flex-col items-center justify-center rounded-xl border-2 shadow-soft', s.surface, s.text)}
          style={{ width: surfaceW, height: surfaceH }}
        >
          {isSelected && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white shadow">
              ✓
            </span>
          )}
          <span className="text-lg font-bold leading-none">{table.tableNumber}</span>
          <span className="text-[10px] font-semibold leading-none opacity-80">{table.capacity} seats</span>
        </div>
        <Chairs count={layout.right} axis="v" color={s.chair} />
      </div>
      <Chairs count={layout.bottom} axis="h" color={s.chair} />
    </button>
  );
}

export function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      {LEGEND.map(({ kind, label }) => (
        <span key={kind} className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className={clsx('h-3 w-3 rounded-full', visualForKind(kind).dot)} />
          {label}
        </span>
      ))}
    </div>
  );
}