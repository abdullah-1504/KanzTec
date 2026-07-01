'use client';

import { useEffect, useRef, useState } from 'react';
import {
  agentReply,
  initialAgentState,
  type AgentState,
} from '@/lib/whatsapp/conversation';
import {
  createReservation,
  getGuests,
  getReservations,
  getSettings,
  getTables,
} from '@/lib/store';
import { clsx } from '@/lib/helpers/clsx';

interface ChatMessage {
  from: 'guest' | 'agent';
  text: string;
}

const QUICK = ['Table for 4 tomorrow 8pm', '2 people tonight', '6 people Saturday 9pm'];

const SAMPLE_NUMBERS = [
  { label: 'New number', phone: '+923009998877' },
  { label: 'Ayesha Khan (VIP, returning)', phone: '+923001234567' },
  { label: 'Sara Malik (repeat no-show)', phone: '+923331112233' },
];

// In-app harness that drives the SAME conversation handler a real WhatsApp
// webhook would call — so the full booking flow can be demoed without a live
// WhatsApp number. Bookings it creates appear on the dashboard instantly.
export function WhatsAppSimulator() {
  const [phone, setPhone] = useState(SAMPLE_NUMBERS[0].phone);
  const [state, setState] = useState<AgentState>(() => initialAgentState(SAMPLE_NUMBERS[0].phone));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const reset = (newPhone: string) => {
    setPhone(newPhone);
    setState(initialAgentState(newPhone));
    setMessages([]);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Build context from a fresh store snapshot so the agent uses live data.
    const ctx = {
      tables: getTables(),
      reservations: getReservations(),
      guests: getGuests(),
      settings: getSettings(),
      book: createReservation,
    };

    const { state: nextState, replies } = agentReply(state, trimmed, ctx);
    setState(nextState);
    setMessages((m) => [
      ...m,
      { from: 'guest', text: trimmed },
      ...replies.map((r) => ({ from: 'agent' as const, text: r })),
    ]);
    setInput('');
  };

  return (
    <div className="mx-auto flex h-[640px] max-h-[80dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lift">
      {/* Header */}
      <div className="flex items-center gap-3 bg-emerald-600 px-4 py-3 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">💬</span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Booking Assistant</p>
          <p className="text-xs text-emerald-100">WhatsApp Business · online</p>
        </div>
      </div>

      {/* Number selector */}
      <div className="border-b border-stone-100 bg-stone-50 px-3 py-2">
        <select
          value={phone}
          onChange={(e) => reset(e.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-600"
        >
          {SAMPLE_NUMBERS.map((n) => (
            <option key={n.phone} value={n.phone}>
              Chatting as: {n.label}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="scroll-thin flex-1 space-y-2 overflow-y-auto bg-[#e9f2ee] px-3 py-3">
        {messages.length === 0 && (
          <p className="mx-auto mt-6 max-w-[80%] rounded-xl bg-white/70 px-3 py-2 text-center text-xs text-stone-500">
            Send a message to start a booking. Try “Table for 4 tomorrow 8pm”.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={clsx('flex', m.from === 'guest' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={clsx(
                'max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm shadow-sm',
                m.from === 'guest'
                  ? 'rounded-br-sm bg-emerald-500 text-white'
                  : 'rounded-bl-sm bg-white text-stone-700',
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      <div className="flex flex-wrap gap-1.5 border-t border-stone-100 px-3 py-2">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-200"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-stone-100 px-3 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          inputMode="text"
          enterKeyHint="send"
          autoComplete="off"
          // 16px text keeps iOS Safari from zooming the whole page on focus.
          className="min-w-0 flex-1 rounded-full border border-stone-200 px-4 py-2 text-[16px] focus:border-emerald-400 focus:outline-none"
        />
        <button
          type="submit"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
          aria-label="Send"
        >
          ➤
        </button>
      </form>
    </div>
  );
}