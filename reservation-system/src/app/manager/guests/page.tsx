'use client';

import { useRestaurant } from '@/lib/hooks';
import { Card, PageHeader, SectionTitle, Spinner } from '@/components/ui';
import { GuestList } from '@/components/manager/GuestList';

export default function GuestsPage() {
  const { db, loading } = useRestaurant();
  if (loading || !db) return <Spinner label="Loading guests…" />;

  return (
    <>
      <PageHeader
        icon="👥"
        title="Your Guests"
        subtitle="Recognised across every booking channel by phone number — your data, not an aggregator’s."
      />
      <Card>
        <SectionTitle title="All guests" subtitle={`${db.guests.length} profiles`} />
        <GuestList guests={db.guests} currencySymbol={db.settings.branding.currencySymbol} />
      </Card>
    </>
  );
}