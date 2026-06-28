'use client';

import { useState } from 'react';
import type { RestaurantTable } from '@/lib/types';
import { useRestaurant } from '@/lib/hooks';
import { todayStr } from '@/lib/helpers/datetime';
import { Card, PageHeader, SectionTitle, Spinner, Hint } from '@/components/ui';
import { ManagerStats } from '@/components/manager/ManagerStats';
import { RoiDashboard } from '@/components/manager/RoiDashboard';
import { TableMap } from '@/components/booking/TableMap';
import { TableStatusControls } from '@/components/manager/TableStatusControls';
import { WalkInForm } from '@/components/manager/WalkInForm';
import { ReservationList } from '@/components/manager/ReservationList';

export default function DashboardPage() {
  const { db, loading } = useRestaurant();
  const [selected, setSelected] = useState<RestaurantTable | null>(null);

  if (loading || !db) return <Spinner label="Loading dashboard…" />;

  const { tables, reservations, guests, settings } = db;
  const symbol = settings.branding.currencySymbol;
  const today = todayStr();
  const todays = reservations.filter((r) => r.reservationDate === today);

  const niceDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <>
      <PageHeader
        icon="📊"
        title="Dashboard"
        subtitle={niceDate}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Updating live
          </span>
        }
      />

      <ManagerStats tables={tables} reservations={reservations} />

      <RoiDashboard reservations={reservations} guests={guests} currencySymbol={symbol} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <SectionTitle title="Floor map" subtitle="Tap any table to change its status." />
          <TableMap
            tables={tables}
            reservations={reservations}
            mode="manager"
            onSelect={(t) => setSelected(t)}
          />
        </Card>

        <Card>
          <SectionTitle title="Add a walk-in" subtitle="Seat a guest who just arrived." />
          <WalkInForm tables={tables} reservations={reservations} />
        </Card>
      </div>

      <Card>
        <SectionTitle
          title="Today’s reservations"
          subtitle={`${todays.length} booking${todays.length === 1 ? '' : 's'} for today`}
        />
        <div className="mb-3">
          <Hint>New bookings from the web, widget and WhatsApp appear here automatically.</Hint>
        </div>
        <ReservationList
          reservations={todays}
          tables={tables}
          currencySymbol={symbol}
          emptyHint="No bookings for today yet — they’ll show up here instantly."
        />
      </Card>

      <TableStatusControls table={selected} reservations={reservations} onClose={() => setSelected(null)} />
    </>
  );
}