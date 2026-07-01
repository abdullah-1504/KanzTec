import type {
  BookingInput,
  BookingResult,
  Guest,
  Reservation,
  RestaurantSettings,
  RestaurantTable,
} from '@/lib/types';
import {
  availableTablesFor,
  suggestSlots,
} from '@/lib/helpers/availability';
import { evaluateDeposit } from '@/lib/helpers/deposits';
import { findGuestByPhone, recognitionMessage } from '@/lib/helpers/guests';
import {
  daySlots,
  formatTimeLabel,
  formatDateTimeLabel,
  todayStr,
  toTimeStr,
} from '@/lib/helpers/datetime';
import {
  isAffirmative,
  isNegative,
  parseDate,
  parsePartySize,
  parseTime,
  parseEta,
  isAsap,
} from '@/lib/whatsapp/nlp';
import {
  confirmationMessage,
  depositLinkMessage,
} from '@/lib/whatsapp/messages';

// =============================================================================
// The WhatsApp booking agent — a slot-filling conversation state machine.
// It is PURE: it receives the live restaurant data + a `book` function via
// context and returns the next state plus the agent's replies. This guarantees
// it shares the exact same availability / deposit / CRM logic as the web flow,
// and makes it trivial to unit-test or drive from a real webhook.
// =============================================================================

export interface AgentState {
  phone: string;
  greeted: boolean;
  step: 'collecting' | 'await_deposit' | 'await_confirm' | 'done';
  expect: 'guests' | 'datetime' | 'eta' | 'name' | null;
  guests: number | null;
  date: string | null;
  time: string | null;
  tableId: string | null;
  tableNumber: number | null;
  name: string | null;
  depositAmount: number;
  depositPaid: boolean;
  reservationId: string | null;
}

export interface AgentContext {
  tables: RestaurantTable[];
  reservations: Reservation[];
  guests: Guest[];
  settings: RestaurantSettings;
  book: (input: BookingInput) => BookingResult;
}

export function initialAgentState(phone: string): AgentState {
  return {
    phone,
    greeted: false,
    step: 'collecting',
    expect: null,
    guests: null,
    date: null,
    time: null,
    tableId: null,
    tableNumber: null,
    name: null,
    depositAmount: 0,
    depositPaid: false,
    reservationId: null,
  };
}

const CANDIDATE_TIMES = daySlots(12, 23, 30);

function stripTimeTokens(text: string): string {
  return text
    .replace(/\b\d{1,2}\s*(am|pm)\b/gi, ' ')
    .replace(/\b\d{1,2}[:.]\d{2}\b/g, ' ')
    .replace(/\bat\s*\d{1,2}\b/gi, ' ');
}

function smallestFit(tables: RestaurantTable[], guests: number): RestaurantTable {
  return [...tables].sort((a, b) => a.capacity - b.capacity)[0];
}

function summaryLine(state: AgentState, name: string): string {
  return (
    `Here's your booking:\n` +
    `• ${name}\n` +
    `• ${state.guests} guests\n` +
    `• Table ${state.tableNumber}\n` +
    `• ${formatDateTimeLabel(state.date!, state.time!)}`
  );
}

/**
 * Advance the conversation by one inbound message. Returns the updated state and
 * the agent's reply lines (each line is sent as a separate WhatsApp message).
 */
export function agentReply(
  prevState: AgentState,
  text: string,
  ctx: AgentContext,
): { state: AgentState; replies: string[] } {
  const state: AgentState = { ...prevState };
  const replies: string[] = [];
  const t = text.trim();
  const branding = ctx.settings.branding;

  // A finished booking is done. Any further message starts a BRAND-NEW booking
  // (keeping who we're chatting with) instead of re-confirming stale slots — so
  // the same thread can book again without getting stuck on the old reservation.
  if (prevState.step === 'done') {
    const fresh = initialAgentState(state.phone);
    fresh.greeted = true; // already mid-chat — no need to re-welcome
    fresh.name = state.name; // remember the guest's name across bookings
    return agentReply(fresh, text, ctx);
  }

  // First contact: greet + recognise returning guests by phone.
  if (!state.greeted) {
    state.greeted = true;
    const known = findGuestByPhone(ctx.guests, state.phone);
    if (known) {
      state.name = known.name;
      const rec = recognitionMessage(known);
      replies.push(
        `👋 ${rec ?? `Welcome back, ${known.name}!`}\nI'm the ${branding.restaurantName} booking assistant. Let's get you a table.`,
      );
    } else {
      // Plain welcome — the slot-filling below asks only for what's still
      // missing, so we don't double-ask for details already in the first message.
      replies.push(
        `👋 Welcome to ${branding.restaurantName}! I’m your booking assistant — let’s get you a table.`,
      );
    }
  }

  // Global cancel.
  if (/^cancel$/i.test(t) && state.step !== 'done') {
    return { state: initialAgentState(state.phone), replies: ['No problem — booking cancelled. Message me anytime to start again. 👋'] };
  }

  // --- Mid-flow steps that expect a specific reply ---------------------------
  if (state.step === 'await_deposit') {
    if (/\b(pay|paid)\b/i.test(t)) {
      state.depositPaid = true;
      return finalize(state, ctx, replies);
    }
    if (isNegative(t)) {
      replies.push('No worries. Reply PAY to secure the table, or CANCEL to stop.');
      return { state, replies };
    }
    replies.push('Please complete the deposit to confirm — reply PAY to simulate payment, or CANCEL.');
    return { state, replies };
  }

  if (state.step === 'await_confirm') {
    if (isAffirmative(t)) return finalize(state, ctx, replies);

    // Let the guest tweak the booking in one line ("actually make it 9pm",
    // "can we do 6 people instead") rather than forcing a strict yes/no.
    const newDate = parseDate(t);
    const newTime = parseTime(t);
    const newParty = parsePartySize(stripTimeTokens(t));
    if (newDate || newTime || newParty) {
      if (newParty) state.guests = newParty;
      if (newDate) state.date = newDate;
      if (newTime) state.time = newTime;
      // Re-resolve a table for the updated details and re-summarise below.
      state.step = 'collecting';
      state.tableId = null;
      state.tableNumber = null;
      state.expect = null;
    } else if (isNegative(t)) {
      state.step = 'collecting';
      state.time = null;
      state.expect = 'datetime';
      replies.push('Sure — what day and time would you prefer instead?');
      return { state, replies };
    } else {
      replies.push('Reply YES to confirm the booking, or NO to change the time.');
      return { state, replies };
    }
  }

  // If we asked for an arrival time (after an "ASAP"), interpret this reply as
  // the ETA and book from now + that many minutes.
  if (state.expect === 'eta' && state.time == null) {
    const mins = parseEta(t);
    if (mins !== null) {
      state.date = todayStr();
      state.time = toTimeStr(new Date(Date.now() + mins * 60_000));
      state.expect = null;
    }
  }

  // --- Slot filling (opportunistic: fills everything it can find) -------------
  if (state.guests == null) {
    const g = parsePartySize(stripTimeTokens(t));
    if (g) state.guests = g;
  }
  if (state.date == null) {
    const d = parseDate(t);
    if (d) state.date = d;
  }
  if (state.time == null) {
    const tm = parseTime(t);
    if (tm) state.time = tm;
  }
  if (state.expect === 'name' && state.name == null) {
    const nm = t.replace(/[^\p{L}\s.'-]/gu, '').trim();
    if (nm.length >= 2) state.name = nm;
  }

  // --- Ask for the next missing piece ----------------------------------------
  if (state.guests == null) {
    state.expect = 'guests';
    replies.push('How many guests will be dining? 😊');
    return { state, replies };
  }

  // "ASAP" / "on my way" without a concrete time → ask for an ETA, then book
  // for now + that duration.
  if (state.time == null && isAsap(t)) {
    state.expect = 'eta';
    replies.push(
      `No problem — how soon will you arrive? You can say "right now", "15 minutes", or "half an hour". 🚗`,
    );
    return { state, replies };
  }

  // We asked for an ETA but couldn't understand the reply — ask again clearly.
  if (state.expect === 'eta' && state.time == null) {
    replies.push(
      `Sorry, I didn’t catch that — roughly how long until you’re here? e.g. "right now", "20 minutes" or "1 hour".`,
    );
    return { state, replies };
  }

  if (state.date == null || state.time == null) {
    state.expect = 'datetime';
    const slots = suggestSlots(ctx.tables, ctx.reservations, state.guests, undefined, CANDIDATE_TIMES);
    const hint = slots.length
      ? ` Open today: ${slots.map(formatTimeLabel).join(', ')}.`
      : '';
    replies.push(`Great, a table for ${state.guests}. What day and time? e.g. "tonight 8pm" or "tomorrow 7:30pm".${hint}`);
    return { state, replies };
  }

  // Resolve a concrete table using the SAME availability core as the web flow.
  const free = availableTablesFor(ctx.tables, ctx.reservations, state.date, state.time, state.guests);
  if (free.length === 0) {
    const alts = suggestSlots(ctx.tables, ctx.reservations, state.guests, state.date, CANDIDATE_TIMES);
    state.time = null;
    state.expect = 'datetime';
    replies.push(
      `Sorry, nothing free for ${state.guests} at ${formatTimeLabel(prevState.time ?? '')}.` +
        (alts.length ? ` Try: ${alts.map(formatTimeLabel).join(', ')}.` : ' Please try another time.'),
    );
    return { state, replies };
  }
  const table = smallestFit(free, state.guests);
  state.tableId = table.id;
  state.tableNumber = table.tableNumber;

  if (state.name == null) {
    state.expect = 'name';
    replies.push('Perfect — a table is available! What name should I put the booking under?');
    return { state, replies };
  }

  // Deposit decision (shared engine). If required, send the (mock) payment link.
  const decision = evaluateDeposit(ctx.settings.deposit, {
    guests: state.guests,
    date: state.date,
    time: state.time,
  });
  state.depositAmount = decision.amount;

  if (decision.required && !state.depositPaid) {
    state.step = 'await_deposit';
    replies.push(summaryLine(state, state.name));
    replies.push(depositLinkMessage(decision.amount, branding));
    return { state, replies };
  }

  state.step = 'await_confirm';
  replies.push(summaryLine(state, state.name));
  replies.push('Reply YES to confirm. 🙌');
  return { state, replies };
}

/** Commit the booking through the shared store function and confirm. */
function finalize(
  state: AgentState,
  ctx: AgentContext,
  replies: string[],
): { state: AgentState; replies: string[] } {
  const result = ctx.book({
    customerName: state.name ?? 'WhatsApp Guest',
    phone: state.phone,
    guests: state.guests!,
    tableId: state.tableId!,
    reservationDate: state.date!,
    reservationTime: state.time!,
    source: 'whatsapp',
    depositPaid: state.depositPaid,
  });

  if (!result.ok) {
    state.step = 'collecting';
    state.time = null;
    state.tableId = null;
    state.expect = 'datetime';
    replies.push(`Hmm, that table was just taken (${result.error}) — what other time works?`);
    return { state, replies };
  }

  state.step = 'done';
  state.reservationId = result.reservation.id;
  replies.push(confirmationMessage(result.reservation, ctx.settings.branding));
  return { state, replies };
}