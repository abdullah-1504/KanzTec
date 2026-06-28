'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PublicHeader } from '@/components/PublicHeader';
import { useRestaurant } from '@/lib/hooks';
import { Button, Card, Spinner, EmptyState } from '@/components/ui';
import { BookingSummary } from '@/components/booking/BookingSummary';

function SuccessContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const { db, loading } = useRestaurant();

  if (loading) return <Spinner />;

  const reservation = db?.reservations.find((r) => r.id === id);
  const table = db?.tables.find((t) => t.id === reservation?.tableId) ?? null;
  const symbol = db?.settings.branding.currencySymbol ?? 'Rs';

  if (!reservation) {
    return (
      <Card>
        <EmptyState
          title="Booking not found"
          hint="This confirmation link may have expired."
        />
        <Link href="/reservations" className="mt-4 block">
          <Button className="w-full">Make a booking</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
        ✅
      </div>
      <div>
        <h1 className="text-2xl font-bold text-stone-900">You’re booked, {reservation.customerName.split(' ')[0]}!</h1>
        <p className="mt-1 text-sm text-stone-500">
          Confirmation <span className="font-semibold">#{reservation.id.slice(-6).toUpperCase()}</span>
          {' · '}
          via {reservation.source}
        </p>
      </div>

      <div className="rounded-xl border border-stone-200 p-4 text-left">
        <BookingSummary
          table={table}
          guests={reservation.guests}
          date={reservation.reservationDate}
          time={reservation.reservationTime}
          preOrderItems={reservation.preOrderItems}
          depositAmount={reservation.depositAmount}
          depositPaid={reservation.depositStatus === 'paid'}
          currencySymbol={symbol}
        />
      </div>

      {reservation.depositStatus === 'paid' && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          Deposit received — your table is guaranteed. 🎉
        </p>
      )}

      <div className="flex gap-3">
        <Link href="/reservations" className="flex-1">
          <Button variant="secondary" className="w-full">
            New booking
          </Button>
        </Link>
        <Link href="/manager/dashboard" className="flex-1">
          <Button className="w-full">View on dashboard</Button>
        </Link>
      </div>
    </Card>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PublicHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <Suspense fallback={<Spinner />}>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}