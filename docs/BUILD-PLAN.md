# Flat White Me — Build Plan

Status: proposed 2026-11-09. App scaffold and system screens exist; no database, auth, CI or hosting yet.

## Outcome

A deployed public web app at `flatwhite.me` that ranks Lisbon cafés by flat white quality, built in phases that are independently verifiable. Each phase ends with a green CI run and a manual check on a phone.

## Current State

| Area | State |
|---|---|
| Repository content | Git repository on GitHub: product docs, static system screens, Next.js app |
| Product docs | This document set |
| Application code | Fresh Next.js app in `app/`: public browse screens (explore, map, café, top, landing, info) and rating sheet UI |
| Database | Local Postgres 16 via Docker; 1,231 imported cafés, 0 ratings; the app reads it |
| CI/CD | Not yet configured in this repository |
| Hosting | `render.yaml` not yet added in this repository |

## Locked Decisions

- D1 — Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, Postgres 16 + Prisma 7, Zod 4. See ADR 0001.
- D2 — Four-dimension scorecard, recency-weighted ranking, 3-rating minimum. See ADR 0002.
- D3 — Overture Maps directory import, MapLibre map, no Google Places. See ADRs 0003 and 0005.
- D4 — Google Sign-In only, opaque session cookies. See ADR 0004.
- D5 — Render web service + Neon Postgres, EU region. No analytics beyond the database and Sentry.
- D6 — Single town: Lisbon municipality. Multi-town is a schema affordance only.

## Non-Goals

Everything in `MVP-SCOPE.md` § Won't. This plan does not add features; it sequences the agreed scope.

## Workstreams

### Phase 0 — Repository and skeleton

1. `git init`, `.gitignore`, `.nvmrc` (22.18.0), `package.json`.
2. Next.js 16 App Router, React 19, TypeScript strict plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
3. Tailwind 4 with the token layer from `DESIGN-GUIDELINES.md`; Inter via `next/font`.
4. ESLint flat config, Prettier (`singleQuote`, no semicolons, 100 columns, `singleAttributePerLine`), import alias `@/` only.
5. Vitest, Playwright with axe, Husky + lint-staged.
6. `/api/health` returning `{ status: "ok", version }`.
7. GitHub Actions: typecheck, lint, format check, unit, build, `npm audit --audit-level=high`.
8. `render.yaml`, `.env.example`, `README.md` quickstart.

**Verification:** `npm run build`, `npm run typecheck`, `npm run lint`, `npm test` pass locally and in CI; deployed health check returns 200.

### Phase 1 — Directory import spike

1. Pin an Overture Maps release and record it in the import script.
2. DuckDB/S3 query: places theme, Lisbon bbox, café/coffee-shop categories.
3. Deduplicate by Overture id and normalized name + 100 m.
4. Generate stable slugs; insert with `source = overture`.
5. Import report: counts by category, duplicates, missing coordinates, neighbourhood coverage.
6. Second run must change zero rows except `lastImportedAt`.
7. Map `operating_status` per `DATA-MODEL.md`: null → unknown, permanently closed → review queue, never auto-close.

**Verified (2026-11-09):** release `2026-10-21.0`, schema v2.0.0, monthly cadence; filter `taxonomy.primary IN ('cafe','coffee_shop')`; central Lisbon bbox yields 1,281 candidates from 49,348 places. `operating_status` is null for 98.3% of Lisbon rows and all sampled café rows, so it cannot detect closures. Licence is CDLA-Permissive 2.0 plus Apache 2.0; places contain no OSM data and carry no share-alike. Record any deviation from these facts in ADR 0003 before coding against it.

**Verification:** fetch a café by slug in a script; compare 10 random rows to Overture source; report committed under `docs/import-reports/`.

### Phase 2 — Authentication and sessions

1. Google OAuth client, callback at `/auth/callback`.
2. `User` and `Session` tables; token hashed with SHA-256, httpOnly/Secure/SameSite=Lax cookie, 30-day expiry.
3. `ADMIN_EMAILS` allowlist check.
4. Sign-in/out UI in the header; anonymous browsing unaffected.

**Verification:** sign in on desktop and phone; session survives restart; signed-out user cannot POST a rating; admin-only route rejects non-admin.

### Phase 3 — Cafés and suggestions

1. Café detail page, server-rendered, with score block and empty states.
2. Café search over the imported directory.
3. Suggestion form and `CafeSuggestion` queue.
4. Admin approve/reject/merge, duplicate candidates shown side by side.
5. Slug immutability and duplicate detection tests.

**Verification:** suggestion cannot appear publicly before approval; approving creates one café; merging keeps existing ratings.

### Phase 4 — Ratings

1. Rating modal with four score groups, price, milk type, size, visit date, note.
2. Zod schema shared between client and server; validation on the server only matters.
3. One live rating per user per café; overwrite appends `RatingRevision`.
4. Daily cap of 20, enforced in a transaction; note lock after 30 days.
5. Report flow; admin hide.
6. Account deletion with anonymisation.

**Verification:** second submission updates and does not increase sample size; 21st rating in a day rejected; hidden rating leaves the score; deleted account leaves anonymous ratings and no notes.

### Phase 5 — Ranking and list

1. `cafe_scores` view and query per `DATA-MODEL.md`.
2. Ranked / Too few ratings / Unrated sections with sample size and last visit.
3. Filters and sorts; price band and specialty.
4. Query-plan check with synthetic 50,000 ratings.

**Verification:** formula unit tests with fixed dates; a 12-month-old visit excluded; tie-breaks deterministic; query under 200 ms.

### Phase 6 — Map

1. MapLibre GL JS with the OpenFreeMap `liberty` style behind a single style-URL config value.
2. Pins for ranked / too few / unrated / want-to-try with shape plus label.
3. Near-me on explicit tap only; no server-side location storage.
4. Radius and viewport filtering; list is the accessible alternative.
5. Attribution rendered exactly as required.

**Verified (2026-11-09):** OpenFreeMap's public instance is free for production, needs no key and documents no request cap; use `https://tiles.openfreemap.org/styles/liberty`, which adds `OpenFreeMap © OpenMapTiles Data from OpenStreetMap`. MapTiler and Stadia free tiers forbid commercial use. Protomaps hosted is non-commercial on the free tier; self-hosting a Lisbon PMTiles extract is the fallback. Record any provider change in ADR 0003 before shipping.

**Verification:** map works on a mid-range Android phone; keyboard users can reach every café through the list; attribution visible at all breakpoints; no location prompt on load.

### Phase 7 — SEO, landing and PWA

1. `/best-flat-white-lisbon` per `LANDING-PAGE-SPEC.md`, PT and EN.
2. Metadata, canonical, hreflang, sitemap, robots.
3. `LocalBusiness` + `AggregateRating` JSON-LD only when sample ≥3.
4. Static OG tags per café; Web Share API.
5. Manifest, icons, standalone display; no service worker.

**Verification:** JavaScript-disabled render shows content; rich-results test accepts the markup; Lighthouse SEO and Accessibility ≥95; install prompt works on Android.

### Phase 8 — Launch

1. Seed: import directory, rate 30+ cafés yourself, invite 5–10 friends for one week.
2. Public launch only at ≥100 ratings across ≥40 cafés.
3. Privacy page, about page, contact.
4. Sentry with PII scrubbing; no analytics.
5. Metrics SQL for the four success targets, run weekly.
6. Launch checklist: backup restore tested, health check, error budget, rollback procedure.

**Verification:** all PRD acceptance criteria pass; metrics queries return numbers; a fresh deploy from `main` succeeds without manual steps.

## Contracts

- `POST /api/ratings` — Zod-validated, session required, returns the saved rating and new café score.
- `POST /api/suggestions` — session required, returns pending suggestion.
- `POST /api/reports` — session required, rate-limited.
- `POST /api/admin/*` — allowlisted admin only.
- `GET /api/health` — public, no secrets.
- All mutations use Server Actions where a form exists; route handlers only where a form does not fit.

## Tests

| Layer | Tool | Minimum coverage |
|---|---|---|
| Ranking math | Vitest | Fixed-date cases, window edges, tie-breaks |
| Validation | Vitest | Every Zod schema: valid, boundary, invalid |
| Rating rules | Vitest + DB | Uniqueness, daily cap, note lock, anonymisation |
| Components | Vitest + Testing Library | ScoreBadge, CafeRow, RatingModal states |
| E2E | Playwright | Browse, sign in, rate, edit, suggest, admin approve, delete account |
| Accessibility | axe in Playwright | List, café page, rating modal, landing page |

## Rollout and Rollback

- Deploy on every push to `main`; Prisma migrations run before start.
- Migrations must be backward compatible for one release.
- Rollback: redeploy the previous Render deploy; database migrations are additive only until launch.
- No feature flags in v1; instead, `/admin` can hide a café or rating immediately.

## Risks

See `MVP-SCOPE.md` § Risks and Mitigations. Additional build risks:

| Risk | Mitigation |
|---|---|
| Overture schema differs from expectation | Phase 1 spike before any schema work |
| Map provider terms change | Provider abstraction and a list-only fallback |
| Ranking view slow at scale | Materialized view fallback documented in `DATA-MODEL.md` |
| OAuth setup blocks local work | Health-check and list pages work without Google credentials |

## Out of Scope

Photos, opening hours, Google Places, multi-town UI, native apps, social features, analytics, monetization, email digests.

## Implementation Notes

- 2026-11-09 — Plan created. Google Places rejected after a terms review; see ADR 0005.
- 2026-11-09 — Overture and tile facts verified: release `2026-10-21.0`, ~1,281 café candidates in the central Lisbon bbox, OpenFreeMap usable in production, Overture `operating_status` unreliable for closures. See ADR 0003.
- 2026-11-09 — Static clickable screen set added under `system/` with its own plans; it is design validation only and does not satisfy any Phase 0–8 item or the no-demo-data rule.
- 2026-11-09 — Phase 0 partial: Next.js 16 + React 19 + TypeScript strict + Tailwind 4 scaffold, token layer, responsive shell, `/api/health`. Screens read `lib/fixtures.ts`; database, auth, CI and Render are still pending.
- 2026-11-09 — All system screens ported to the app, desktop and mobile layouts included. Saved cafés and ratings live in `localStorage`; they move to Postgres in Phases 2–4.
- 2026-11-10 — Phase 8 partially implemented: contact page; optional Sentry server init with PII scrubbing (no user, request or extra payloads; emails redacted; no breadcrumbs) enabled only when `SENTRY_DSN` is set; `docs/METRICS.sql` for the four success targets plus the launch gate; GitHub Actions CI (typecheck, tests, build, audit) with build-only dummy env; `render.yaml` running `prisma migrate deploy` before start; `docs/LAUNCH.md` with gate, environment, deploy, backup and rollback checks. Not done: deployment, DNS, production OAuth redirect, Neon database, backup restore rehearsal and the ≥100 ratings launch gate. CI build verified locally with the same dummy env.
- 2026-11-10 — Phase 7 implemented: `/best-flat-white-lisbon` PT/EN (cookie preference, query override) with Top 10, score explainer and worked example, latest notes, FAQ, `ItemList` JSON-LD, canonical and hreflang; café pages add OG metadata, share via Web Share/clipboard and `CafeOrCoffeeShop` + `AggregateRating` JSON-LD only at 3+ ratings; `sitemap.xml` (1,231 cafés plus static pages), `robots.txt`; `manifest.webmanifest`, 192/512/maskable icons and apple touch icon, static OG image, standalone display, no service worker. Verified over HTTP: PT/EN landing, ItemList, hreflang, FAQ, manifest, sitemap count, robots, OG/icon PNGs, café JSON-LD with temporary ratings (removed afterwards). Lighthouse and axe not run.
- 2026-11-10 — Phase 6 implemented: MapLibre GL JS with OpenFreeMap `liberty` behind `NEXT_PUBLIC_MAP_STYLE_URL`; ranked circles, few-ratings squares, unrated dots and a focus ring on saved cafés (pins capped at 200); explicit `Perto de mim` button requests geolocation only on tap and stores nothing; viewport count plus an in-view list as the accessible alternative; attribution line rendered under the map. Verified by build and server render; WebGL interaction could not be exercised headless.
- 2026-11-10 — Phase 5 implemented: explore, map and top read Postgres; ranked / too few / unrated sections with sample sizes and last visit; filters for minimum score, price band, specialty and search; cards capped (30 ranked, 12 few, 24 unrated, 60 map pins) so a directory of 1,231 cafés does not render 1,231 cards. At 50,000 synthetic ratings the plain view took 588 ms, above the 200 ms budget, so `cafe_scores` became a materialized view refreshed after every rating write and admin hide (49 ms measured for the list query). `lib/fixtures.ts` and the localStorage store were deleted; the app is Postgres-only. Gaps: no explicit sort control beyond score order, and the explore payload still serializes the full café list (366 KB HTML, smaller after compression).
- 2026-11-10 — Phase 4 implemented: `POST /api/ratings` (Zod, one live rating per user/café, `RatingRevision` on overwrite, 20-per-day cap in a transaction, 30-day note lock), want-to-try API, `GET /api/library`, `POST /api/reports`, admin rating hide, `POST /api/account/delete` (ratings anonymised, notes and sessions removed). The rating sheet now records milk type, size, visit date and note; bookmarks and ratings are server-backed. Verified over HTTP: anonymous 401; create then overwrite keeps one id and writes one revision; library reflects saved and rated cafés; the 21st new rating returns 429; a locked note change returns 409 while score-only edits pass; report 201; hidden rating leaves the library; account deletion anonymises all 20 ratings and signs the session out. Gap: no report entry in the UI because v1 shows no public note feed; the API and admin queue are ready.
- 2026-11-10 — Phase 3 implemented: `GET /api/cafes` search, `POST /api/suggestions` (session + Zod), admin page backed by pending suggestions with duplicate candidates under 100 m, approve/reject/merge routes, slug collision suffixes, rating-hide route. Approval requires coordinates because `Cafe` has non-null coordinates; a suggestion without them is refused. Verified over HTTP: 401 anonymous, 201 pending, 400 approval without coordinates, approve creates a café, duplicate name approved as `-2`, admin duplicate warning, reject. Vitest: 16 tests.
- 2026-11-10 — Phase 2 implemented: `/auth/google`, `/auth/callback`, `POST /auth/signout`, HMAC-SHA256 session token hashes with `SESSION_SECRET`, 30-day httpOnly/SameSite=Lax cookie, 1-hour `lastSeenAt` refresh, `ADMIN_EMAILS` allowlist on sign-in, `/api/auth/me`, Sobre sign-in/out UI. Verified: Google redirect with state cookie, state mismatch rejection, signed-in session read and sign-out against a seeded local session. Real Google round trip still needs a browser and the registered redirect URI.
- 2026-11-09 — Phase 1 implemented: Prisma 7 schema and migration (ranking view, score/price/note checks, partial unique rating index), DuckDB Overture query, Prisma upsert import, `docs/import-reports/2026-11-09-lisbon.json`. 1,231 active cafés; rerun inserts 0 and updates 1,231. Screens still read fixtures because the database has no ratings and therefore no scores.
- 2026-11-11 — Fresh app scaffolded in this repository per `docs/plans/RESPONSIVE.md`: Next.js 16, React 19, TypeScript strict, Tailwind 4, Prisma 7, MapLibre with a locally served worker. All public screens read the 1,231 real cafés. Google Sign-In is wired per ADR 0004: `/auth/google`, `/auth/callback`, `/auth/signout`, HMAC-hashed opaque sessions, 30-day httpOnly/SameSite=Lax cookie, `ADMIN_EMAILS` role. Ratings are server-backed with Zod, one live rating per user/café, `RatingRevision`, 20-per-day cap and 30-day note lock. Saved cafés, suggestions, admin approve/reject/merge, café close/reopen, specialty flags, report hide/dismiss and launch metrics are live. Account deletion anonymises ratings. Public notes, report sheet and nickname editing are live; café metadata, JSON-LD at 3+ ratings, sitemap, robots, manifest and PWA icons are in place. Quality gates: ESLint, Prettier check, typecheck, build, 9 Vitest tests, seven Playwright flows plus an opt-in Google OAuth smoke, 320–1280 px overflow, axe with no serious/critical violations, and Lighthouse mobile 100/100/100/100. `render.yaml`, `/api/health` and GitHub Actions CI are committed. Remaining: actual Render/Neon/DNS deploy, automated real Google login (human consent), café closure detection beyond admin review, and the ≥100 ratings launch gate.
