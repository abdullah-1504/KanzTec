'use client';

import { useMemo, useState } from 'react';
import type { Guest, Reservation } from '@/lib/types';
import {
  computeAnalytics,
  type AnalyticsRange,
} from '@/lib/helpers/analytics';
import { formatMoney } from '@/lib/helpers/pricing';
import { clsx } from '@/lib/helpers/clsx';

const RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
];

// The retention feature: proves platform ROI at a glance. Everything is computed
// live from reservations + guests.
export function RoiDashboard({
  reservations,
  guests,
  currencySymbol,
}: {
  reservations: Reservation[];
  guests: Guest[];
  currencySymbol: string;
}) {
  const [range, setRange] = useState<AnalyticsRange>('month');
  const a = useMemo(
    () => computeAnalytics(reservations, guests, range),
    [reservations, guests, range],
  );

  const maxCovers = Math.max(1, ...a.coversOverTime.map((d) => d.covers));
  const maxPeak = Math.max(1, ...a.peakSlots.map((p) => p.count));

  return (
    <div className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Performance &amp; ROI</h2>
          <p className="text-sm text-stone-500">What the platform is earning you.</p>
        </div>
        <div className="flex rounded-xl border border-stone-200 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                range === r.key ? 'bg-brand-600 text-white' : 'text-stone-500 hover:bg-stone-100',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero metric */}
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white">
        <p className="text-sm font-medium text-emerald-100">Deposit revenue recovered</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">
          {formatMoney(a.depositRevenueRecovered, currencySymbol)}
        </p>
        <p className="mt-1 text-xs text-emerald-100">
          Secured up-front from {a.range === 'today' ? 'today' : `the ${a.range}`} — money you’d
          otherwise lose to no-shows.
        </p>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total covers" value={`${a.covers}`} />
        <Metric label="No-show rate" value={`${Math.round(a.noShowRate * 100)}%`} tone={a.noShowRate > 0.15 ? 'bad' : 'good'} />
        <Metric label="Repeat guests" value={`${Math.round(a.repeatGuestRate * 100)}%`} />
        <Metric label="Revenue / cover" value={formatMoney(a.revenuePerCover, currencySymbol)} />
      </div>

      {/* Charts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Covers over time
          </p>
          {a.coversOverTime.some((d) => d.covers > 0) ? (
            <div className="flex h-28 items-end gap-1">
              {a.coversOverTime.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${d.covers}`}>
                  <div
                    className="w-full rounded-t bg-brand-500/80"
                    style={{ height: `${(d.covers / maxCovers) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-stone-400">No covers in this range yet.</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Peak time slots
          </p>
          {a.peakSlots.length ? (
            <div className="space-y-1.5">
              {a.peakSlots.map((p) => (
                <div key={p.hour} className="flex items-center gap-2">
                  <span className="w-10 text-xs text-stone-500">{p.label}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(p.count / maxPeak) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-stone-600">{p.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-stone-400">Not enough data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'bad';
}) {
  return (
    <div className="rounded-xl border border-stone-200 p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p
        className={clsx(
          'mt-0.5 text-xl font-bold',
          tone === 'bad' ? 'text-rose-600' : tone === 'good' ? 'text-emerald-600' : 'text-stone-900',
        )}
      >
        {value}
      </p>
    </div>
  );
}