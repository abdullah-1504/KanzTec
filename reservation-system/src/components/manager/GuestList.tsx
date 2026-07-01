'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Guest } from '@/lib/types';
import { phoneDigits } from '@/lib/helpers/guests';
import { formatMoney } from '@/lib/helpers/pricing';
import { Badge, EmptyState, Input } from '@/components/ui';
import { GuestTags } from '@/components/manager/GuestTags';

// Searchable guest directory (the CRM home).
export function GuestList({
  guests,
  currencySymbol,
}: {
  guests: Guest[];
  currencySymbol: string;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qPhone = phoneDigits(query);
    return [...guests]
      .filter(
        (g) =>
          !q ||
          g.name.toLowerCase().includes(q) ||
          (qPhone !== '' && phoneDigits(g.phone).includes(qPhone)),
      )
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [guests, query]);

  return (
    <div className="space-y-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search guests by name or phone…"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No guests found" hint="Guests are created automatically on their first booking." />
      ) : (
        <div className="space-y-2">
          {filtered.map((g) => (
            <Link
              key={g.id}
              href={`/manager/guests/${g.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/30"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-600">
                  {g.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-stone-800">{g.name}</p>
                    <GuestTags tags={g.tags} />
                  </div>
                  <p className="text-xs text-stone-500">{g.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-right">
                <Stat label="Visits" value={`${g.totalVisits}`} />
                <Stat label="Spend" value={formatMoney(g.totalSpend, currencySymbol)} />
                <Badge className="bg-stone-100 text-stone-500">View →</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-stone-800">{value}</p>
      <p className="text-[11px] text-stone-400">{label}</p>
    </div>
  );
}