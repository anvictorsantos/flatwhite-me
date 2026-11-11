# Conquistas de freguesia — implementation plan

Status: implemented 2026-11-11 (phases 1–5 + nav entry). `prisma db push` is unusable on Prisma 7
without a `prisma.config.ts`, so the local column/index were applied with the DDL below; production
needs the same DDL plus `scripts/backfill-freguesias.mjs`.

## Outcome

A signed-in user can "conquer" a freguesia by rating every active café located in it. Lisbon has
24 freguesias, so the feature is a 24-cell progress board: each cell shows visited/total cafés and
flips to "Conquistada" when visited equals total. Nothing is stored as a conquest — it is derived
from ratings, so it can be lost if a new café opens in a freguesia the user had completed.

## What the data says today

- `Cafe.neighborhood` is `NULL` for all 1232 rows. There is no freguesia anywhere in the schema.
- All cafés sit inside the Lisbon municipality bounding box (38.692–38.796 N, −9.229–−9.092 W).
- `Rating.userId` is nullable and there is no unique constraint per user/café, so a user may have
  several ratings for one café (visits). Presence of any `visible` rating counts as "visited".
- There are no ratings yet and one user, so no backfill of progress is needed.

Consequence: freguesia membership must be computed from each café's coordinates, not from text
fields.

## Decisions

1. **Static boundary file, resolved at write time.** Ship the 24 freguesia polygons as GeoJSON in
   the repo. Resolve a café's freguesia when it is created (Overture import, admin approval of a
   suggestion) and store the slug on the row. No runtime point-in-polygon in queries.
2. **Derived progress, no `Conquest` table.** Progress is one grouped SQL query. This keeps
   "conquered" honest when the café set changes (new café → progress drops).
3. **Counts are all-time.** Unlike rankings (365-day window), conquest uses every `visible` rating
   the user has, regardless of `visitedOn`. Visiting a café twice is still one café.
4. **Only active cafés count.** Archived/hidden cafés never block or complete a freguesia;
   suggestions, want-to-try and unrated imports do not exist for the user.
5. **Personal feature.** Anonymous visitors get the login CTA, not a global leaderboard. (A global
   view is possible later because the same query works without `userId`.)

## Data source

Freguesia polygons for Lisbon: the CAOP 2019 "Freguesias_Lisboa" Feature Service on ArcGIS Online
(`services.arcgis.com/g8EzU2gNHvGpFUGY/.../CAOP_2019_Freguesias_Lisboa/FeatureServer/0`,
query `f=geojson`), 24 features, 288 KB, stored as `data/freguesias-lisboa.json` (a `.json`
extension so TypeScript and Vitest can import it). Validate: 24 features, each café either inside
one polygon or counted as outside the municipality — the backfill reports 1002 inside and 230
outside (Amadora/Odivelas), never guessed.

## Schema

```prisma
model Cafe {
  ...
  freguesia String?   // slug: "benfica", "misericordia", ...
  @@index([freguesia, status])
}
```

Migration via the project's current mechanism (`prisma db push`; there is no `prisma/migrations`
directory). `db push` needs a `prisma.config.ts` on Prisma 7, so the change was applied directly:

```sql
ALTER TABLE "Cafe" ADD COLUMN IF NOT EXISTS freguesia TEXT;
CREATE INDEX IF NOT EXISTS "Cafe_freguesia_status_idx" ON "Cafe" (freguesia, status);
```

Then `prisma generate` and `node --env-file=.env.local scripts/backfill-freguesias.mjs`.

## Code

- `lib/freguesias.ts`
  - `FREGUESIAS`: slug, display name, council ("Lisboa") — the 24 entries, alphabetical, in
    Portuguese (`Ajuda`, `Alcântara`, …, `São Vicente`).
  - `freguesiaForPoint(latitude, longitude): string | null` — ray-casting point-in-polygon over the
    GeoJSON (MultiPolygon aware). Pure, no dependency. Returns `null` outside municipality / in
    holes, which the UI reports as "fora de Lisboa".
- `scripts/backfill-freguesias.mjs` — reads the GeoJSON, walks all cafés, sets `freguesia`, prints
  unmatched rows. Idempotent; safe to re-run after new imports.
- `app/api/admin/suggestions/[id]/route.ts` — set `freguesia` when creating the café on approval.
- Import path for Overture (wherever it runs) — same resolver, same call.
- `lib/conquests.ts`
  - `listConquests(userId)` — one `$queryRaw`:

    ```sql
    SELECT c.freguesia,
           count(*) FILTER (WHERE c.status = 'active') AS total,
           count(DISTINCT c.id) FILTER (
             WHERE r."userId" = $1 AND r.status = 'visible'
           ) AS visited
    FROM "Cafe" c
    LEFT JOIN "Rating" r ON r."cafeId" = c.id
    GROUP BY c.freguesia
    ```

    Merge with `FREGUESIAS` so all 24 cells render even with zero cafés. `conquered = total > 0 &&
    visited >= total`.
  - `getConquest(userId, slug)` for a single-freguesia view, reusing the same query filtered.
- `app/conquistas/page.tsx` — server component, `force-dynamic`, requires session (mirror
  `/admin`'s guard; anonymous → card with "Entrar com Google", `next=/conquistas`).
  Grid of 24 cards: freguesia name, `3 / 7 cafés`, progress bar, `Conquistada` state with distinct
  styling, link to the filtered list for that freguesia.
- Filtering: extend the existing query filter with `?freguesia=benfica` on `/` and `/mapa`
  (`filterCafes` gains an optional `freguesia` field; SQL adds `AND c.freguesia = $n`). Needed so a
  conquered/partially visited card is actionable.
- Navigation: one entry point in `AppNav` (and/or a home chip) — decide with design; not required
  for the first demo.

## UI states

| State | Shows |
|---|---|
| Anonymous | Login card with the 24 freguesias teased, no progress |
| 0 visited | `0 / N cafés`, muted outline |
| Partial | `k / N`, progress bar, remaining count |
| Conquered | `Conquistada` badge, accent fill, timestamp not needed (derived) |
| Freguesia with 0 cafés | `Sem cafés`, never conquerable |
| Café outside any polygon | Grouped as `Fora de Lisboa`, not part of the 24 |

## Tests

- `freguesiaForPoint`: known points per freguesia (Benfica café 38.7447, −9.1799 → `benfica`;
  a point in the Tagus → `null`); every active café resolves in a one-off script assertion.
- `listConquests` merge logic: 24 cells always, `0/0` not conquered, `visited >= total` conquered,
  duplicate ratings by same user count once (unit-test the aggregation seam with fixtures, not the
  DB).
- Route: approving a suggestion within Benfica writes `freguesia = 'benfica'`.

## Build order

1. GeoJSON + `lib/freguesias.ts` + tests (0.5 d)
2. Schema column, backfill script, approval/import wiring (0.5 d)
3. `lib/conquests.ts` + query test (0.25 d)
4. `/conquistas` page + auth guard + states (1 d)
5. `?freguesia=` filter on `/` and `/mapa` (0.5 d)

## Risks

- **Unreachable conquests.** Misericórdia/Arroios may hold dozens of cafés; "visit every café" can
  be a multi-month goal. Accept for v1 (it is the requested rule); if it stalls, add a per-freguesia
  threshold (e.g. "≥ 80% visited") behind the same data, no schema change.
- **Data drift in boundaries.** CAOP versions differ slightly; pin the file version in the docstring
  and re-run the backfill if it changes.
- **New cafés silently un-conquer a freguesia.** That is correct behavior; the card should read
  "Conquistada" only while it is true, and show `k / N` immediately after.
- **Import coverage.** If the Overture import later adds cafés outside Lisbon (e.g. Almada), they
  must land in `Fora de Lisboa`, not break the 24-cell grid.

## Out of scope

- Global/leaderboard conquests, badges, sharing.
- Notifications, streaks, points.
- Conquering districts beyond Lisbon.
- Storing historical conquest events.
