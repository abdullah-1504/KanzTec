'use client';

import type { Reservation, RestaurantTable } from '@/lib/types';
import { walkInCapacity } from '@/lib/helpers/availability';
import { todayStr } from '@/lib/helpers/datetime';
import { StatCard } from '@/components/ui';

// Operational stat cards across the top of the dashboard.
export function ManagerStats({
  tables,
  reservations,
}: {
  tables: RestaurantTable[];
  reservations: Reservation[];
}) {
  const total = tables.length;
  const available = tables.filter((t) => t.status === 'available').length;
  const busy = tables.filter((t) => t.status === 'occupied' || t.status === 'reserved').length;
  const today = todayStr();
  const todays = reservations.filter((r) => r.reservationDate === today && r.status !== 'cancelled');
  const upcoming = reservations.filter(
    (r) => r.status === 'confirmed' && r.reservationDate >= today,
  ).length;
  const capacity = walkInCapacity(tables);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Total tables" value={total} icon="🍽️" accent="stone" />
      <StatCard label="Available now" value={available} icon="🟢" accent="emerald" />
      <StatCard label="Busy / booked" value={busy} icon="🔴" accent="rose" />
      <StatCard label="Upcoming" value={upcoming} icon="⏳" accent="amber" />
      <StatCard label="Today's bookings" value={todays.length} icon="📅" accent="brand" />
      <StatCard label="Walk-in seats" value={capacity} icon="🚶" accent="violet" />
    </div>
  );
}