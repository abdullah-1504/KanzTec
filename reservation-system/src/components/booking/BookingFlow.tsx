'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BookingSource, PreOrderItem, RestaurantTable } from '@/lib/types';
import { useRestaurant } from '@/lib/hooks';
import { createReservation } from '@/lib/store';
import { checkTableAvailable } from '@/lib/helpers/availability';
import { evaluateDeposit } from '@/lib/helpers/deposits';
import { findGuestByPhone, normalizePhone, recognitionMessage } from '@/lib/helpers/guests';
import { preOrderTotal, formatMoney } from '@/lib/helpers/pricing';
import { todayStr, toTimeStr, nextSlot } from '@/lib/helpers/datetime';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Hint,
  SectionTitle,
  Spinner,
  Stepper,
} from '@/components/ui';
import { GuestSelector } from '@/components/booking/GuestSelector';
import { TimeSelector } from '@/components/booking/TimeSelector';
import { TableMap } from '@/components/booking/TableMap';
import { ReservationForm, type ReservationFormValues } from '@/components/booking/ReservationForm';
import { PreOrderMenu } from '@/components/booking/PreOrderMenu';
import { DepositPanel } from '@/components/booking/DepositPanel';
import { BookingSummary } from '@/components/booking/BookingSummary';

// =============================================================================
// The end-to-end booking experience, shared by the public reservation page and
// the embeddable widget. All booking rules come from the shared helpers, so this
// component only handles orchestration + presentation.
// =============================================================================
export function BookingFlow({
  source = 'web',
  compact = false,
  onBooked,
  inlineSuccess = false,
  accentColor,
}: {
  source?: BookingSource;
  compact?: boolean;
  onBooked?: (reservationId: string) => void;
  inlineSuccess?: boolean;
  accentColor?: string;
}) {
  const { db, loading } = useRestaurant();

  const [guests, setGuests] = useState(2);
  const [mode, setMode] = useState<'now' | 'future'>('future');
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(toTimeStr(nextSlot()));
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [values, setValues] = useState<ReservationFormValues>({ name: '', phone: '', notes: '' });
  const [preOrderOpen, setPreOrderOpen] = useState(false);
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormValues | 'table', string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookedId, setBookedId] = useState<string | null>(null);

  // Memoised so they keep a stable identity between renders (used in hook deps).
  const tables = useMemo(() => db?.tables ?? [], [db]);
  const reservations = useMemo(() => db?.reservations ?? [], [db]);
  const menu = db?.menu ?? [];
  const settings = db?.settings;
  const guestsList = useMemo(() => db?.guests ?? [], [db]);
  const symbol = settings?.branding.currencySymbol ?? 'Rs';

  // Drop a selected table if it stops being valid for the current party/time.
  useEffect(() => {
    if (!selectedTableId || !settings) return;
    const table = tables.find((t) => t.id === selectedTableId);
    if (!table) return setSelectedTableId(null);
    const ok = checkTableAvailable(
      table,
      reservations,
      date,
      time,
      guests,
      settings.reservationDurationMinutes,
    ).ok;
    if (!ok) setSelectedTableId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests, date, time, selectedTableId, db]);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const recognition = useMemo(() => {
    const digits = normalizePhone(values.phone);
    if (digits.replace(/\D/g, '').length < 7) return null;
    const guest = findGuestByPhone(guestsList, values.phone);
    return guest ? recognitionMessage(guest) : null;
  }, [values.phone, guestsList]);

  const decision = useMemo(() => {
    if (!settings) return null;
    return evaluateDeposit(settings.deposit, { guests, date, time, preOrderItems });
  }, [settings, guests, date, time, preOrderItems]);

  if (loading || !settings || !decision) {
    return <Spinner label="Loading live availability…" />;
  }

  if (bookedId && inlineSuccess) {
    return (
      <InlineSuccess
        table={selectedTable}
        guests={guests}
        date={date}
        time={time}
        preOrderItems={preOrderItems}
        depositAmount={decision.required ? decision.amount : 0}
        currencySymbol={symbol}
        onReset={() => window.location.reload()}
      />
    );
  }

  const updateField = (field: keyof ReservationFormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const detailsValid =
    values.name.trim().length > 0 && normalizePhone(values.phone).replace(/\D/g, '').length >= 7;

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = 'Please enter your name.';
    if (normalizePhone(values.phone).replace(/\D/g, '').length < 7)
      next.phone = 'Enter a valid phone number.';
    if (!selectedTableId) next.table = 'Please pick a table from the map first.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const confirm = () => {
    setSubmitError(null);
    if (!validate()) {
      // Scroll the first problem into view for clarity.
      if (typeof document !== 'undefined') {
        document.getElementById('booking-details')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSubmitting(true);

    const depositPaid = decision.required; // Mock payment: confirming pays the deposit.
    const result = createReservation({
      customerName: values.name.trim(),
      phone: values.phone.trim(),
      guests,
      tableId: selectedTableId!,
      reservationDate: date,
      reservationTime: time,
      source,
      notes: values.notes.trim() || undefined,
      preOrderItems: preOrderItems.length ? preOrderItems : undefined,
      depositPaid,
    });
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      setSelectedTableId(null);
      return;
    }
    setBookedId(result.reservation.id);
    onBooked?.(result.reservation.id);
  };

  const confirmLabel = decision.required
    ? `Pay ${formatMoney(decision.amount, symbol)} & Confirm`
    : 'Confirm Booking';

  const steps = [
    { label: 'Guests', done: guests > 0 },
    { label: 'Time', done: Boolean(date && time) },
    { label: 'Table', done: Boolean(selectedTableId) },
    { label: 'Details', done: detailsValid },
    { label: 'Confirm', done: Boolean(bookedId) },
  ];
  const currentStep = steps.findIndex((s) => !s.done);

  // ---- layout pieces --------------------------------------------------------
  const leftColumn = (
    <div className="space-y-5">
      <Card>
        <SectionTitle step={1} done={guests > 0} title="How many guests?" subtitle="We’ll only show tables that fit your party." />
        <GuestSelector value={guests} onChange={setGuests} />
      </Card>

      <Card>
        <SectionTitle step={2} done={Boolean(date && time)} title="When would you like to come?" subtitle="Reserve for right now or pick a future time." />
        <TimeSelector
          mode={mode}
          date={date}
          time={time}
          onModeChange={setMode}
          onDateChange={setDate}
          onTimeChange={setTime}
        />
      </Card>

      <Card>
        <SectionTitle step={3} done={Boolean(selectedTableId)} title="Pick your table" subtitle="Tap an open (grey) table. Greyed-out ones are taken or too small." />
        <TableMap
          tables={tables}
          reservations={reservations}
          mode="booking"
          guests={guests}
          date={date}
          time={time}
          selectedTableId={selectedTableId}
          onSelect={(t) => {
            setSelectedTableId(t.id);
            setErrors((e) => ({ ...e, table: undefined }));
          }}
        />
        {errors.table && <p className="mt-2 text-sm font-medium text-rose-600">⚠ {errors.table}</p>}
      </Card>

      <Card>
        <div id="booking-details" />
        <SectionTitle step={4} done={detailsValid} title="Your details" subtitle="So we know who’s coming." />
        <ReservationForm
          values={values}
          errors={errors}
          recognition={recognition}
          onChange={updateField}
        />
      </Card>

      <Card>
        <SectionTitle
          step={5}
          done={preOrderItems.length > 0}
          title="Pre-order food (optional)"
          subtitle="Skip the wait — order ahead, or just book the table."
          action={
            <Button
              variant={preOrderOpen ? 'secondary' : 'ghost'}
              onClick={() => setPreOrderOpen((o) => !o)}
            >
              {preOrderOpen ? 'Hide menu' : '＋ Add food'}
            </Button>
          }
        />
        {preOrderOpen ? (
          <>
            <PreOrderMenu
              menu={menu}
              items={preOrderItems}
              onChange={setPreOrderItems}
              currencySymbol={symbol}
            />
            {preOrderItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setPreOrderItems([]);
                  setPreOrderOpen(false);
                }}
                className="mt-3 text-sm font-medium text-stone-500 underline"
              >
                Remove pre-order and just book the table
              </button>
            )}
          </>
        ) : (
          <Hint>Totally optional. You can also order at the table when you arrive.</Hint>
        )}
      </Card>
    </div>
  );

  const summaryCard = (
    <Card className="space-y-4">
      <SectionTitle title="Your booking" />
      <BookingSummary
        table={selectedTable}
        guests={guests}
        date={date}
        time={time}
        preOrderItems={preOrderItems}
        depositAmount={decision.required ? decision.amount : 0}
        currencySymbol={symbol}
      />

      {decision.required && (
        <DepositPanel
          decision={decision}
          preOrderSubtotal={preOrderTotal(preOrderItems)}
          paid={false}
          currencySymbol={symbol}
        />
      )}

      {submitError && <Alert tone="error">{submitError}</Alert>}

      <Button
        size="lg"
        className="w-full"
        onClick={confirm}
        disabled={submitting}
        style={accentColor ? { backgroundColor: accentColor } : undefined}
      >
        {submitting ? 'Confirming…' : confirmLabel}
      </Button>

      {decision.required ? (
        <p className="text-center text-xs text-stone-400">
          🔒 Mock payment — no real charge. A deposit secures your table.
        </p>
      ) : (
        <p className="text-center text-xs text-stone-400">No deposit needed for this booking. 🎉</p>
      )}
      {!selectedTable && (
        <EmptyState title="No table selected yet" hint="Choose a table from the map to continue." icon="👆" />
      )}
    </Card>
  );

  if (compact) {
    return (
      <div className="space-y-5">
        <Stepper steps={steps} current={currentStep === -1 ? steps.length : currentStep} />
        {leftColumn}
        {summaryCard}
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-0">
      <div className="mb-5 rounded-3xl border border-stone-200/80 bg-white/70 p-4 shadow-soft backdrop-blur">
        <Stepper steps={steps} current={currentStep === -1 ? steps.length : currentStep} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {leftColumn}
        <div className="lg:sticky lg:top-6 lg:self-start">{summaryCard}</div>
      </div>

      {/* Mobile sticky confirm bar — always within thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-3 shadow-lift backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-stone-500">
              {selectedTable ? `Table ${selectedTable.tableNumber} · ${guests} guests` : 'Select a table'}
            </p>
            {decision.required && (
              <p className="text-sm font-bold text-stone-900">{formatMoney(decision.amount, symbol)} deposit</p>
            )}
          </div>
          <Button onClick={confirm} disabled={submitting} style={accentColor ? { backgroundColor: accentColor } : undefined}>
            {submitting ? '…' : decision.required ? 'Pay & Confirm' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InlineSuccess({
  table,
  guests,
  date,
  time,
  preOrderItems,
  depositAmount,
  currencySymbol,
  onReset,
}: {
  table: RestaurantTable | null;
  guests: number;
  date: string;
  time: string;
  preOrderItems: PreOrderItem[];
  depositAmount: number;
  currencySymbol: string;
  onReset: () => void;
}) {
  return (
    <Card className="space-y-4 text-center animate-slide-up">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl animate-pop">
        ✅
      </div>
      <div>
        <h3 className="text-xl font-bold text-stone-900">Booking confirmed!</h3>
        <p className="text-sm text-stone-500">We’ve saved your table. See you soon. 🎉</p>
      </div>
      <div className="rounded-2xl border border-stone-200 p-4 text-left">
        <BookingSummary
          table={table}
          guests={guests}
          date={date}
          time={time}
          preOrderItems={preOrderItems}
          depositAmount={depositAmount}
          depositPaid
          currencySymbol={currencySymbol}
        />
      </div>
      <Button variant="secondary" size="lg" className="w-full" onClick={onReset}>
        Make another booking
      </Button>
    </Card>
  );
}