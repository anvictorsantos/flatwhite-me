# ADR 0003 — Café directory from Overture Maps, MapLibre map

## Status

Accepted — 2026-11-09. Facts verified 2026-11-09 against Overture release `2026-10-21.0`.

## Context

The app needs a café directory it can store, query, join to ratings and render as indexable pages. Google Places cannot be persisted (see ADR 0005). OpenStreetMap can be stored under ODbL but carries share-alike obligations for derived databases.

Overture Maps publishes a places theme under **CDLA-Permissive 2.0 and Apache 2.0**. The places theme contains no OSM data and no ODbL share-alike. Most sources are CDLA-Permissive 2.0; Foursquare-derived rows are Apache 2.0 (their `NOTICE.txt` must be preserved if the dataset is redistributed); AllThePlaces rows are CC0-1.0. CDLA-Permissive requires making the licence text available when sharing the data; it does not require an on-map credit.

The map must render our own ranking pins over a basemap. Google Maps is excluded by the same ADR. MapLibre GL JS with an OpenStreetMap-derived vector style is the default.

## Decision

- Pin Overture release `2026-10-21.0` (schema v2.0.0), refresh monthly. S3 path: `s3://overturemaps-us-west-2/release/<release>/theme=places/type=place/*.parquet`. Query with DuckDB over S3; files are retained for at most 60 days, so imports must not depend on old releases.
- Filter the Lisbon municipality bounding box and `taxonomy.primary IN ('cafe', 'coffee_shop')`. `cafeteria` and `internet_cafe` are out of scope in v1. A central Lisbon bbox `(-9.23, 38.68, -9.09, 38.80)` returns 1,281 café/coffee-shop candidates from 49,348 places — order of magnitude low thousands.
- Store Overture place id, source, name, normalized name, address, coordinates, raw `operating_status`, specialty flag and import timestamps.
- Treat Overture `operating_status` as **unknown** when null. In the Lisbon sample it is null for 98.3% of all places and for every café row, so it cannot detect closures. `permanently_closed` only queues a café for admin review; nothing closes automatically.
- Refresh monthly with an idempotent upsert. Missing cafés become `possibly_closed`; an admin confirms closure. User reports and absence from consecutive imports are the real closure signals.
- Render the map with MapLibre GL JS and the **OpenFreeMap** public instance: `https://tiles.openfreemap.org/styles/liberty`. No key, no account, no documented request cap; production use is allowed and there is no non-commercial clause. The service is donation-funded, single-maintainer and offers no SLA. Keep the style in one config value so swapping to Stadia Starter or self-hosted Protomaps is a one-line change.
- Display the map attribution added by the style: `OpenFreeMap © OpenMapTiles Data from OpenStreetMap`. Cite `© Overture Maps Foundation` on `/about` and the landing footer as good practice. Preserve the Foursquare `NOTICE` if the dataset is ever redistributed.
- User-suggested cafés enter through an admin queue; free text never reaches the public directory directly.

## Consequences

- Café names, addresses and coordinates can be stored and server-rendered, which is what SEO requires.
- No per-request Places cost and no Google caching constraints.
- No Google ratings, photos or live opening hours. Photos and hours are explicitly out of scope in v1.
- Closure detection is our own problem: Overture status is effectively unusable, so it depends on admin review and user reports. The UI needs a "report closed" path, not a promise of live open status.
- Overture category filtering may include places that do not actually serve a flat white; the specialty flag and user reports correct this over time.
- Overture coverage outside central Lisbon is unmeasured; the import spike must report it before launch.
- OpenFreeMap's no-SLA risk is accepted for launch. If the map must stay up during an outage, self-host a Lisbon PMTiles extract (tens of MB at z15) on object storage.
- Monthly imports: a café opened last week may be missing until the next release or a user suggestion.

## Verified Facts

| Fact | Value | Source |
|---|---|---|
| Overture release | `2026-10-21.0`, schema v2.0.0, monthly | Overture release calendar |
| Café filter | `taxonomy.primary IN ('cafe','coffee_shop')` | Overture places schema/guide |
| Central Lisbon count | 1,281 cafés / 49,348 places | Live DuckDB S3 query, 7.2 s |
| Lisbon `operating_status` | 98.3% null; all sampled café rows null | Same query |
| Overture licence | CDLA-Permissive 2.0 + Apache 2.0; no OSM data | Overture places guide |
| OpenFreeMap production | Free, no key, no documented request cap, no commercial restriction | openfreemap.org, ToS |
| OpenFreeMap style | `https://tiles.openfreemap.org/styles/liberty` | OpenFreeMap quick start |
| MapTiler / Stadia free tiers | Non-commercial only | Provider pricing pages |
| Protomaps hosted | Free non-commercial; $14/mo commercial | Protomaps pricing |

## Alternatives Considered

- **OpenStreetMap/Overpass as the sole source.** Rejected as the primary source: ODbL share-alike for derived databases is a heavier obligation than needed. Still a fallback for missing cafés.
- **Foursquare Places API.** Rejected for v1: commercial contract, redistribution limits, no clear free-tier guarantee for a public app.
- **User-generated directory only.** Rejected: cold start would be empty and duplicate-prone.
- **Google Places with live refetch.** Rejected in ADR 0005.
- **MapTiler or Stadia free tier.** Rejected: both forbid commercial use. Stadia Starter at $20/month is the paid fallback if OpenFreeMap's no-SLA risk is unacceptable.
- **Protomaps self-hosted PMTiles.** Viable fallback for vendor independence at roughly $2–7/month for storage and serving; more operational work than a style URL.
