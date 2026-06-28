'use client';

import type { PreOrderItem, RestaurantTable } from '@/lib/types';
import { formatDateTimeLabel } from '@/lib/helpers/datetime';
import { formatMoney, preOrderTotal } from '@/lib/helpers/pricing';

// Compact, reusable booking recap. Used in the reservation sidebar and the
// success screen.
export function BookingSummary({
  table,
  guests,
  date,
  time,
  preOrderItems = [],
  depositAmount = 0,
  depositPaid,
  currencySymbol,
}: {
  table: RestaurantTable | null;
  guests: number;
  date: string;
  time: string;
  preOrderItems?: PreOrderItem[];
  depositAmount?: number;
  depositPaid?: boolean;
  currencySymbol: string;
}) {
  return (
    <div className="space-y-3 text-sm">
      <Row label="Table" value={table ? `Table ${table.tableNumber} · ${table.capacity} seats` : '—'} />
      <Row label="Guests" value={`${guests}`} />
      <Row label="When" value={date && time ? formatDateTimeLabel(date, time) : '—'} />

      {preOrderItems.length > 0 && (
        <div className="border-t border-stone-100 pt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Pre-order
          </p>
          <ul className="space-y-1">
            {preOrderItems.map((i) => (
              <li key={i.menuItemId} className="flex justify-between text-stone-600">
                <span>
                  {i.quantity}× {i.name}
                </span>
                <span>{formatMoney(i.total, currencySymbol)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-1.5 flex justify-between font-semibold text-stone-800">
            <span>Subtotal</span>
            <span>{formatMoney(preOrderTotal(preOrderItems), currencySymbol)}</span>
          </div>
        </div>
      )}

      {depositAmount > 0 && (
        <div className="flex justify-between border-t border-stone-100 pt-3">
          <span className="font-semibold text-stone-700">
            Deposit {depositPaid ? '(paid)' : '(due)'}
          </span>
          <span className="font-bold text-stone-900">{formatMoney(depositAmount, currencySymbol)}</span>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-500">{label}</span>
      <span className="font-semibold text-stone-800">{value}</span>
    </div>
  );
}