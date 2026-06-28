'use client';

import { useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/PublicHeader';
import { BookingFlow } from '@/components/booking/BookingFlow';

// Customer reservation page (channel: web).
export default function ReservationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-10 text-white shadow-lift sm:px-10 sm:py-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Live availability
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Reserve Your Table</h1>
          <p className="mt-3 max-w-lg text-base text-white/90 sm:text-lg">
            Choose your table in real time and reserve instantly — it only takes a minute.
          </p>
        </div>

        <BookingFlow
          source="web"
          onBooked={(id) => router.push(`/reservations/success?id=${id}`)}
        />
      </main>
    </div>
  );
}