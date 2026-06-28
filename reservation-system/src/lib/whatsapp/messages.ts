import type { Reservation, Branding } from '@/lib/types';
import { formatDateTimeLabel } from '@/lib/helpers/datetime';
import { formatMoney } from '@/lib/helpers/pricing';

// =============================================================================
// Outbound message templates the agent sends. Kept separate so copy can be
// tuned (or localised) without touching conversation logic, and so the same
// templates can be reused for scheduled reminders / waitlist pings.
// =============================================================================

export function confirmationMessage(r: Reservation, b: Branding): string {
  const when = formatDateTimeLabel(r.reservationDate, r.reservationTime);
  const deposit =
    r.depositStatus === 'paid'
      ? `\nDeposit received: ${formatMoney(r.depositAmount, b.currencySymbol)} ✅`
      : '';
  return (
    `✅ Booking confirmed at ${b.restaurantName}!\n\n` +
    `Name: ${r.customerName}\n` +
    `Guests: ${r.guests}\n` +
    `When: ${when}\n` +
    `Confirmation: #${r.id.slice(-6).toUpperCase()}${deposit}\n\n` +
    `See you soon! Reply CANCEL to cancel.`
  );
}

export function depositLinkMessage(amount: number, b: Branding): string {
  // In production this becomes a real Raast / JazzCash / card payment link.
  return (
    `To secure your table a deposit of ${formatMoney(amount, b.currencySymbol)} is required.\n` +
    `Pay securely here: https://pay.tablekit.app/mock/checkout\n\n` +
    `Reply PAID once done (mock), or PAY to simulate payment.`
  );
}

export function reminderMessage(r: Reservation, b: Branding): string {
  const when = formatDateTimeLabel(r.reservationDate, r.reservationTime);
  return (
    `⏰ Reminder: your table for ${r.guests} at ${b.restaurantName} is booked for ${when}.\n` +
    `Reply CANCEL if your plans changed — it helps us free the table for others.`
  );
}

export function tableReadyMessage(name: string, b: Branding): string {
  return `🎉 Good news ${name}! Your table at ${b.restaurantName} is ready. Please come to the host stand.`;
}