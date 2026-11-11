# Flat White Me — Brief

## Problem

Lisbon has no trustworthy answer to "where do I get the best flat white?" Google Maps stars mix coffee, pastries and service. Editorial "best coffee" lists are static, city-wide and rarely updated. What a flat white drinker wants is specific: espresso balance, milk texture, temperature and value, at cafés near them, with an honest sample size behind the number.

## Audience

- **Lisbon locals** who drink flat whites and want a short list, not a directory.
- **Expats and visitors** searching in English for "best flat white Lisbon".
- **Raters** — people willing to spend 40 seconds scoring a drink to improve the town's ranking.

## Solution

A public, phone-first web app where each visit is scored on a four-dimension scorecard. Ratings aggregate into a transparent, recency-weighted ranking of cafés in Lisbon municipality. Browse anonymously; sign in with Google to rate and save places.

## Goals

1. Make the Lisbon flat white ranking the most useful answer to the question, in both Portuguese and English.
2. Keep the score honest: real visits only, visible sample size, recency decay, no editorial override.
3. Make rating a drink possible in under a minute, one-handed, at the counter.

## Success Metrics (MVP, 3 months after public launch)

| Metric | Target |
|---|---|
| Cafés with at least 3 ratings | 100 |
| Ratings submitted | 500 |
| Signed-in users who rated | 100 |
| Month-over-month returning users | 15% |
| Search visibility | At least one café page ranking for "flat white Lisbon" |

## Non-Goals (v1)

- Social feed, follows, comments, likes.
- Photo uploads, menus, roaster or bean tracking.
- Opening hours, Google Places data, café photos.
- Push notifications, check-ins, loyalty, gamification.
- Monetization, ads, sponsored placement.
- Native apps, offline data, dark mode.
- Third-party analytics, marketing email.
- User profiles or settings pages beyond a nickname and account deletion.

## Constraints

- **Café directory:** Overture Maps Places (CDLA-Permissive 2.0 and Apache 2.0; no OSM data, no share-alike), imported and stored. Basemap from OpenFreeMap/OpenStreetMap, attribution on the map.
- **No Google Places content** in v1. Caching rules, attribution and the "listings or directory service" clause make it a poor fit; see ADR 0005.
- **Data residency:** EU hosting (Render + Neon, EU region).
- **Cost:** free tiers only. No paid API dependency in the request path except Google identity.
- **No fabricated ratings.** Seed data must be real ratings by real accounts.
- **Languages:** Portuguese (PT-PT) default, English toggle.

## Decisions at a Glance

| Area | Decision |
|---|---|
| Town | Lisbon municipality, single active town |
| Directory | Overture Maps import, monthly refresh, no Google Places |
| Map | MapLibre GL JS with OpenFreeMap tiles (OpenStreetMap data) |
| Scorecard | Taste 40, milk texture 30, temperature 10, value 20 |
| Ranking | Recency-weighted mean, 12-month window, 6-month half-life |
| Minimum sample | 3 ratings to be ranked |
| Identity | Google Sign-In, opaque session cookie |
| Access | Anonymous browse; sign-in to rate, save, suggest |
| Stack | Next.js 16, React 19, Postgres 16, Prisma 7, Tailwind 4 |
| Hosting | Render web service + Neon Postgres (EU) |
| Analytics | None; metrics derived from the database |
| Brand | Flat White Me, flatwhite.me |

## Open Questions

- Tile provider settled on OpenFreeMap; self-hosted Protomaps is the fallback if its no-SLA risk becomes unacceptable.
- Overture measures ~1,300 café candidates in the central Lisbon bbox; coverage outside the centre and reliable closure detection still need the import spike.
- Whether displaying a derived ranking from Overture data triggers any share-alike obligation — Overture is permissive; OSM tiles are attribution-only. Legal review only if distribution of the dataset itself is ever planned.
