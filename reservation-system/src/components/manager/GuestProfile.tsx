'use client';

import { useMemo, useState } from 'react';
import type { Guest, Reservation, Review, RestaurantTable } from '@/lib/types';
import { updateGuest } from '@/lib/store';
import { formatDateTimeLabel } from '@/lib/helpers/datetime';
import { formatMoney } from '@/lib/helpers/pricing';
import { Badge, Button, Card, Input, SectionTitle, Textarea, EmptyState } from '@/components/ui';
import { GuestTags } from '@/components/manager/GuestTags';
import { ReviewForm } from '@/components/manager/ReviewForm';

export function GuestProfile({
  guest,
  reservations,
  reviews,
  tables,
  currencySymbol,
}: {
  guest: Guest;
  reservations: Reservation[];
  reviews: Review[];
  tables: RestaurantTable[];
  currencySymbol: string;
}) {
  const [preferences, setPreferences] = useState(guest.preferences);
  const [allergies, setAllergies] = useState(guest.allergies);
  const [savedNote, setSavedNote] = useState(false);

  const history = useMemo(
    () =>
      [...reservations].sort((a, b) =>
        (b.reservationDate + b.reservationTime).localeCompare(a.reservationDate + a.reservationTime),
      ),
    [reservations],
  );

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  const tableNumber = (id: string) => tables.find((t) => t.id === id)?.tableNumber ?? '—';
  const reviewedIds = new Set(reviews.map((r) => r.reservationId));

  const toggleVip = () => {
    const has = guest.tags.includes('VIP');
    const tags = has ? guest.tags.filter((t) => t !== 'VIP') : [...guest.tags, 'VIP' as const];
    updateGuest(guest.id, { tags });
  };

  const saveNotes = () => {
    updateGuest(guest.id, { preferences, allergies });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              {guest.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">{guest.name}</h1>
                <GuestTags tags={guest.tags} />
              </div>
              <p className="text-sm text-stone-500">{guest.phone}{guest.email ? ` · ${guest.email}` : ''}</p>
              {avgRating && (
                <p className="mt-0.5 text-sm text-amber-500">
                  ★ {avgRating} <span className="text-stone-400">({reviews.length} reviews)</span>
                </p>
              )}
            </div>
          </div>
          <Button variant={guest.tags.includes('VIP') ? 'secondary' : 'primary'} onClick={toggleVip}>
            {guest.tags.includes('VIP') ? 'Remove VIP' : '🌟 Mark VIP'}
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Total visits" value={`${guest.totalVisits}`} />
          <Metric label="Total spend" value={formatMoney(guest.totalSpend, currencySymbol)} />
          <Metric label="Avg party" value={`${guest.averagePartySize || '—'}`} />
          <Metric label="Last visit" value={guest.lastVisitDate ?? '—'} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Order history */}
        <Card>
          <SectionTitle title="Visit & order history" subtitle="Every reservation and pre-order for this guest." />
          {history.length === 0 ? (
            <EmptyState title="No visits yet" />
          ) : (
            <div className="space-y-3">
              {history.map((r) => (
                <div key={r.id} className="rounded-xl border border-stone-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-800">
                      {formatDateTimeLabel(r.reservationDate, r.reservationTime)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-stone-100 text-stone-500">{r.source}</Badge>
                      <Badge
                        className={
                          r.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : r.status === 'no-show'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-stone-100 text-stone-500'
                        }
                      >
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Table {tableNumber(r.tableId)} · {r.guests} guests
                    {r.totalSpend > 0 && <> · spent {formatMoney(r.totalSpend, currencySymbol)}</>}
                  </p>
                  {r.preOrderItems.length > 0 && (
                    <p className="mt-1 text-xs text-stone-500">
                      Pre-ordered: {r.preOrderItems.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                  )}
                  {r.status === 'completed' && !reviewedIds.has(r.id) && (
                    <div className="mt-2 border-t border-stone-100 pt-2">
                      <p className="mb-1 text-xs font-semibold text-stone-500">Add a post-visit review</p>
                      <ReviewForm guestId={guest.id} reservationId={r.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notes & reviews */}
        <div className="space-y-6">
          <Card>
            <SectionTitle title="Preferences & allergies" />
            <div className="space-y-3">
              <Textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g. prefers window seat, sparkling water"
              />
              <Input
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Allergies (e.g. nuts)"
              />
              <Button onClick={saveNotes} variant={savedNote ? 'success' : 'secondary'} className="w-full">
                {savedNote ? 'Saved!' : 'Save notes'}
              </Button>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Reviews" />
            {reviews.length === 0 ? (
              <EmptyState title="No reviews yet" />
            ) : (
              <div className="space-y-2">
                {reviews.map((rv) => (
                  <div key={rv.id} className="rounded-xl bg-stone-50 p-3">
                    <p className="text-amber-400">{'★'.repeat(rv.rating)}<span className="text-stone-300">{'★'.repeat(5 - rv.rating)}</span></p>
                    {rv.comment && <p className="mt-1 text-sm text-stone-600">{rv.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 p-3">
      <p className="text-lg font-bold text-stone-900">{value}</p>
      <p className="text-xs text-stone-400">{label}</p>
    </div>
  );
}