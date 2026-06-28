'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { useRestaurant } from '@/lib/hooks';
import { Spinner } from '@/components/ui';

// Standalone, embeddable booking widget. Designed to be dropped into a
// restaurant's own website via <iframe src="/widget?...">. It deliberately has
// NO app chrome and is themeable via query params so it matches the host brand.
function WidgetContent() {
  const params = useSearchParams();
  const { db } = useRestaurant();

  const accent = params.get('primary') || db?.settings.branding.primaryColor || '#326dff';
  const name = params.get('name') || db?.settings.branding.restaurantName || 'Book a table';
  const logo = params.get('logo') || db?.settings.branding.logoText || 'CS';

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            {logo}
          </span>
          <div>
            <p className="text-sm font-bold text-stone-900">{name}</p>
            <p className="text-xs text-stone-400">Book a table — live availability</p>
          </div>
        </div>

        <BookingFlow source="widget" compact inlineSuccess accentColor={accent} />

        <p className="mt-6 text-center text-[11px] text-stone-300">
          Powered by TableKit · commission-free direct bookings
        </p>
      </div>
    </div>
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <WidgetContent />
    </Suspense>
  );
}