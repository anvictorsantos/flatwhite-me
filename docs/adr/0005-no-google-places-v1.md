# ADR 0005 — No Google Places data in v1

## Status

Accepted — 2026-11-09

## Context

Google Places API (New) was the obvious source for café discovery: names, addresses, coordinates, ratings, price level, opening hours and photos. A terms review on 2026-11-09 against Google's current documentation found constraints that make it a poor fit for a public ranking directory.

Findings, from Google's Places policies, Maps Platform Terms and Service Specific Terms (pages current as of 2026-11-06):

1. **Caching.** Only the place ID may be stored indefinitely. Latitude and longitude may be cached for at most 30 consecutive calendar days. Names, addresses, ratings, price level and opening hours may not be cached; the terms explicitly prohibit copying and saving business names and addresses.
2. **Attribution.** The Google Maps logo (or the text "Google Maps" when space is constrained) is required, with size and clear-space rules, plus any third-party `attributions` returned by the API.
3. **Maps.** Places content may not be displayed on a non-Google map. Using a map means Google Maps JavaScript API or Embed, not MapLibre or Leaflet. Maps Embed is free but offers limited customisation; the JavaScript API bills dynamic map loads.
4. **Photos.** A photo name cannot be cached and can expire; photos must be fetched fresh per render and may not be stored or re-served. Each photo request is billable after a small free allowance.
5. **Pricing.** The former $200 monthly credit is gone. A café details view with name, address, rating and hours falls in Place Details Enterprise (about $20 per 1,000 requests); photos are about $7 per 1,000. The highest SKU in the field mask determines the price.
6. **Product restrictions.** The terms prohibit using Maps Core Services in a "listings or directory service" and prohibit modifying Google's search results. A public café ranking directory, ranking places by our own score, is close to both lines.

Together these mean: café names and addresses could not be stored, so café pages could not be server-rendered or indexed without a paid request per view; the map would have to be Google's; and the product category itself carries legal risk. The app's differentiated value is its own flat-white ratings, not Google's metadata.

## Decision

Do not use Google Places or Google Maps in v1. Use Overture Maps for the stored café directory and MapLibre with an OpenStreetMap-derived basemap, as recorded in ADR 0003. No café photos, no live opening hours, no Google ratings. No runtime Google dependency except Google Sign-In for identity (ADR 0004).

## Consequences

- The directory can be stored, joined to ratings and rendered server-side; SEO and performance are straightforward.
- Zero per-request Places cost and no caching or attribution complexity beyond Overture and OSM.
- The app launches without café photos or opening hours. User-uploaded photos are a `Should` item for v1.1 because they are our content, not Google's.
- Café metadata freshness depends on monthly Overture imports plus user suggestions.
- If Google data is ever reconsidered, it requires a new ADR, a legal review and a redesign of the map and café page caching.

## Re-evaluation Trigger

Revisit this decision only if all of the following hold:

1. Café photos or live opening hours become a validated must-have from users.
2. Overture coverage or freshness proves insufficient after at least three monthly imports.
3. A legal review confirms the directory clause does not bar the intended use.

## Alternatives Considered

- **Google Places with live refetch and Google Maps JS.** Rejected: no stored names means no indexable café pages, cost per view, directory-clause risk.
- **Hybrid: Overture directory plus Google Photos/hours on detail pages.** Rejected: the non-Google-map clause and the no-caching rule still constrain the design, and the two-source attribution adds complexity before launch.
- **OpenStreetMap only.** Rejected as primary: ODbL share-alike is a heavier obligation; Overture is permissive and aggregates more sources.
