# Flat White Me — Data Model

Postgres 16, Prisma 7. All timestamps in UTC. Money in integer euro cents. Visit dates are calendar dates without time.

## Entities

### User

| Field | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `googleSub` | text unique | Google account subject |
| `email` | text unique | Private, never rendered publicly |
| `displayName` | text | Google first name by default |
| `nickname` | text nullable | Public name, 2–40 chars |
| `avatarUrl` | text nullable | Used only as a fallback initial source |
| `role` | enum `user` / `admin` | Admin also requires an allowlisted email |
| `createdAt` | timestamptz | |
| `deletedAt` | timestamptz nullable | Set on account deletion |

Deletion: `googleSub`, `email`, `displayName`, `avatarUrl` set null; `deletedAt` set; sessions removed; notes deleted; ratings anonymised.

### Session

| Field | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `userId` | uuid fk | |
| `tokenHash` | text unique | SHA-256 of the opaque cookie token |
| `expiresAt` | timestamptz | 30 days |
| `createdAt` | timestamptz | |
| `lastSeenAt` | timestamptz | Updated at most once per hour |

### Cafe

| Field | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `overtureId` | text unique nullable | Null for user-suggested cafés |
| `source` | enum `overture` / `user` | |
| `slug` | text unique | Immutable after creation |
| `name` | text | |
| `normalizedName` | text | Lowercased, accent-stripped, punctuation-collapsed |
| `addressLine` | text nullable | |
| `neighborhood` | text nullable | Derived from coordinates or admin entry |
| `latitude` | double precision | |
| `longitude` | double precision | |
| `specialty` | boolean | Informational only |
| `status` | enum `active` / `possibly_closed` / `closed` / `hidden` | Only `active` is public |
| `overtureStatus` | enum `open` / `temporarily_closed` / `permanently_closed` / `unknown` | Raw Overture value; null in source maps to `unknown` |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |
| `lastImportedAt` | timestamptz nullable | |

Indexes: `slug` unique, `overtureId` unique, `(status, latitude, longitude)`, `lower(name)` for search.

### CafeSuggestion

| Field | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `userId` | uuid fk | Suggesting user |
| `name` | text | |
| `addressLine` | text nullable | |
| `latitude` | double precision nullable | |
| `longitude` | double precision nullable | |
| `note` | text nullable | Admin-only |
| `status` | enum `pending` / `approved` / `rejected` / `merged` | |
| `matchedCafeId` | uuid fk nullable | Set on merge |
| `createdAt` | timestamptz | |
| `reviewedAt` | timestamptz nullable | |
| `reviewedBy` | uuid fk nullable | Admin user |

### Rating

| Field | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `cafeId` | uuid fk | |
| `userId` | uuid fk nullable | Null after account deletion |
| `taste` | smallint | 1–5 |
| `milkTexture` | smallint | 1–5 |
| `temperature` | smallint | 1–5 |
| `value` | smallint | 1–5 |
| `priceCents` | integer | 0–2000 |
| `currency` | char(3) | `EUR` in v1 |
| `milkType` | enum `whole` / `oat` / `lactose_free` / `other` | |
| `size` | enum `regular` / `large` | |
| `visitedOn` | date | Not future, not older than 5 years |
| `note` | text nullable | ≤280 chars; locks 30 days after creation |
| `status` | enum `visible` / `hidden` | Hidden excluded from scores |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

Constraints:

- Unique `(userId, cafeId)` where `userId is not null` — one live rating per user per café.
- Check constraints on all four scores, price and note length.
- Index `(cafeId, status, visitedOn)`.
- Index `(userId, createdAt)` for the daily cap.

### RatingRevision

| Field | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `ratingId` | uuid fk | |
| `snapshot` | jsonb | Previous rating values |
| `createdAt` | timestamptz | |

Only written when a rating is overwritten by a new visit. Never edited.

### RatingReport

| Field | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `ratingId` | uuid fk | |
| `reporterUserId` | uuid fk | |
| `reason` | enum `spam` / `offensive` / `wrong_place` / `other` | |
| `status` | enum `open` / `actioned` / `dismissed` | |
| `createdAt` | timestamptz | |
| `resolvedAt` | timestamptz nullable | |

Unique `(ratingId, reporterUserId)`.

### WantToTry

| Field | Type | Notes |
|---|---|---|
| `userId` | uuid fk | |
| `cafeId` | uuid fk | |
| `createdAt` | timestamptz | |

Primary key `(userId, cafeId)`.

### AdminAction

| Field | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `actorUserId` | uuid fk | |
| `action` | text | e.g. `suggestion.approve`, `rating.hide`, `cafe.close` |
| `targetType` | text | `cafe`, `rating`, `suggestion` |
| `targetId` | uuid | |
| `createdAt` | timestamptz | |

Append-only.

## Ranking View

`cafe_scores` is a materialized view. The plain view took 588 ms at 50,000 ratings, above the 200 ms budget; the materialized list query measures 49 ms. It is refreshed concurrently after every rating write and admin hide, so scores are never stale between a rating and the next read. No application-memory cache.

```sql
-- dimension weights: taste .40, texture .30, temperature .10, value .20
-- visit weight halves every 182.5 days, measured from visited_on
create materialized view cafe_scores as
select
  c.id as cafe_id,
  count(r.id) as sample_size,
  max(r.visited_on) as last_visited_on,
  sum(w.weight * (
    .40 * r.taste + .30 * r.milk_texture + .10 * r.temperature + .20 * r.value
  )) / sum(w.weight) as score
from cafe c
join rating r on r.cafe_id = c.id
  and r.status = 'visible'
  and r.visited_on >= current_date - interval '365 days'
cross join lateral (
  select power(0.5, (current_date - r.visited_on)::numeric / 182.5) as weight
) w
where c.status = 'active'
group by c.id;

create unique index cafe_scores_cafe_id_key on cafe_scores (cafe_id);
```

Application rules:

- `sample_size >= 3` → Ranked; `1–2` → Too few ratings; `0` → Unrated.
- Tie-break in SQL by `sample_size desc`, then median price paid.
- Median price computed separately with `percentile_cont(0.5)`.
- Materialized view refreshed with `REFRESH MATERIALIZED VIEW CONCURRENTLY` after each rating write and admin hide. If refresh cost grows past the request budget, move to a scheduled refresh and accept bounded staleness; do not cache in application memory.

## Import Rules

- Upsert key: `overtureId`.
- Never overwrite `specialty`, `status = closed|hidden`, or any rating data.
- Missing from snapshot → `possibly_closed`; admin decides.
- Overture `operating_status` null → `unknown`; `permanently_closed` → `possibly_closed` for review; never auto-close.
- Slug collision → append `-2`, `-3`; never change an existing slug.
- Import reports counts: inserted, updated, possibly closed, skipped, duplicates.

## Invariants

1. A rating always belongs to an existing café and an existing or deleted user.
2. Hidden ratings never contribute to scores or public counts.
3. `visitedOn` never in the future.
4. Deleted accounts leave anonymised ratings; their notes are gone.
5. Café slugs and Overture ids never change.
6. Only the author edits a rating or note; only admin hides it.
7. Admin actions are append-only.
