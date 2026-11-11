# Glossary — Flat White Me

Canonical vocabulary. Use these terms in code, UI copy, tests and docs. Do not invent synonyms.

## Place and Product

- **Flat White Me** — the product and website, `flatwhite.me`.
- **Town** — the single active city, Lisbon municipality. The data model allows more towns; the UI does not.
- **Café** — a place that serves espresso drinks and may serve a flat white. Includes specialty shops, pastelarias, chains and restaurants.
- **Specialty** — an informational tag for specialty coffee shops. It never affects ranking.
- **Directory** — the stored set of cafés imported from Overture Maps plus admin-approved suggestions.
- **Suggestion** — a user-submitted missing café awaiting admin approval.
- **Duplicate** — a café or suggestion that matches an existing café by Overture id, or by normalized name within 100 m.

## Drink and Visit

- **Flat white** — the drink being scored: espresso with steamed milk and a thin layer of microfoam.
- **Visit** — one occasion on which a user drank a flat white at a café, recorded by a date.
- **Rater** — a signed-in user who submits ratings.
- **Administrator (admin)** — a user whose email is in `ADMIN_EMAILS`.

## Rating

- **Scorecard** — the four scored dimensions submitted with a visit.
- **Dimension** — taste, milk texture, temperature or value, each scored 1–5.
- **Visit score** — weighted sum of the four dimensions: taste 0.40, milk texture 0.30, temperature 0.10, value 0.20.
- **Rating** — one user's live entry for one café. Includes the scorecard and visit metadata.
- **Rating history** — append-only snapshots of a rating before it is overwritten by a new visit.
- **Metadata** — non-scored fields: price paid, milk type, size, visit date, optional note.
- **Note** — optional public text of at most 280 characters attached to a rating. Locks 30 days after creation.
- **Hidden rating** — a rating removed from public view by an admin. Excluded from scores and counts.
- **Report** — a user flag on a rating or note, resolved by an admin.

## Ranking

- **Café score** — recency-weighted mean of visible visit scores from the last 365 days.
- **Recency weight** — `0.5 ^ (ageDays / 182.5)`, so a visit's influence halves every 182.5 days.
- **Sample size** — number of visible ratings inside the 365-day window.
- **Ranked** — a café with at least 3 ratings in the window; eligible for the ranked list.
- **Too few ratings** — a café with 1 or 2 ratings in the window; shown separately, never in the ranked list.
- **Unrated** — a café with no ratings in the window; shown on the map and in the unrated section.
- **Last visited** — the most recent visit date among visible ratings. Displayed with every score.
- **Top 10** — the ranked top ten on the landing page.
- **Paid placement** — never exists. Nothing in the ranking can be bought.

## Account and Lists

- **Signed-in user** — a person authenticated through Google Sign-In.
- **Nickname** — the public display name chosen by a user. Defaults to the Google first name.
- **Want to try** — a private per-user list of cafés to visit.
- **Account deletion** — removal of profile data and notes, with ratings anonymised.

## Data Sources

- **Overture** — Overture Maps Places, the directory source, CDLA-Permissive 2.0.
- **Overture id** — the stable identifier of a place in Overture. Upsert key for imports.
- **Import** — the monthly idempotent refresh of the directory from an Overture release.
- **Possibly closed** — a café absent from the latest import; not public until an admin confirms.
- **Overture status** — raw operating status from Overture: open, temporarily closed, permanently closed, or unknown. Null in the source maps to unknown. It never closes a café automatically.
- **OSM** — OpenStreetMap, the basemap data behind the map tiles, ODbL.
- **MapLibre** — the map rendering library used instead of Google Maps.
