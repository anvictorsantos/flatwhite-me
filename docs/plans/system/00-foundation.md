# System 00 — Foundation

## Outcome

A clickable shell at `system/` that runs from a static file server, with the design tokens, shared components, routing and example data every screen builds on.

## Scope

- `system/index.html`, `styles.css`, `app.js`, `data.js`.
- Tokens from `docs/DESIGN-GUIDELINES.md` (cream, espresso, terracotta), 16 px gutter, 480 px phone frame.
- Shared pieces: app bar, segmented control, buttons, chips, cards, score block, bookmark toggle, bottom tab bar, sheet container.
- Hash routes registered for every screen in the Figma set, each rendering a placeholder until its own change lands.
- Example data for the cafés, scores and my-list content shown in the Figma screens.

## Out of scope

Production app scaffold, database, auth, real map tiles, analytics.

## Acceptance check

- `npx serve system` loads without console errors at 390 px width.
- Bottom tabs navigate; back works; bookmark toggles persist across reloads.
- Tokens contain no raw hex outside `:root`.
- `README.md` states the system exists and uses example data.

## Screens covered

No product screen. Shell only.
