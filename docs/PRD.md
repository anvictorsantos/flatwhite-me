# Flat White Me — Product Requirements Document

## 1. Summary

Flat White Me ranks cafés in Lisbon by the quality of their flat white, using structured ratings from signed-in users. The product is a public website, phone-first, in Portuguese and English. No café pays for placement and no editorial score overrides user ratings.

## 2. Roles and Permissions

| Role | Can |
|---|---|
| Anonymous visitor | Browse map, ranking and café pages; read public notes |
| Signed-in rater | Everything anonymous can; rate cafés, edit own rating, write notes, save want-to-try, suggest cafés, delete account |
| Admin | Everything a rater can; approve/reject suggestions, merge duplicates, hide ratings and notes, flag cafés closed |

Admin is granted by email allowlist (`ADMIN_EMAILS`). No role management UI.

## 3. Screens and Routes

| Route | Purpose |
|---|---|
| `/` | Map + ranked list; default view |
| `/best-flat-white-lisbon` | Public landing and SEO page with top 10 |
| `/cafe/[slug]` | Café detail, score breakdown, notes, rating CTA |
| `/my` | Private want-to-try list and own ratings |
| `/suggest` | Suggest a missing café |
| `/admin` | Approval queue and moderation |
| `/about` | How the score works, attribution, contact |
| `/privacy` | Privacy policy and account deletion explanation |
| `/auth/callback` | Google OAuth callback |

The rating flow is a modal, reachable from the list and the café page. There is no rating route.

## 4. Functional Requirements

### 4.1 Directory

- **FR-1** The café directory is imported from an Overture Maps Places snapshot, filtered to Lisbon municipality and café/coffee-shop categories.
- **FR-2** Each café stores Overture place id, source, name, normalized name, address, coordinates, specialty flag, status and last import date.
- **FR-3** Import is idempotent and upserts on Overture id. Existing ratings, notes and specialty flags are never overwritten by an import.
- **FR-4** Cafés absent from a new snapshot are marked `possibly_closed`, not deleted. Overture `operating_status` is almost always null and never closes a café automatically; `permanently_closed` only queues it for admin review. An admin confirms closure.
- **FR-5** Slugs are stable once created; a renamed café keeps its URL.

### 4.2 Suggestions

- **FR-6** A signed-in user can search existing cafés, or submit a new café with name, address, optional coordinates and note.
- **FR-7** Suggestions enter a pending queue and never appear publicly until approved.
- **FR-8** Duplicate detection compares normalized name plus 100 m proximity. The admin sees suspected matches before approving.
- **FR-9** Admin can approve, reject or merge a suggestion into an existing café.
- **FR-10** A user cannot rate a café they suggested.

### 4.3 Ratings

- **FR-11** A rating records: taste, milk texture, temperature, value (each integer 1–5), price paid in EUR cents, milk type, size, visit date, optional note (≤280 characters).
- **FR-12** A user has one live rating per café. Submitting a new visit updates it and appends the previous state to history.
- **FR-13** Ratings and notes are editable by the author. Notes lock 30 days after creation.
- **FR-14** A user may submit at most 20 ratings per day. The limit is enforced server-side.
- **FR-15** Any signed-in user can report a rating or note. Admin can hide it; hidden ratings are excluded from scores.
- **FR-16** Visit date cannot be in the future and cannot be older than 5 years.

### 4.4 Ranking

- **FR-17** Visit score = `0.4 × taste + 0.3 × milkTexture + 0.1 × temperature + 0.2 × value`, on a 1–5 scale.
- **FR-18** Café score = weighted mean of visible visit scores whose visit date is within 365 days. Each visit weight is `0.5 ^ (ageDays / 182.5)`, where `ageDays` is measured from the visit date to today.
- **FR-19** A café with at least 3 visible ratings in the window is **Ranked**. Fewer than 3 is **Too few ratings**. Zero is **Unrated**.
- **FR-20** The default list order is Ranked by score desc, then Too few ratings by raw mean desc, then Unrated alphabetically. Ties break by sample size, then median price paid.
- **FR-21** Every displayed score shows the sample size and the most recent visit date. Scores display one decimal.
- **FR-22** Cafés with status `closed` or `hidden` never appear.
- **FR-23** The specialty flag is informational and never affects ranking.

### 4.5 Map and Discovery

- **FR-24** The map opens centred on Lisbon, city scale.
- **FR-25** Geolocation is requested only after an explicit "near me" tap. Location is never stored server-side.
- **FR-26** Filters: minimum score, specialty only, price band, want-to-try only. Sorts: score (default), distance when location is available.
- **FR-27** Radius options: 1 km, 3 km, whole town.
- **FR-28** Map pins encode status: ranked (with score label), too few ratings, unrated, want-to-try. Colour is never the only differentiator.

### 4.6 Lists and Account

- **FR-29** Signed-in users can mark a café "want to try"; the list is private.
- **FR-30** `/my` shows want-to-try and own ratings, newest first.
- **FR-31** Display name defaults to the Google first name; the user can set a nickname. Email is never public.
- **FR-32** Account deletion deletes the profile and notes and anonymises ratings (`user_id` set null). The aggregate ranking survives.
- **FR-33** Sessions are opaque random tokens stored hashed in httpOnly, Secure, SameSite=Lax cookies.

### 4.7 Admin

- **FR-34** `/admin` requires an allowlisted Google account and is excluded from indexing.
- **FR-35** Admin actions: approve/reject suggestion, merge suggestion into café, hide/unhide rating, flag café closed/reopen, edit specialty flag.
- **FR-36** Every admin action stores actor, timestamp and target.

### 4.8 SEO, Sharing and PWA

- **FR-37** Café pages and the landing page are server-rendered and indexable, with canonical URLs and an XML sitemap.
- **FR-38** `LocalBusiness` JSON-LD with `AggregateRating` is emitted only for Ranked cafés. No rating markup below 3 ratings.
- **FR-39** Each café page has static Open Graph tags: name, score, sample size. No generated images in v1.
- **FR-40** Café pages expose the Web Share API when available.
- **FR-41** A web manifest, icons and standalone display make the app installable. No service worker and no offline data in v1.

## 5. Non-Functional Requirements

- **NFR-1** TypeScript strict everywhere: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **NFR-2** All mutations validate with Zod at the server boundary.
- **NFR-3** Tailwind semantic tokens only; no arbitrary values.
- **NFR-4** WCAG 2.2 AA. Touch targets ≥44 px. No meaning conveyed by colour alone.
- **NFR-5** LCP under 2.5 s on a mid-range phone over 4G for the list and café page.
- **NFR-6** Ranking query under 200 ms at 1,000 cafés and 50,000 ratings.
- **NFR-7** No third-party scripts except Sentry. No cookie banner.
- **NFR-8** All user input escaped or rendered through React; no `dangerouslySetInnerHTML` for user content.
- **NFR-9** Rate limits on rating, suggestion and report endpoints.
- **NFR-10** Secrets only in environment variables; `.env.example` lists every variable.

## 6. Out of Scope

Everything in `BRIEF.md` § Non-Goals. Specifically: photos, opening hours, Google Places, social features, native apps, offline mode, dark mode, monetization, analytics, notifications, profile pages, multi-town UI.

## 7. Acceptance Criteria (MVP)

1. A new visitor can open `/`, see the Lisbon map and a ranked list, and open a café page without signing in.
2. A signed-in user can rate a café in under 60 seconds from the café page or list row.
3. A second visit updates the same rating and does not double-count the café's sample size.
4. A café with fewer than 3 ratings never appears in the ranked section.
5. Scores visibly change over time as visits age; a 12-month-old rating is excluded.
6. The list and café pages work with JavaScript disabled for core content (map excluded).
7. Keyboard-only users can complete the rating flow; axe reports no critical violations.
8. A suggested café cannot appear publicly until approved.
9. Account deletion removes the profile and notes and leaves ratings anonymised.
10. `npm run build`, typecheck, lint, unit tests and Playwright E2E pass in CI.
