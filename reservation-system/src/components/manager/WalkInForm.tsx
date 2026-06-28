'use client';

import { useMemo, useState } from 'react';
import type { Reservation, RestaurantTable } from '@/lib/types';
import { addWalkIn } from '@/lib/store';
import { tableFitsGuests } from '@/lib/helpers/availability';
import { Button, Field, Input, Select, Alert } from '@/components/ui';
import { GuestSelector } from '@/components/booking/GuestSelector';

// Seat a walk-in guest immediately. Marks the chosen table occupied via the
// shared booking core.
export function WalkInForm({
  tables,
  reservations,
}: {
  tables: RestaurantTable[];
  reservations: Reservation[];
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState(2);
  const [tableId, setTableId] = useState('');
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  // Only available tables that fit the party can take a walk-in.
  const options = useMemo(
    () => tables.filter((t) => t.status === 'available' && tableFitsGuests(t, guests)),
    [tables, guests],
  );

  const submit = () => {
    setMessage(null);
    const chosen = tableId || options[0]?.id;
    if (!chosen) {
      setMessage({ tone: 'error', text: 'No free table fits this party right now.' });
      return;
    }
    const result = addWalkIn({
      customerName: name.trim() || 'Walk-in',
      phone: phone.trim() || `walkin-${Date.now()}`,
      guests,
      tableId: chosen,
    });
    if (!result.ok) {
      setMessage({ tone: 'error', text: result.error });
      return;
    }
    setMessage({ tone: 'success', text: `Seated at Table ${tables.find((t) => t.id === chosen)?.tableNumber}.` });
    setName('');
    setPhone('');
    setTableId('');
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Guest name (optional)">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Walk-in" />
        </Field>
        <Field label="Phone (optional)" hint="Links to the guest CRM if provided.">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 …" inputMode="tel" />
        </Field>
      </div>

      <Field label="Party size">
        <GuestSelector value={guests} onChange={setGuests} />
      </Field>

      <Field label="Table" hint={options.length ? undefined : 'No fitting table available — free one first.'}>
        <Select value={tableId} onChange={(e) => setTableId(e.target.value)} disabled={!options.length}>
          <option value="">{options.length ? 'Auto-pick best fit' : 'No table available'}</option>
          {options.map((t) => (
            <option key={t.id} value={t.id}>
              Table {t.tableNumber} · {t.capacity} seats
            </option>
          ))}
        </Select>
      </Field>

      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      <Button className="w-full" onClick={submit} disabled={!options.length}>
        Seat walk-in
      </Button>
    </div>
  );
}