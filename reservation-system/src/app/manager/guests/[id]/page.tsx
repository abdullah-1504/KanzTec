'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRestaurant } from '@/lib/hooks';
import { Card, EmptyState, Spinner } from '@/components/ui';
import { GuestProfile } from '@/components/manager/GuestProfile';

export default function GuestDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { db, loading } = useRestaurant();

  if (loading || !db) return <Spinner label="Loading guest…" />;

  const guest = db.guests.find((g) => g.id === id);
  if (!guest) {
    return (
      <Card>
        <EmptyState title="Guest not found" />
        <Link href="/manager/guests" className="mt-3 block text-sm font-semibold text-brand-600">
          ← Back to guests
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/manager/guests" className="text-sm font-medium text-stone-500 hover:text-stone-800">
        ← All guests
      </Link>
      <GuestProfile
        guest={guest}
        reservations={db.reservations.filter((r) => r.guestId === guest.id)}
        reviews={db.reviews.filter((r) => r.guestId === guest.id)}
        tables={db.tables}
        currencySymbol={db.settings.branding.currencySymbol}
      />
    </div>
  );
}