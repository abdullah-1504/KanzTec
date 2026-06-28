'use client';

import { Card, PageHeader } from '@/components/ui';
import { WhatsAppSimulator } from '@/components/whatsapp/WhatsAppSimulator';

export default function WhatsAppPage() {
  return (
    <>
      <PageHeader
        icon="💬"
        title="WhatsApp Booking Agent"
        subtitle="Guests book by chatting — no app, no website. Try it below."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,28rem)]">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">How it works</h2>
          <ol className="space-y-3 text-sm text-stone-600">
            <li><span className="font-semibold text-stone-800">1. Natural language.</span> The agent understands “table for 4 tomorrow 8pm”, checks live availability and offers a table.</li>
            <li><span className="font-semibold text-stone-800">2. Same booking brain.</span> It uses the exact same availability, deposit and guest rules as the website — nothing is duplicated.</li>
            <li><span className="font-semibold text-stone-800">3. Knows your regulars.</span> Returning guests are greeted by name (try the dropdown in the chat). Repeat no-shows are asked for a deposit.</li>
            <li><span className="font-semibold text-stone-800">4. Takes deposits.</span> Peak / large-party bookings get a (mock) payment link before confirming.</li>
            <li><span className="font-semibold text-stone-800">5. Shows up instantly.</span> Confirmed chats appear on your dashboard right away, tagged <code className="rounded bg-stone-100 px-1">whatsapp</code>.</li>
          </ol>
          <div className="rounded-2xl bg-stone-50 p-4 text-xs text-stone-500">
            <p className="font-semibold text-stone-700">For your developer</p>
            The provider adapter (<code className="rounded bg-white px-1">src/lib/whatsapp/provider.ts</code>) is the only
            piece that talks to WhatsApp. Swap the mock for the Meta Cloud API / a BSP and the agent is live — the
            booking logic stays untouched. Inbound messages would arrive at{' '}
            <code className="rounded bg-white px-1">/api/whatsapp/webhook</code>.
          </div>
        </Card>

        <WhatsAppSimulator />
      </div>
    </>
  );
}