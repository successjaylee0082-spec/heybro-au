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

### Reset a broken / unstyled local cache

If the page renders as plain HTML (or stuck on “Checking access…”), wipe the Next.js build cache and restart:

```bash
# macOS / Linux
rm -rf .next && pnpm dev:reset

# or explicitly:
rm -rf .next && pnpm exec next dev --hostname 0.0.0.0 --port 3000
```

```powershell
# Windows PowerShell
Remove-Item -Recurse -Force .next
pnpm exec next dev --hostname 0.0.0.0 --port 3000
```

Then hard-refresh the browser (Cmd/Ctrl+Shift+R). If a service worker was installed from an older build, open DevTools → Application → Service Workers → Unregister, and Clear site data.

Production-style server:

```bash
rm -rf .next
corepack pnpm build
corepack pnpm start
```

## What’s included

- `/en` and `/zh` locale routes with middleware language headers
- 18+ age gate (self-declaration, 30-day local preference)
- City/category filters, search, and venue detail pages backed by Supabase `venues`
- Device-local saved places (resolved against the live directory when connected)
- Community discussions entry + Reddit source links (honest unavailable feed state)
- Journal stubs, local empty/unavailable preview landings, health API, PWA manifest/SW shell
- Docker standalone image via `Dockerfile`

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or the server-side `SUPABASE_*` equivalents) so the home directory can query the `venues` table. Without those variables the home page shows an unavailable state instead of demo cards. Configure `NEXT_PUBLIC_SITE_URL` before emitting absolute canonical/social URLs.

## Scrape Sydney brothel listings

```bash
pnpm scrape                 # writes data/scraped/sydney-brothels.json
pnpm scrape:seed            # dry-run upsert preview
```

Live DB injection requires the scraped-venues migration plus private Supabase credentials. See [docs/scrape-brothels.md](docs/scrape-brothels.md).

See `ASSETS.md`, `plan.md` and `TODO.md` for brand assets and the longer product roadmap.
