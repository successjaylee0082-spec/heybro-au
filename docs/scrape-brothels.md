# Sydney brothel scrape → Supabase seed

Automates a respectful public crawl of [brothels.com.au Sydney listings](https://brothels.com.au/brothels-in-sydney/) into Hey Bro’s `venues` / `venue_staff` tables.

## Commands

```bash
# 1) Incremental crawl into data/scraped/sydney-brothels.json
#    Skips URLs / source IDs / slugs already present in the JSON file
#    (and in Supabase when credentials are configured).
pnpm scrape

# Optional smaller sample of *pending* venues only
pnpm scrape -- --limit=5

# Force re-fetch every listing card (ignore incremental skip set)
pnpm scrape -- --full

# 2) Dry-run seed (default) — prints normalized upsert payload
pnpm scrape:seed

# 3) Live upsert (requires private credentials + project confirmation)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  pnpm scrape:seed -- --apply --project-ref <20-char-project-ref>
```

Apply `supabase/migrations/20261104_scraped_venues.sql` before the first live seed.

## Notes

- Defaults to JSON output / dry-run. No hosted writes happen unless `--apply` is set.
- Checks `robots.txt` before crawling and sends a Chrome-like User-Agent.
- Waits a **random 2.0s–3.5s** between detail-page requests.
- Retries network failures and HTTP **403 / 429 / 5xx** up to **3** attempts. **404** is not retried.
- Incremental mode merges new venues into the existing JSON file instead of overwriting it.
- Operator remains responsible for site terms, copyright, and publication decisions. Do not schedule aggressive crawls.
