'use client';

import { clsx } from '@/lib/helpers/clsx';

// Stepper + quick chips for choosing party size.
export function GuestSelector({
  value,
  onChange,
  max = 20,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}) {
  const set = (n: number) => onChange(Math.max(1, Math.min(max, n)));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set(value - 1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-300 text-xl font-semibold text-stone-600 hover:bg-stone-50"
          aria-label="Fewer guests"
        >
          −
        </button>
        <div className="flex h-11 min-w-[5rem] flex-1 items-center justify-center rounded-xl border border-stone-300 bg-white text-lg font-bold text-stone-900">
          {value} {value === 1 ? 'guest' : 'guests'}
        </div>
        <button
          type="button"
          onClick={() => set(value + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-300 text-xl font-semibold text-stone-600 hover:bg-stone-50"
          aria-label="More guests"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {[2, 4, 6, 8].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => set(n)}
            className={clsx(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              value === n
                ? 'bg-brand-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
            )}
          >
            {n} guests
          </button>
        ))}
      </div>
    </div>
  );
}