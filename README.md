# Hey Bro — Aussie Nightlife Directory

Mobile-first nightlife directory preview for Australia. Built with Next.js 15 App Router, TypeScript, Tailwind CSS and shadcn/ui primitives on a zinc/emerald brand.

## Run locally

Node.js 20.9+ and pnpm 11.25.0:

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open [http://127.0.0.1:3000/en](http://127.0.0.1:3000/en). The Cloud Agent environment forwards port **3000** (`0.0.0.0`) for the built-in browser — use that port, not a random alternate.

Production-style server:

```bash
corepack pnpm build
corepack pnpm start
```

## What’s included

- `/en` and `/zh` locale routes with middleware language headers
- 18+ age gate (self-declaration, 30-day local preference)
- City/category filters, search, demo venue cards and detail pages
- Device-local saved places
- Community discussions entry + Reddit source links (honest unavailable feed state)
- Journal stubs, local empty/unavailable preview landings, health API, PWA manifest/SW shell
- Docker standalone image via `Dockerfile`

Listings in this preview are fictional demo data. Interior photos are illustrative. Configure `NEXT_PUBLIC_SITE_URL` before emitting absolute canonical/social URLs.

See `ASSETS.md`, `plan.md` and `TODO.md` for brand assets and the longer product roadmap.
