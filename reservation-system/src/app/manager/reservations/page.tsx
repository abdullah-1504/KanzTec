'use client';

import { useRestaurant } from '@/lib/hooks';
import { Card, PageHeader, SectionTitle, Spinner } from '@/components/ui';
import { ReservationList } from '@/components/manager/ReservationList';

export default function ReservationsManagerPage() {
  const { db, loading } = useRestaurant();
  if (loading || !db) return <Spinner label="Loading reservations…" />;

  return (
    <>
      <PageHeader
        icon="📅"
        title="Reservations"
        subtitle="Every booking across web, widget, WhatsApp and walk-ins."
      />
      <Card>
        <SectionTitle title="All reservations" subtitle={`${db.reservations.length} total`} />
        <ReservationList
          reservations={db.reservations}
          tables={db.tables}
          currencySymbol={db.settings.branding.currencySymbol}
          showFilters
        />
      </Card>
    </>
  );
}