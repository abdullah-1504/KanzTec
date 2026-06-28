'use client';

import type { DepositDecision } from '@/lib/helpers/deposits';
import { formatMoney } from '@/lib/helpers/pricing';
import { Badge } from '@/components/ui';

// Mock deposit / advance payment panel. Structured so a real gateway (Raast,
// JazzCash, Easypaisa, card) replaces only the `onPay` action later.
export function DepositPanel({
  decision,
  preOrderSubtotal,
  paid,
  currencySymbol,
}: {
  decision: DepositDecision;
  preOrderSubtotal: number;
  paid: boolean;
  currencySymbol: string;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-amber-900">Secure your table</h4>
        <Badge className={paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
          {paid ? 'Paid (mock)' : 'Unpaid'}
        </Badge>
      </div>

      {decision.reasons.length > 0 && (
        <ul className="space-y-0.5 text-xs text-amber-800">
          {decision.reasons.map((r, i) => (
            <li key={i}>• {r}</li>
          ))}
        </ul>
      )}

      <div className="space-y-1.5 border-t border-amber-200 pt-3 text-sm">
        {preOrderSubtotal > 0 && (
          <Row label="Pre-order subtotal" value={formatMoney(preOrderSubtotal, currencySymbol)} muted />
        )}
        {decision.baseAmount > 0 && (
          <Row label="Booking deposit" value={formatMoney(decision.baseAmount, currencySymbol)} muted />
        )}
        {decision.preOrderAdvance > 0 && (
          <Row label="Pre-order advance" value={formatMoney(decision.preOrderAdvance, currencySymbol)} muted />
        )}
        <Row
          label="Due now"
          value={formatMoney(decision.amount, currencySymbol)}
          strong
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-amber-700' : 'font-semibold text-amber-900'}>{label}</span>
      <span className={strong ? 'text-base font-bold text-amber-900' : 'text-amber-800'}>{value}</span>
    </div>
  );
}