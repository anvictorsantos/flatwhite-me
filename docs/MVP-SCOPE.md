# Flat White Me — MVP Scope

## Must

- Overture Maps import of Lisbon café candidates, stored with stable slugs.
- Café detail pages and ranking list, server-rendered.
- Four-dimension scorecard, one live rating per user per café, rating history.
- Recency-weighted ranking with a 3-rating minimum and visible sample size.
- Google Sign-In and opaque session cookies.
- MapLibre map with pins, score labels and status shapes.
- Filters: minimum score, specialty, price band, want-to-try. Near-me on explicit tap.
- Private want-to-try list and own ratings at `/my`.
- Café suggestion flow with admin approval and duplicate detection.
- Minimal `/admin`: approve/reject/merge, hide rating, flag closed.
- PT-PT and EN UI.
- Landing page `/best-flat-white-lisbon` with top 10 and score explainer.
- Privacy page, account deletion, Overture/OSM attribution.
- PWA manifest and icons.
- CI: typecheck, lint, format, unit, E2E, build, audit.

## Should

- User-uploaded café photos (our content, moderated), v1.1.
- Public rater profile page showing their ratings, opt-in.
- Shareable "my ranking" image or link.
- Advanced duplicate review with side-by-side comparison.
- Database-backed ranking cache if the live query exceeds budget.

## Could

- Multi-town support (schema is ready; UI is not).
- Crowd-reported opening hours with confidence.
- "Flat white of the month" editorial note, clearly separate from the score.
- Email digest of new highly rated cafés.
- Portuguese/English user-generated notes with language tags.

## Won't (v1)

- Google Places, Google Maps embeds or Google café photos.
- Social feed, follows, comments, likes, direct messages.
- Ads, sponsored placement, affiliate links, paid tiers.
- Native iOS/Android apps.
- Offline mode, background sync, push notifications.
- Third-party analytics and marketing consent surfaces.
- Café owner claims or owner responses.
- Multi-city browsing UI.

## Milestones

| Milestone | Exit criteria |
|---|---|
| M0 — Decisions and docs | This doc set reviewed and committed |
| M1 — Skeleton | App boots, CI green, `/api/health` returns ok, DB migrated |
| M2 — Directory | Import script runs twice without duplicates; 150+ cafés in Lisbon |
| M3 — Rate and rank | End-to-end rating, history, ranking query, tests |
| M4 — Discover | Map, filters, café pages, SEO basics |
| M5 — Govern | Suggestions, admin queue, reporting, account deletion |
| M6 — Soft launch | You and 5–10 friends rate; no fabricated data |
| M7 — Public launch | Success thresholds reached; launch checklist complete |

## Done Means

- All acceptance criteria in `PRD.md` § 7 pass in CI and in a manual phone run.
- Seed data is real: every rating maps to a signed-in account and a visit date.
- Empty and low-sample states are honest and visible.
- Attributions for Overture and OpenStreetMap appear where required.
- Privacy page explains deletion and anonymisation accurately.
- No known high or critical dependency vulnerabilities.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Overture café coverage is patchy in parts of Lisbon | Empty map areas | Measure during import spike; allow suggestions from day one |
| Cold start: too few ratings at launch | Ranking looks empty | Friends soft launch; show unrated cafés; honest empty states |
| Rating spam or ballot stuffing | Score credibility | One rating per user per café, 20/day cap, reports, admin hiding |
| Ranking feels arbitrary | Trust loss | Published formula, sample size and last-visit date on every page |
| OSM tile provider changes terms or limits | Map unavailable | Provider abstraction; fallback style; list view works without map |
| Map performance on low-end phones | Bad first impression | Vector tiles, viewport-only pins, lazy-load map below the list on slow devices |
| Legal: directory derived from Overture | Licensing complaint | Permissive licence, attribution, ADR record; review before distributing dataset |
| Google OAuth outage or policy change | No new ratings | Browse stays anonymous; no other runtime dependency on Google |
| Scope creep toward social features | Launch slips | Non-goals are explicit; new ideas go to `Should` or `Could` |
| Overture `operating_status` is null for nearly all Lisbon places | Closed cafés stay listed; no live open/closed signal | Admin review, user reports, and absence from two consecutive imports flag a café |
