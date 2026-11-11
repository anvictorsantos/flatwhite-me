# System 02 — Mapa de Lisboa

Figma: **02 · Mapa de Lisboa**, plus **Mapa · 4,5+**, **Mapa · 4,6+**, **Mapa · Lume**.

## Outcome

Map view of the same dataset, with illustrative streets, score pins, and the same café card as the list.

## Scope

- Header and hero (`Lisboa, café a café.`), Lista/Mapa switch with Mapa selected.
- Filter chips reused from the list.
- Illustrative map: cream blocks, white streets, labels (Príncipe Real, Arroios, Alfama, Santos, Tejo), caption `Mapa ilustrativo`.
- Pins: filled terracotta circle with score for ranked cafés; hollow square for too few ratings; small dot for unrated; selected pin scales and shows its café card below.
- The same filtered states as the list: minimum score and search term.
- Card below the map links to the café detail.

## Out of scope

Real tiles, geolocation, clustering, drag gestures. The map is an SVG figure, not a map library.

## Acceptance check

- Pins are buttons with an accessible name (`Lume Coffee, 4,6`).
- Selecting a pin updates the card and keeps keyboard focus visible.
- Applying a filter removes excluded pins and updates the caption.
- Attribution line for the simulated map is visible.
