# Sydney brothel scrape → Supabase seed

Automates a respectful public crawl of [brothels.com.au Sydney listings](https://brothels.com.au/brothels-in-sydney/) into Hey Bro’s `venues` / `venue_staff` tables.

## Commands

```bash
# 1) Crawl listing + detail pages into data/scraped/sydney-brothels.json
pnpm scrape

# Optional smaller sample
pnpm scrape -- --limit=5

# 2) Dry-run seed (default) — prints normalized upsert payload
pnpm scrape:seed

# 3) Live upsert (requires private credentials + project confirmation)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  pnpm scrape:seed -- --apply --project-ref <20-char-project-ref>
```

Apply `supabase/migrations/20261104_scraped_venues.sql` before the first live seed.

## Notes

- Defaults to JSON output / dry-run. No hosted writes happen unless `--apply` is set.
- Checks `robots.txt` before crawling and waits between detail requests.
- Extracts name, address, suburb, phone, hours (when published), feature/service chips, cover image, and staff-like gallery URLs when present.
- Operator remains responsible for site terms, copyright, and publication decisions. Do not schedule aggressive crawls.
