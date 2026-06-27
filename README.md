# KanzTech — Landing Page

The official landing page for **KanzTech** — a software engineering studio specializing in
custom software, web & mobile development, and applied AI (agents, automation, workflows).

## Stack

Static site — no build step. Plain HTML, CSS and vanilla JS.

| File | Purpose |
|------|---------|
| `index.html` | Page markup & content |
| `styles.css` | Dark, minimal theme (Montserrat) |
| `script.js` | Sticky nav, mobile menu, scroll reveals |
| `logo.svg` | Vector logo mark |
| `vercel.json` | Hosting config (clean URLs, caching, security headers) |

## Products featured

- **ReserveFlow** — Restaurant Reservation System
- **EstateFlow** — WhatsApp Real Estate Agent
- **DriveFlow** — WhatsApp Car Dealership Agent

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploy

Hosted on **Vercel**. Production deploys happen automatically on push to the default branch.

```bash
vercel --prod   # manual deploy from the CLI
```
