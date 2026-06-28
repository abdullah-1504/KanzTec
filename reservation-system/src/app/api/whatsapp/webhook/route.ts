import { NextResponse } from 'next/server';
import {
  agentReply,
  initialAgentState,
  type AgentState,
} from '@/lib/whatsapp/conversation';
import { buildSeedReservations, SAMPLE_GUESTS, SAMPLE_TABLES } from '@/lib/mockData';
import { DEFAULT_SETTINGS } from '@/lib/config';
import type { BookingInput, BookingResult } from '@/lib/types';

// POST /api/whatsapp/webhook — inbound WhatsApp message handler.
//
// This is where a real WhatsApp Business API / BSP would deliver inbound
// messages. It drives the SAME conversation handler the in-app simulator uses.
// For the MVP it keeps ephemeral per-phone state in memory and uses seed data;
// production would load live data + persist bookings + send replies through the
// provider adapter (src/lib/whatsapp/provider.ts).
const sessions = new Map<string, AgentState>();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const from: string | undefined = body?.from;
  const text: string | undefined = body?.text;

  if (!from || typeof text !== 'string') {
    return NextResponse.json({ error: 'Expected { from, text }.' }, { status: 400 });
  }

  const state = sessions.get(from) ?? initialAgentState(from);

  // In production: book = the shared server booking core. Here we mock success.
  const book = (input: BookingInput): BookingResult => ({
    ok: true,
    reservation: {
      id: `wa_${Date.now()}`,
      guestId: 'g_mock',
      customerName: input.customerName,
      phone: input.phone,
      guests: input.guests,
      tableId: input.tableId,
      reservationDate: input.reservationDate,
      reservationTime: input.reservationTime,
      status: 'confirmed',
      source: 'whatsapp',
      hasPreOrder: false,
      preOrderItems: [],
      depositRequired: Boolean(input.depositPaid),
      depositAmount: 0,
      depositStatus: input.depositPaid ? 'paid' : 'none',
      totalSpend: 0,
      createdAt: new Date().toISOString(),
    },
    guest: SAMPLE_GUESTS[0],
  });

  const { state: nextState, replies } = agentReply(state, text, {
    tables: SAMPLE_TABLES,
    reservations: buildSeedReservations(),
    guests: SAMPLE_GUESTS,
    settings: DEFAULT_SETTINGS,
    book,
  });

  sessions.set(from, nextState);

  // Production: replies.forEach(r => provider.sendMessage(from, r))
  return NextResponse.json({ replies });
}

// Meta webhook verification handshake (GET) — documented for production.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  return new NextResponse(challenge ?? 'ok');
}