'use client';

import type { Reservation, RestaurantTable, TableStatus } from '@/lib/types';
import { updateTableStatus } from '@/lib/store';
import { statusBadge } from '@/lib/helpers/statusColors';
import { formatTimeLabel } from '@/lib/helpers/datetime';
import { Modal, Button, Badge } from '@/components/ui';
import { clsx } from '@/lib/helpers/clsx';

const STATUSES: { value: TableStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'border-stone-300 text-stone-700' },
  { value: 'occupied', label: 'Occupied', color: 'border-rose-300 text-rose-700' },
  { value: 'reserved', label: 'Reserved', color: 'border-amber-300 text-amber-700' },
  { value: 'cleaning', label: 'Cleaning', color: 'border-violet-300 text-violet-700' },
];

// Manager control panel for a single table — opens when a table is tapped on the
// dashboard floor map.
export function TableStatusControls({
  table,
  reservations,
  onClose,
}: {
  table: RestaurantTable | null;
  reservations: Reservation[];
  onClose: () => void;
}) {
  if (!table) return null;
  const current = reservations.find((r) => r.id === table.currentReservationId);

  return (
    <Modal open={Boolean(table)} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-900">Table {table.tableNumber}</h3>
          <p className="text-sm text-stone-500">{table.capacity} seats</p>
        </div>
        <Badge className={statusBadge(table.status)}>{table.status}</Badge>
      </div>

      {current && (
        <div className="mb-4 rounded-xl bg-stone-50 p-3 text-sm">
          <p className="font-semibold text-stone-800">{current.customerName}</p>
          <p className="text-stone-500">
            {current.guests} guests · {formatTimeLabel(current.reservationTime)} · {current.source}
          </p>
        </div>
      )}

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
        Set table status
      </p>
      <div className="grid grid-cols-2 gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              updateTableStatus(table.id, s.value);
              onClose();
            }}
            className={clsx(
              'rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors hover:bg-stone-50',
              table.status === s.value ? s.color + ' bg-stone-50' : 'border-stone-200 text-stone-600',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Button variant="ghost" className="mt-4 w-full" onClick={onClose}>
        Close
      </Button>
    </Modal>
  );
}