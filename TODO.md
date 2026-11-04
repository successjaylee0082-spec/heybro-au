Day 15 evidence: `pnpm check`, lint, `pnpm test:track`, affiliate, review, detail, Maps and production build passed. Preview `/api/health` returned 200; valid tracking input returned safe `503 TRACK_DATABASE_UNAVAILABLE` because no private Supabase credential/migration is configured, while invalid input returned 400. The client uses beacon/keepalive without blocking outbound links, and directory website URLs preserve existing parameters while applying the required UTM attribution. See [Day 15 click analytics notes](docs/day15-click-analytics.md).

## Day 16 — Protected admin portal

- [x] Create `app/admin/page.tsx` protected by validated Manus OAuth sessions and a server-only administrator allowlist. Guard every admin API and mutation; never grant admin to the first visitor or a client-supplied role.
- [x] Display Total Venues, Call Clicks, Website Clicks and Google Maps Directions Clicks using exact Supabase counts. Show an explicit unavailable state when Supabase is not configured, rather than fake zeros.
- [x] Provide a paginated venues table with City filtering (Sydney, Melbourne, Brisbane, Perth, Gold Coast, Adelaide), Add / Edit / Delete, complete Australian address fields and validated lat/lng.
- [x] Provide a one-click Bro Verified listing status toggle and an accessible venue form modal. Preserve the distinction between listing verification and trusted review-visit evidence.
- [x] Apply CSRF and no-store/private-response protections, exclude `/admin` from offline caching, and retain the public directory's existing behavior.

Day 16 evidence: TypeScript, lint, production build, admin JWT/OAuth/CSRF/API/repository/cache suites, PWA, current server-fixture feed/detail and tracking/navigation regressions passed. Live Preview returned private/no-store/noindex admin HTML without private data, 401 for unauthenticated admin GET and POST, and safe 503 for the unconfigured OAuth callback setup. No real database writes or deletion were performed.

- [ ] Owner activation: configure server-only ADMIN_OPEN_IDS, ADMIN_APP_ORIGIN and private Supabase URL/key before genuine administrator login, analytics and CRUD can be used. Public pSEO catalogue changes require a rebuild; this status is exposed in mutation responses and success feedback.

## Day 17 — Content and blog engine

- [x] Create `/blog` with “Best Nightlife Spots in Sydney CBD” and “Safe Guide to Melbourne Adult Venues”, supported by official visitor/transport/safety sources rather than invented first-hand reviews.
- [x] Create `app/blog/[slug]/page.tsx` with responsive editorial typography, linked table of contents, route-specific metadata, related reading and real 404 handling.
- [x] Embed existing Hey Bro venue cards with active transit/walking Maps URLs, details and bookmarks after age confirmation. Label fictional cards as demonstrations, separate from editorial real-world recommendations.
- [x] Inject safely serialized `Article` JSON-LD matching visible author, headline, publication/modified dates and article content, using canonical/image URLs only when a genuine site origin is configured.
- [x] Keep non-explicit editorial text in server-rendered HTML, preserve the existing age/access boundary for interactive venue cards, add blog discovery/navigation and synchronize route manifests/sitemap behavior.

Day 17 evidence: typecheck/lint, full production build, Article/TOC/Maps/gate/sitemap fixture tests, current feed/detail/SEO/PWA/admin regressions passed. Final mobile scroll/visible modified date/public-anchor corrections passed. Normal visitor and Googlebot HTTP responses return 200 with matching source-backed article bodies and Article JSON-LD; unknown article returns 404. No Supabase writes or publication performed. Canonical indexing still requires a genuine configured NEXT_PUBLIC_SITE_URL.

## Day 18 — Dynamic OpenGraph images

- [x] Create `app/api/og/route.tsx` using `@vercel/og` to return dynamic 1200×630 PNG share cards.
- [x] Render the Hey Bro logo/wordmark, dynamic title and neon-green accent border on a #09090b dark background, with safe handling for missing/long query text.
- [x] Integrate generated image URLs across venue detail and pSEO `generateMetadata()` output, with OpenGraph dimensions/alt text and X/Twitter large-image cards.
- [x] Keep canonical/image URLs tied to a genuine configured public origin; do not expose admin data, fetch arbitrary supplied image URLs, invent live transit/verified claims or change the age gate.
- [x] Preserve PNG content type, public cache behavior and safe error responses; verify actual generated images and metadata integration without publishing.

Day 18 evidence: typecheck/lint, actual PNG/local-font/logo/query/cache tests, venue/pSEO metadata tests, compiled standalone HTTP tests with/without a runtime-only publication origin, and affected SEO/blog/detail/PWA regressions passed. Final source-controlled cards keep normal words intact and constrain long/dense tokens. Actual API images are 1200×630 PNG; configured server metadata includes OG/Twitter URLs and alt. No public domain was invented, Supabase was not accessed and no website/social post was published.

## Day 19 — Security, rate limiting and bot protection

- [x] Add server-only `lib/rateLimit.ts` for tracking APIs and review forms, enforcing configured request budgets before body/database work with 429, Retry-After and no-store responses.
- [x] Use bounded local preview counters and a private atomic shared Supabase limiter for configured server deployments; preserve review SQL quotas/moderation/idempotency and fail closed when configured limiter storage fails.
- [x] Identify callers without storing raw IPs or trusting arbitrary forwarded headers. Document trusted-ingress and distributed migration activation requirements.
- [x] Configure application-wide HTTP security headers in the existing `next.config.ts` (the project's supported config file), preserving Preview embedding, OAuth, geolocation, map tiles, PWA and existing admin private/noindex protections.
- [x] Serve `/robots.txt` through the existing `app/robots.ts`, allowing Googlebot on the configured public origin and disallowing selected scraper bots while preserving private API/admin blocks, OG access and Preview noindex restrictions. Do not represent robots as a security boundary.
- [x] Show review-form cooldown feedback for 429 responses without clearing draft fields or breaking safe retries, and verify affected APIs/header/robots behavior without live database writes or publication.

Day 19 evidence: source lint/type checks, private limiter migration/rerun/role tests, API and retry parsing regressions, production build, actual standalone HTTP quota/header/robots tests and OG HTTP regressions passed. Configured shared limits remain an activation step: private Supabase credentials, new migration and a verified ingress-overwritten IP header are not provisioned or applied by these local tests. Preview uses bounded process-local counters and an unidentified shared bucket. Robots is advisory, not bot authentication; no publication was triggered.

## Day 20 — Production seeding and coordinate sanitization

- [x] Create `scripts/seed-production.js` for real non-explicit nightlife venues covering Sydney CBD, Surry Hills, Parramatta, Kings Cross; Melbourne CBD, St Kilda, South Yarra; Brisbane Fortitude Valley.
- [ ] Run the script against the authorized production Supabase project. Connection was not enabled; private credentials and target project reference are not supplied, so no production write was performed.
- [x] Validate every candidate's finite numeric lat/lng, Australian/city-area bounds, street address, state, postcode and evidence provenance before any insertion. Reject placeholders, missing pairs and swapped/out-of-range coordinates instead of silently inventing GPS values.
- [x] Use reproducible insert-only/idempotent production seeding; preserve existing venue edits, identifiers, verification, ratings, reviews and clicks. No destructive upsert or automatic schema/RLS weakening.
- [ ] Audit the target database's existing venue lat/lng/address data and read back inserted rows when authorized production access is available; report invalid rows and missing area coverage explicitly.
- [x] Verify generated Google Maps transit destination URLs for every accepted row, distinguishing URL/coordinate validity from origin/time-dependent actual route availability. Do not claim that valid coordinates guarantee a timetable/native-app handoff.
- [x] Preserve an explicit pending status if the production project, private credentials or live access is unavailable; dry-run validation is not a production seeding success.

Day 20 evidence: eight independently sourced real venues cover 8/8 areas with no manifest validation issues; every accepted coordinate pair/address and Google transit URL passes checks. Actual Node dry-run reports `status: validated`, `productionWritten: false`, and 8 candidates. Typecheck/lint, operator credential/target/insert-only/no-op/uncertain-write tests, cursor/count/concurrent-change regressions and local PostgreSQL schema/preservation tests passed. No hosted database was queried or changed. Full production-table audit and live insertion remain pending; itinerary/entrance/native-app guarantees are not claimed.

## 일반 사이트 문구 관리 보강 — English only

- [x] /admin/content에서 기존 승인 관리자 인증·CSRF 보호를 유지하고 영문 전용 브랜드 문구, 홈페이지 제목·소개를 편집한다. 성적 서비스 업체의 홍보·주소·연락·예약 정보 관리 기능은 추가하지 않는다.
- [x] 영문 미리보기, 초안 저장과 별도의 공개 버튼, JSON 내보내기, 버전 충돌 안내를 제공한다. 초안을 공개 사이트에 노출하지 않는다.
- [x] Supabase 문구 테이블·atomic 저장 RPC·공개 컬럼만 읽는 RLS 마이그레이션을 제공하고 DB 미연결일 때 저장 불가를 사실대로 안내한다.
- [x] 공개 문구만 홈페이지에 연결하고 고객 화면은 영어만 사용하고 Near Me에서 한글을 제거한다. 관리자 메뉴에서 새 화면을 발견할 수 있도록 연결한다. 기존 업체 기능 및 권한 경계를 변경하지 않는다.

- [x] Swap Strip Clubs and Nightlife in the category menu, placing Strip Clubs first; keep customer labels English-only and preserve existing category behavior.

Verified: type checks, lint, content auth/CSRF tests, SQL draft/publish and RLS tests, editor render checks, admin/PWA/navigation regressions, production build, fresh route fixtures, venue-detail and feed regressions passed. Hosted Supabase migration, administrator login and real publication remain owner setup actions; no live database changes were performed.

## English and Simplified Chinese routing

- [x] Every existing page resolves under `/en` and `/zh`; legacy page URLs redirect to English, invalid locales return 404, and API/static/SEO endpoints remain unprefixed.
- [x] Server-rendered HTML uses en-AU or zh-Hans, locale-preserving links and a language switch retaining the current route and query.
- [x] Public pages have reciprocal en-AU, zh-Hans and x-default hreflang and self-canonical URLs when a genuine publication origin is configured; private/demo/unavailable pages retain their noindex and access controls.
- [x] Sydney and Melbourne nightlife/wellness landing pages and venue pages receive matching English/Chinese titles and descriptions; visible Chinese local headings and navigation match those metadata tags.
- [x] Locale-prefixed admin routes remain authenticated, private/no-store and excluded from PWA caches; no claims, owner editor, live shifts or database writes are added.

Verified: production build, actual bilingual HTTP page matrix, reciprocal language metadata, trusted locale headers, redirect/404 checks, admin/PWA/content/Maps/telemetry/blog and schema regressions passed. Existing venue data and database schema were not changed; no publication was requested. Full canonicals/hreflang use the genuine NEXT_PUBLIC_SITE_URL deployment setting.

## Administrator visual shop editor

- [x] Add `app/[locale]/admin/editor/[id]/page.tsx` under the existing signed administrator allowlist, with EN/ZH editing tabs, intuitive left-side controls and a live mobile card/detail preview on the right. Limit editable listings to approved non-sexual nightlife and professional wellness businesses; do not add owner claims, sexual-service promotion or staff availability.
- [x] Add authenticated drag-and-drop image uploads to a Supabase Storage bucket; return the generated public URL and update draft gallery/preview immediately, with image validation, progress/error states and private server credentials.
- [x] Add `/api/admin/venue/update` with CSRF, explicit field validation, scoped venue/category authorization and optimistic version checks. Bro Verified and Live Now / 实时营业 switches commit immediately through this API, with pending state and rollback/conflict handling. Live Now means manually declared business-open status only.
- [x] Preserve locale URLs, existing public UI, admin no-store/noindex and offline-cache exclusions. Provide migration/setup instructions; do not fabricate connected database results or write production data during tests.

Verified: TypeScript, zero-warning lint, complete editor/API/repository/upload/public-profile tests, local PostgreSQL migrations and multiline/eight-photo/version guards, production build, actual EN/ZH editor HTTP checks, existing bilingual HTTP matrix, admin security and PWA regressions passed. No remote database or Storage mutations were performed.

- [ ] Live activation: configure authorized Supabase/admin credentials, apply the two editor/media migrations and set up the public venue-media bucket before actual uploads or venue writes can be used.

## Chinese detail-page sharing widgets

- [x] Add `components/ChineseViralWidgets.tsx` with Chinese-only WeChat contact and Xiaohongshu clipboard actions, matching the existing zinc/emerald mobile-first styling.
- [ ] Use an accessible WeChat modal with the genuine `/images/wechat-qr.png` and Copy WeChat ID control. Without supplied public account details/image, show an explicit unconfigured state, never a fabricated or unrelated QR/account.
- [x] Copy the current public page title and URL as a Chinese Xiaohongshu-ready caption, with `Link copied for Xiaohongshu! / 小红书链接已复制` success feedback and honest clipboard-denied fallback; do not submit a social post.
- [x] Place sharing controls below desktop and mobile detail CTAs when `locale === 'zh'`, using the existing `/zh/venue/[slug]` route rather than an extra `/zh/zh` segment. Retain English pages, age gate, Maps links, bookmarks and private APIs.
- [x] Keep WeChat inquiries limited to supported non-sexual business/site information; no sexual-service booking, availability or owner-claim funnel is added.
- [ ] Activate the scannable WeChat contact only after the user supplies the genuine public WeChat ID and QR asset.

The modal, disabled pending-state Copy ID control and configured/manual-copy/image-error branches are implemented and covered by fixtures; genuine QR/contact activation remains open. Integration is restricted to eligible genuine records, leaving all fictional detail profiles unchanged. TypeScript, zero-warning lint, focused helper/component/configuration tests, current bilingual route/metadata tests, PWA contracts, genuine-profile regression, production compilation and the 40-response bilingual HTTP matrix passed. The legacy `test:detail` snapshot still assumes pre-i18n unprefixed return links and fails at that unchanged assertion; it was not altered or presented as passing. No production data, account, QR, social post or publication was created.

## Timestamped business-open trust loop

- [x] Add `venues.last_live_updated_at` as TIMESTAMP WITH TIME ZONE and `is_live_status`, retaining existing `is_open_now` editor compatibility. Existing flags with no valid timestamp must not become newly trusted/live by migration.
- [x] Add `/api/venue/status`: authorized Live Now ON/reconfirmation sets true and database NOW(); OFF clears the effective flag. Enforce existing administrator authentication, CSRF, strict boolean/UUID/version validation and ordinary nightlife/professional wellness scope. No verified-owner authorization exists yet and a client claim must not bypass protection.
- [x] When genuine feed/listing or detail status is queried, treat and atomically clear true flags more than four hours old; missing, invalid or future timestamps are non-live. Prevent expiry from overwriting a concurrent fresh renewal. No recurring task is needed for this query-time behavior.
- [x] Show Live Now / 实时营业 with dynamically calculated Updated 10 mins ago / 10分钟前更新 in `HeyBroCard` and genuine detail/listing cards. Hide stale/non-live badges, advance labels while mounted and expire already-open pages, keeping all demo records and unrelated routes/UI unchanged.
- [x] Document and verify migration/API/clock behavior with local fixtures only; leave production Supabase activation and owner authorization explicitly pending. Do not publish or mutate remote data as a test.

Verified: typecheck, zero-warning lint, shared clock/API/refresh/integration tests, local PostgreSQL migration and post-query-clock renewal interleaving regression, existing editor/i18n/PWA/Chinese-widget regressions, production build, 40 bilingual HTTP responses, protected editor HTTP and new status endpoint HTTP all passed. The future-timestamp expiry branch uses evaluation-time `clock_timestamp()` rather than an older captured NOW so a fresh post-query renewal is not physically cleared. No actual two-server load simulation or hosted database write is claimed.

- [ ] Production activation: apply the committed live-status migration and configure the existing private Supabase/admin setup. Verified-owner permissions require a separately verified ownership model; self-claims remain unauthorized.

## Reddit community discussions

- [x] Add `utils/reddit.ts` to fetch `https://www.reddit.com/r/{subreddit}/hot.json?limit=10` for allowlisted Sydney/Melbourne sources and extract title, author, score, comment count, permalink and created timestamp. Bound requests and validate untrusted content/URLs; never fetch arbitrary hosts.
- [x] Add `components/RedditFeed.tsx` with EN/ZH interface, dark obsidian/neon thread cards, source city/subreddit tags, source attribution and original public thread metadata. No invented posts, inferred suburb addresses or fabricated translations.
- [x] Integrate the feed into localized `/community` pages, preserving locale routes, canonical/hreflang, shared age gate, navigation, PWA/private caching boundaries and unrelated public UI/data.
- [x] Make current supported nightlife/venue discussions available immediately from server data and restrained visible-page refresh. Distinguish successful empty results, partial failures, blocked sources, loading and cached fetch timestamps; do not present stale data as live or add social writes.
- [x] Keep the feed within ordinary non-sexual nightlife/venue information, excluding adult/removed/deleted/advertising/explicit sexual-service items; third-party opinions are not reviews, verification or business status.
- [x] Document public API access limits and observed HTTP 403 fallback without bypassing Reddit restrictions or claiming live upstream success. Validate with local fixtures, type/lint/build and affected locale/HTTP checks before saving without publishing.
- [ ] Live upstream activation: Reddit must permit this deployment's requested public JSON access or an independently approved integration must be configured. Current server requests to both sources are HTTP 403; no pretend feed is supplied.

Verified: strict parser/request/cache/bilingual UI/refresh fixtures, typecheck, zero-warning lint, i18n/PWA and Chromium/WebKit age-gate regressions, production build, the 40-response bilingual HTTP matrix and new standalone community HTTP all passed. Successful/blocked HTTP cases used explicitly test-only upstream fixtures; real public endpoint access remains denied. Current server thread data is included before consent, but discussion cards remain behind the existing age gate. No fake posts were installed, access bypass used, social action submitted, production database changed or publication triggered.

## Two-way Reddit sharing and discussion actions

- [x] Add `components/RedditShareButton.tsx` generating `https://www.reddit.com/submit?url={encodeURIComponent(currentUrl)}&title={encodeURIComponent(pageTitle)}`, with Reddit-orange accent and a clean discussion icon. Only sanitized public current-page URLs/titles are included, with no query/hash, credentials, private hosts or admin/API paths.
- [x] Add a prominent Join the discussion on Reddit / 在Reddit上参与讨论 action box to eligible genuine non-sexual venue detail pages and the localized community page. Keep fictional and unsupported service profiles unchanged; preserve age gate, locale paths and existing sticky Maps/call clearance.
- [x] Add community-post actions opening the validated existing Reddit discussion and a compact Reddit draft share of the Hey Bro community page with the thread title, creating the requested outbound/inbound opportunity without inventing existing venue threads.
- [x] Open actions in a new tab with noopener/noreferrer; initialize safely after hydration and prevent a stale link on route changes. The user chooses/reviews/submits on Reddit—no automated post, API/social write, tracking or false success message is added.
- [x] Verify share URL encoding/privacy, EN/ZH rendering, real/demo/category exclusions and new-tab behavior with local fixtures and affected build/locale checks; save without publishing. Existing live-feed HTTP 403 remains a separate unresolved upstream blocker.

Verified: share URL/privacy/surrogate/category fixtures and real component hydration/click/route-transition/new-tab/integration tests passed, as did TypeScript, zero-warning lint, existing Reddit/i18n/PWA regressions, genuine-profile regression, production build, standalone community HTTP and the 40-response bilingual HTTP matrix. Discussion actions preserve the actual source permalink; secondary drafts contain the Hey Bro page URL. No Reddit submit page was visited or post submitted during testing. The prior unavailable live-feed source remains unchanged.

## 커뮤니티 토론 섹션 노출과 Reddit 로고

- [x] 메인 히어로 바로 아래에 Community discussions / 社区讨论 진입 섹션을 배치하여 카테고리·장소 목록보다 먼저 보이게 하고, 현재 언어의 커뮤니티 페이지로 연결한다. 지도·저장 목록과 기존 장소 정보는 보존한다.
- [x] 상단 헤더에 커뮤니티 링크를 추가하고 데스크톱·모바일에서 잘 보이도록 한다. 도시 선택, 언어 전환, 검색과 기존 하단 탐색 탭은 계속 이용 가능해야 한다.
- [x] 실제 Reddit 로고를 메인 섹션, 헤더 링크, 토론 페이지 제목에 넣는다. 출처는 Reddit 브랜드 설명과 검증한 VectorLogoZone SVG이며, 꾸며낸 유사 로고나 제휴·승인 표현은 사용하지 않는다.
- [x] EN/ZH 경로와 18+ 게이트, 기존 이용 불가 안내와 안전한 공유 동작을 유지한다. 홈 노출을 위해 Reddit API 호출이나 가짜 게시물을 추가하지 않는다.
- [x] 관련 홈 렌더, Reddit 피드/공유, i18n·navigation 테스트와 타입 검사, 린트, 프로덕션 빌드를 확인하고 모바일 Preview 캡처에서 기존 18+ 게이트와 레이아웃을 확인했다. 자동 게시 없이 저장한다.

Evidence: home discovery and Reddit logo render passed; Reddit feed/share, i18n-navigation, detail/navigation fixtures, `pnpm check`, `pnpm lint`, and `NEXT_TELEMETRY_DISABLED=1 pnpm build` passed. The pre-existing full `tests/feed-render.test.mjs` still contains an old direct `/venue/<id>` expectation and was not changed; the new community assertions pass independently. Preview was refreshed and mobile EN/ZH/community captures were taken with the 18+ gate intact.
