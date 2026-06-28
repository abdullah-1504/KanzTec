'use client';

import { Field, Input, Textarea, Alert } from '@/components/ui';

export interface ReservationFormValues {
  name: string;
  phone: string;
  notes: string;
}

// Customer detail fields with inline validation + returning-guest recognition.
export function ReservationForm({
  values,
  errors,
  recognition,
  onChange,
}: {
  values: ReservationFormValues;
  errors: Partial<Record<keyof ReservationFormValues, string>>;
  recognition?: string | null;
  onChange: (field: keyof ReservationFormValues, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {recognition && <Alert tone="success">{recognition}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name}>
          <Input
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g. Ayesha Khan"
            autoComplete="name"
          />
        </Field>
        <Field label="Phone number" required error={errors.phone} hint="Used to recognise you next time.">
          <Input
            value={values.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+92 300 1234567"
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
      </div>

      <Field label="Notes (optional)" hint="Allergies, seating preference, occasion…">
        <Textarea
          value={values.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Window seat if possible, celebrating a birthday…"
        />
      </Field>
    </div>
  );
}