# Deploying TableKit

This app is a Next.js 14 application. It is **deploy-ready** as a demo/MVP:
the booking, deposit, CRM, analytics and WhatsApp-agent flows all work. Data is
stored in the browser (`localStorage`) via a clean service layer, so each
browser has its own copy — perfect for demos, but see **"Before real production"**
below for going multi-user.

---

## Option A — Vercel (recommended)

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo. Vercel
   auto-detects Next.js — no build settings needed.
3. Add **Environment Variables** (Project → Settings → Environment Variables):

   | Name | Example | Notes |
   |---|---|---|
   | `MANAGER_PASSWORD` | `a-strong-secret` | Password for `/manager`. **Required for launch.** |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your final URL (set after first deploy, then redeploy). No trailing slash. |

4. Deploy. You'll get an HTTPS URL.
5. Open `https://<your-app>/login`, sign in with `MANAGER_PASSWORD`, and you're in.

> Tip: set `NEXT_PUBLIC_APP_URL` to the real domain and redeploy so the sitemap,
> SEO tags and the widget embed snippet use the correct address.

---

## Option B — Docker / self-host

A `Dockerfile` is included (Next.js standalone output).

```bash
docker build -t tablekit .
docker run -p 3000:3000 \
  -e MANAGER_PASSWORD="a-strong-secret" \
  -e NEXT_PUBLIC_APP_URL="https://yourdomain.com" \
  tablekit
```

Put it behind a reverse proxy (Nginx/Caddy) with HTTPS. Health check:
`GET /api/health` returns `{ "status": "ok" }`.

---

## Environment variables

See [.env.example](.env.example). For local dev, copy it to `.env.local`.

- `MANAGER_PASSWORD` — gate for the manager console. Defaults to `admin` if unset
  (fine for local dev, **never** for production).
- `NEXT_PUBLIC_APP_URL` — public base URL for metadata / sitemap / embed snippet.

---

## What's already production-hardened

- Security headers (nosniff, referrer-policy, permissions-policy; `X-Frame-Options`
  on the manager console; the widget stays embeddable).
- Manager console protected by a password (Edge middleware + session cookie).
- Clean error / 404 / loading pages, `robots`, `sitemap`, web manifest, favicon.
- `/api/health` liveness endpoint.
- Lint passes; production build is standalone and source-maps are off.

## Before "real" production (multi-restaurant, multi-device)

These need decisions/credentials and are intentionally not wired yet:

1. **Shared database** — replace the `localStorage` bodies in
   [`src/lib/store.ts`](src/lib/store.ts) with calls to the `/api/*` routes backed
   by Postgres/Supabase, so every device sees the same live data. The function
   signatures already match the REST contract.
2. **Real auth** — swap the single-password gate for per-user accounts
   (NextAuth / Clerk). The protected boundary (`src/middleware.ts`) stays the same.
3. **Real payments** — replace the mock deposit step with Raast / JazzCash /
   Easypaisa / card. Only the pay action changes.
4. **Real WhatsApp** — replace `MockWhatsAppProvider` in
   [`src/lib/whatsapp/provider.ts`](src/lib/whatsapp/provider.ts) with the Meta
   Cloud API / a BSP; point the webhook at `/api/whatsapp/webhook`.
5. **Real-time at scale** — swap cross-tab `storage` events for WebSockets/SSE.