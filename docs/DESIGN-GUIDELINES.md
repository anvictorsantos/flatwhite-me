# Flat White Me — Design Guidelines

## Principles

1. **Built for a phone in the sun.** Light background, high contrast, large tap targets. No glassmorphism, no low-contrast grey on grey.
2. **The score is the hero.** One number, one sample size, one date. Everything else supports that.
3. **Honest by design.** Never hide a small sample. "Too few ratings" is a first-class state, not an error.
4. **Local, not corporate.** Portuguese first, warm café palette, plain speech. No growth-hack copy.
5. **Calm interface.** One accent colour, no decorative gradients, no animation that competes with reading.

## Colour Tokens

Light theme only. Define tokens in `app/globals.css` and map them into Tailwind's theme; never use raw hex values in components.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#FAF7F2` | Page background (cream) |
| `--color-surface` | `#FFFFFF` | Cards, sheets, inputs |
| `--color-surface-muted` | `#F1EAE0` | Secondary surfaces, map chrome, chips |
| `--color-text` | `#241A14` | Primary text (espresso) |
| `--color-text-muted` | `#6B5B50` | Secondary text, metadata |
| `--color-border` | `#E3D9CC` | Dividers, input borders |
| `--color-accent` | `#B4532A` | Primary actions, selected states, map pin for ranked cafés (terracotta) |
| `--color-accent-contrast` | `#FFFFFF` | Text on accent |
| `--color-badge` | `#F7E7DA` | Score badge background, first-place tint |
| `--color-badge-ink` | `#9C431F` | Score text on badge |
| `--color-success` | `#2F6B4F` | Positive status text and icons |
| `--color-warning` | `#8A5200` | Caution text and icons |
| `--color-danger` | `#A32A1F` | Destructive actions, errors |
| `--color-focus` | `#2A5FA8` | Focus ring, always visible |

Rules:

- Text on `--color-bg` and `--color-surface` must meet 4.5:1. Muted text must still meet 4.5:1 for body sizes; it is not for decorative use.
- Colour never carries meaning alone. Ranked/unranked, open/closed, error/success always have text or shape.
- No purple, no blue-to-pink gradients, no glow shadows.

## Typography

- **Family:** Inter, variable, self-hosted via `next/font`. Fallback: system UI sans.
- **Scale:** 12, 14, 16, 20, 24, 32, 40 px. Body 16 px minimum.
- **Weights:** 400 body, 500 emphasis and labels, 600 headings and score numerals.
- **Line height:** 1.5 body, 1.2 headings.
- **Numerals:** use tabular numerals for scores and sample counts.
- **Letter spacing:** default; no tracked-out uppercase labels.

## Layout

- Mobile gutter 16 px; desktop max width 1120 px, centred.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px. Use tokens, not arbitrary values.
- Primary mobile layout: list first, map behind a "Mapa" tab or a collapsible panel. Never force the map to load before the list content.
- Café page: score block, then dimensions, then price and milk facts, then notes, then map link.
- Bottom sheet for rating: full-height-friendly, scrollable, sticky submit button above the safe area.
- Safe-area insets respected on iOS.

## Shape and Elevation

- Radius: 8 px inputs and buttons, 16 px cards and sheets, 999 px chips and score badges.
- Elevation: one subtle shadow for sheets and floating controls; cards use borders, not shadows.
- Dividers 1 px `--color-border`.

## Components

| Component | Spec |
|---|---|
| `ScoreBadge` | Number, one decimal, tabular; sample size beneath; states Ranked / Too few ratings / Unrated |
| `DimensionBar` | Labelled 1–5 bar with numeric value; colour maps to value but value text is always present |
| `CafeRow` | Name, neighbourhood, score badge, distance when available, specialty tag, want-to-try toggle |
| `CafePin` | Circle with score for ranked, hollow square for too few, small dot for unrated; selected state scales 1.15 |
| `RatingModal` | Four 1–5 button groups, price input in EUR, milk type and size segmented controls, visit date, note with counter, submit |
| `FilterChips` | Horizontal scroll, 44 px tall, selected uses accent fill |
| `EmptyState` | One sentence, one action; no illustrations of coffee cups |
| `Toast` | Bottom, 4 s, text only plus icon |
| `ConfirmDialog` | Destructive actions only; requires explicit confirm button label |

States required for every interactive component: default, hover (pointer devices only), focus-visible, active, disabled, loading, error.

## Icons and Imagery

- `lucide-react` only. 20 px default, 24 px in navigation.
- No emoji as icons or labels.
- No stock photography, no generated hero images in v1. Typography and the ranking carry the page.
- Map attribution uses the required text/logo as supplied; never restyle it.

## Motion

- 150 ms ease-out for state changes, 200 ms for sheets.
- No parallax, no scroll-triggered animation, no skeleton shimmer beyond a simple pulse.
- Respect `prefers-reduced-motion`: remove transforms and shorten transitions.
- Score changes on load do not animate; numbers must be readable immediately.

## Accessibility

- WCAG 2.2 AA minimum.
- Touch targets ≥44×44 px, with ≥8 px spacing.
- Visible focus ring on every interactive element; never `outline: none` without replacement.
- Semantic landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page.
- Forms: labels always visible, errors linked with `aria-describedby`, no placeholder-only labels.
- Map: provide a list alternative with identical content and controls; pins are keyboard reachable with accessible names.
- All text zoomable to 200% without loss of function.
- Automated axe checks run in Playwright on the list, café page and rating modal.

## Copy and Tone

- Portuguese (PT-PT) first, English second. No Brazilian forms.
- Plain, specific, local: "Ainda sem avaliações" not "Oops! Nothing here yet ✨".
- Never claim "best" without the ranking behind it.
- Numbers are formatted with a decimal comma in PT (`4,3`) and a decimal point in EN (`4.3`).
- Prices in euros, `2,50 €` in PT and `€2.50` in EN.
- Dates in `9 nov 2026` style in PT, `9 Nov 2026` in EN.

## What Not to Do

- No purple, gradients, glassmorphism or neon.
- No dark dashboard aesthetic.
- No arbitrary Tailwind values (`text-[#123456]`, `p-[13px]`).
- No colour-only ranking or status.
- No fake precision: never show a score without its sample size.
- No stock café photography or generated images in v1.
- No infinite scroll that hides the ranking's end.
- No modal-on-modal.

## File Locations

| Concern | Location |
|---|---|
| Tokens | `app/globals.css` |
| Tailwind theme mapping | `tailwind.config.ts` |
| Fonts | `app/fonts.ts` via `next/font` |
| Primitives | `components/ui/` |
| Domain components | `components/cafe/`, `components/rating/`, `components/map/` |
| Page composition | `app/**/page.tsx` |
| Design fixtures | `tests/e2e/fixtures/design/` |
