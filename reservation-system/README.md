# TableKit — Restaurant Reservation & Table Management Platform (MVP)

A B2B SaaS platform sold to restaurants. Diners book a table through three channels —
**web page**, an **embeddable widget**, and a **WhatsApp booking agent** — all running through the
**same shared booking logic**. Restaurants get a real-time manager console with deposits, a Guest CRM,
and an ROI dashboard.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. No external services required —
data is persisted to `localStorage` through a clean service layer that maps 1:1 to a future REST API.

---

## Three pillars (USPs)

1. **WhatsApp Booking Agent** — guests book by chatting ("table for 4 tomorrow 8pm"). A slot-filling
   state machine checks live availability, recognises returning guests, sends a (mock) deposit link and confirms.
2. **Guaranteed covers via deposits** — configurable deposit rules (large party / peak slot / pre-order
   advance) secure high-value bookings and cut no-shows.
3. **Own your guests (Guest CRM)** — every booking auto-creates/updates a guest profile (matched by phone),
   with visit history, pre-orders, reviews, tags (VIP / repeat-no-show) and preferences.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
# or a production build:
npm run build && npm start
```

Open **http://localhost:3000**. Sample data (tables, menu, guests, a month of reservation history) is
seeded automatically on first load. Use **Reset demo data** in the manager sidebar to restore it.

---

## Pages

| Route | What it is |
|---|---|
| `/` | Landing / hub |
| `/reservations` | Customer booking page (channel: web) |
| `/reservations/success` | Confirmation screen |
| `/widget` | Standalone embeddable widget (themeable via `?primary=&name=&logo=`) |
| `/manager/dashboard` | Live floor map, stats, **ROI dashboard**, walk-ins, today's bookings |
| `/manager/reservations` | All reservations across every channel (search + filters) |
| `/manager/guests` + `/manager/guests/[id]` | Guest CRM list & profile (history, reviews, tags) |
| `/manager/whatsapp` | WhatsApp agent **simulator** |
| `/manager/settings` | Branding, deposit rules, and the **embed-snippet generator** |

API route stubs documenting the REST contract live under `/api/*`
(`tables`, `menu-items`, `reservations`, `guests`, `analytics`, `reviews`, `walk-in`,
`tables/:id/status`, `reservations/:id/status`, `whatsapp/webhook`).

---

## How to test the booking flow

**Web:** `/reservations` → set guests → pick a table (only fitting/available tables are selectable) →
choose "Right now" or a future slot → fill details → optionally pre-order → Confirm. Large parties (6+) or
Fri/Sat peak slots trigger a mock deposit. Open `/manager/dashboard` in a **second tab** — it updates in
real time (cross-tab via the `storage` event).

**Widget:** open `/widget` directly, or `/manager/settings` → copy the embed snippet / view the live preview.

**WhatsApp:** `/manager/whatsapp` → type `Table for 4 tomorrow 8pm`, then a name, then `yes`. Switch the
"Chatting as" dropdown to a returning guest (Ayesha = VIP, Sara = repeat-no-show) to see recognition.
The created booking appears on the dashboard tagged `whatsapp`.

**Manager:** mark tables Available/Occupied/Reserved/Cleaning (tap a table on the floor map), add a walk-in,
and Complete / No-show / Cancel reservations. Completing a booking records spend and updates the guest's CRM
stats + ROI metrics.

---

## Architecture — booking logic is shared, never duplicated

```
src/lib/helpers/        ← the single source of truth for all rules
  availability.ts        table fit, time-conflict prevention, map visuals, slot suggestions
  deposits.ts            configurable deposit-rule engine
  guests.ts              phone matching, CRM stat recompute, recognition, auto-tags
  analytics.ts           ROI metrics (computed, never stored)
  pricing.ts datetime.ts statusColors.ts clsx.ts

src/lib/store.ts        ← service layer (localStorage today, swap to fetch() later)
src/lib/hooks.ts        ← React binding, gives live + real-time data
src/lib/whatsapp/       ← conversation.ts (handler) · nlp.ts · provider.ts (adapter) · messages.ts

src/components/
  ui/  booking/  manager/  whatsapp/  widget/
```

The web page, widget and WhatsApp agent all call `createReservation()` / the same helpers, so a booking rule
only ever lives in one place.

---

## What to add next for production

- **Real backend** — implement the `/api/*` routes against a database; replace the `localStorage` bodies in
  `src/lib/store.ts` with `fetch` calls (the signatures already match).
- **Real WhatsApp Business API** — replace `MockWhatsAppProvider` in `src/lib/whatsapp/provider.ts` with the
  Meta Cloud API / a BSP; wire inbound to `/api/whatsapp/webhook`. The handler stays unchanged.
- **Real payments** — replace the mock deposit step with Raast / JazzCash / Easypaisa / card; only the
  pay action changes.
- **Auth & roles** — protect `/manager/*` (currently open by design); add staff accounts.
- **Real-time at scale** — swap cross-tab `storage` events for WebSockets / SSE for multi-device sync.
- **Multi-branch**, scheduled reminders/waitlist pings, and WhatsApp marketing broadcasts (the CRM is
  structured to support these).
```