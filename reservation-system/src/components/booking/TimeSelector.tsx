'use client';

import { Input, Select } from '@/components/ui';
import { clsx } from '@/lib/helpers/clsx';
import { daySlots, formatTimeLabel, todayStr, nextSlot, toTimeStr } from '@/lib/helpers/datetime';

const SLOTS = daySlots(12, 23, 30);

// "Right now" vs a future date/time. Emits a normalised { date, time }.
export function TimeSelector({
  mode,
  date,
  time,
  onModeChange,
  onDateChange,
  onTimeChange,
}: {
  mode: 'now' | 'future';
  date: string;
  time: string;
  onModeChange: (m: 'now' | 'future') => void;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
}) {
  const pick = (m: 'now' | 'future') => {
    onModeChange(m);
    if (m === 'now') {
      onDateChange(todayStr());
      onTimeChange(toTimeStr(new Date()));
    } else {
      onDateChange(todayStr());
      onTimeChange(toTimeStr(nextSlot()));
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(['now', 'future'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => pick(m)}
            className={clsx(
              'rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
              mode === m
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200'
                : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50',
            )}
          >
            {m === 'now' ? '⚡ Right now' : '📅 Future date & time'}
          </button>
        ))}
      </div>

      {mode === 'future' && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={date}
            min={todayStr()}
            onChange={(e) => onDateChange(e.target.value)}
          />
          <Select value={SLOTS.includes(time) ? time : ''} onChange={(e) => onTimeChange(e.target.value)}>
            <option value="" disabled>
              Select time
            </option>
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {formatTimeLabel(s)}
              </option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
}