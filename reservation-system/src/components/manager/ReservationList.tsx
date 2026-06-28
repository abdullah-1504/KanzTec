'use client';

import { useMemo, useState } from 'react';
import type { BookingSource, Reservation, ReservationStatus, RestaurantTable } from '@/lib/types';
import { updateReservationStatus } from '@/lib/store';
import { formatDateTimeLabel } from '@/lib/helpers/datetime';
import { formatMoney } from '@/lib/helpers/pricing';
import { normalizePhone } from '@/lib/helpers/guests';
import { Badge, Button, EmptyState, Input } from '@/components/ui';
import { clsx } from '@/lib/helpers/clsx';

const SOURCE_STYLE: Record<BookingSource, string> = {
  web: 'bg-brand-50 text-brand-700',
  widget: 'bg-violet-50 text-violet-700',
  whatsapp: 'bg-emerald-50 text-emerald-700',
  'walk-in': 'bg-stone-100 text-stone-600',
};

const STATUS_STYLE: Record<ReservationStatus, string> = {
  confirmed: 'bg-brand-50 text-brand-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-stone-100 text-stone-500',
  'no-show': 'bg-rose-50 text-rose-700',
};

export function ReservationList({
  reservations,
  tables,
  currencySymbol,
  showFilters = false,
  emptyHint,
}: {
  reservations: Reservation[];
  tables: RestaurantTable[];
  currencySymbol: string;
  showFilters?: boolean;
  emptyHint?: string;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');

  const tableNumber = (id: string) => tables.find((t) => t.id === id)?.tableNumber ?? '—';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qPhone = normalizePhone(query);
    return reservations
      .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
      .filter((r) => {
        if (!q) return true;
        return (
          r.customerName.toLowerCase().includes(q) ||
          normalizePhone(r.phone).includes(qPhone) ||
          String(tableNumber(r.tableId)).includes(q)
        );
      })
      .sort((a, b) => (b.reservationDate + b.reservationTime).localeCompare(a.reservationDate + a.reservationTime));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations, query, statusFilter, tables]);

  return (
    <div className="space-y-3">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone or table…"
            className="max-w-xs"
          />
          <div className="flex flex-wrap gap-1">
            {(['all', 'confirmed', 'completed', 'no-show', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors',
                  statusFilter === s ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No reservations" hint={emptyHint ?? 'Bookings will appear here in real time.'} />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-stone-800">{r.customerName}</p>
                  <Badge className={SOURCE_STYLE[r.source]}>{r.source}</Badge>
                  {r.depositStatus === 'paid' && (
                    <Badge className="bg-emerald-50 text-emerald-700">
                      deposit {formatMoney(r.depositAmount, currencySymbol)}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-stone-500">
                  Table {tableNumber(r.tableId)} · {r.guests} guests ·{' '}
                  {formatDateTimeLabel(r.reservationDate, r.reservationTime)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={STATUS_STYLE[r.status]}>{r.status}</Badge>
                {r.status === 'confirmed' && (
                  <div className="flex gap-1">
                    <Button
                      variant="success"
                      className="px-2.5 py-1.5 text-xs"
                      onClick={() => updateReservationStatus(r.id, 'completed')}
                    >
                      Complete
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-2.5 py-1.5 text-xs"
                      onClick={() => updateReservationStatus(r.id, 'no-show')}
                    >
                      No-show
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2.5 py-1.5 text-xs text-rose-600"
                      onClick={() => updateReservationStatus(r.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}