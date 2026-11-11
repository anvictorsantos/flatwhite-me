# Flat White Me — Responsive Implementation Plan

Status: proposed 2026-11-10. All 54 Figma exports reviewed: `FlatWhiteMe/` (54 PNGs, not 49).
All product screens are **1170×2532 = 390×844 @3x**, phone only. Sheet exports are 1314 px wide
including shadow, so the sheet itself spans the full 390 pt; heights run 528–828 pt.
There are no tablet or desktop frames; the tablet/desktop columns below are the implementation
contract and need design sign-off.

**Build order: desktop → tablet → mobile.** The desktop composition is built first and is the
reference implementation; tablet and phone are reductions of the same component tree. Source
order stays semantic and mobile-readable, and breakpoint changes stay in CSS; this is a build
and review order, not permission to duplicate markup.

## Outcome

Every screen is built once, matching the Figma phone frames at 390 px and working from 320 px
up. Tablet and desktop add space, columns and persistent panels without adding content, routes
or actions. A user switching devices sees the same screens, copy, states and controls.

The phone is the fidelity gate. The desktop is the first implementation pass and must never
introduce content or actions the phone does not have.

## Sources of truth

| Concern | Document |
|---|---|
| Screen scope and states | `docs/plans/system/*.md` |
| Phone layout | `FlatWhiteMe/*.png` (390×844) |
| Tokens, type, components, accessibility | `docs/DESIGN-GUIDELINES.md` |
| Landing structure | `docs/LANDING-PAGE-SPEC.md` |
| Routes and requirements | `docs/PRD.md` |
| Stack and conventions | `docs/adr/0001-stack.md`, `AGENTS.md` |

## What the Figma frames confirm

- **One phone width, no desktop composition.** The frame set is a single 390×844 device. Desktop
  is not designed, only implied by the layout guidelines.
- **One structure per screen.** The 12 café frames and 12 rating frames differ only in data;
  build one component per screen, driven by props. No per-café layout variants.
- **Mobile shell.** Header bar with wordmark + Lisboa pill (`01`, `02`, `09`), or back + title +
  search (café, list, suggest, info, admin). Fixed bottom tab bar: Explorar, A minha lista,
  Sobre, with the current tab in a muted pill. Content scrolls under the tab bar.
- **Sheets.** Rating and filters are full-width bottom sheets spanning the 390 pt screen,
  828 pt tall, with a sticky footer button: `Guardar avaliação`, `Mostrar cafés`. Small
  confirmations (`11`, `12`, `13`, denúncia, localização) are 528–648 pt tall, same pattern.
- **Controls.** Five 1–5 buttons per dimension; segmented controls for milk
  (Vaca / Aveia / Outro), size (160 / 200 ml), price band, specialty, saved-only and radius
  (1 km / 3 km / Lisboa). Every control shows selection with fill plus `aria-pressed`.
- **Rating frame is shorter than the product.** It shows only dimensions and price; PRD 4.3
  adds milk type, size, visit date and note. The production sheet scrolls with its footer
  pinned, and offers the four PRD milk types, not the frame's three.
- **Cards.** Name, area, score `4,6`, green `No ranking`, sample count with last visit,
  specialty/price, full-width secondary action (`Avaliar este café` / `Remover dos guardados`
  / `Quero experimentar`), bookmark button top-right.
- **Every state is framed, not inferred.** Ranking status has three card and café variants:
  `No ranking` (green, ≥3), `Poucas avaliações` (amber, 1–2), `Ainda sem avaliações` (green,
  0, em-dash score, `A primeira visita conta` and a price-unknown card). Saved toggle has
  `Quero experimentar` and `Guardado na minha lista`. Empty list keeps `As minhas avaliações`
  below the empty saved block. Result headings are `Pesquisa: Lume` and
  `Resultados filtrados` with a count. Admin counters appear at 0/0, 1/1 and with approved or
  hidden cards.
- **Rating default state.** Every rating frame opens with 4 selected in all four groups; the
  Clara frame shows 5 in taste. There is no framed unselected state. Production starts empty
  and disables `Guardar avaliação` until all four are chosen.

### Frame inventory (54)

| Group | Frames | What varies |
|---|---|---|
| Explorar + Resultados | 4 | default, search, 4,5+, 4,6+ |
| Mapa | 4 | default, 4,5+, 4,6+, search |
| Café | 12 | café data, ranking status, saved toggle |
| Rating + saved confirmation | 13 | café data, selected taste |
| A minha lista | 4 | two saved cafés, one Lume, one Pátio, empty |
| Filtros | 4 | default, 4,5+, 4,6+, search |
| Sugerir + sent | 2 | form, confirmation |
| Como funciona, Privacidade, Top 10 | 3 | content only |
| Moderação | 4 | pending, approved, hidden, resolved |
| Entrar, localização, denúncia | 3 | sheet only |
| Reusable controls | 1 | all control states |

Prototype-only chrome that must not ship: `Protótipo`, `Dados de exemplo`, `demonstração`,
`Mapa ilustrativo`, the simulated Google sign-in copy, and the search icon in sheet headers.
The production map needs real OpenFreeMap/OSM attribution.

## Implementation status

Built 2026-11-11 in the new Next.js app in this repository:

- Desktop shell with 16 rem sidebar; tablet and phone shell with bottom tabs; safe-area padding;
  `viewport-fit=cover`; 44 px map-pin hit areas.
- Explore list with search and filters, real MapLibre map, café page, rating sheet UI, top,
  landing and informational pages, all reading the 1,231 real cafés from Postgres.
- No horizontal overflow at 320, 390, 768, 1024 and 1280 px.

Not built yet: Google sign-in, rating and saved-list persistence, suggestion form, admin,
moderation sheets, SEO metadata, PWA assets, axe and Lighthouse checks.

## Breakpoints and containers

Tailwind defaults. Build and review go 1280 → 768 → 390; classes stay base-first with
min-width additions, so the phone remains the smallest source layer and no `max-*` overrides
are needed.

| Prefix | Min width | Layout role |
|---|---|---|
| base | 0 | One column, 16 px gutter, bottom tabs, bottom sheets |
| `sm` | 640 px | Centred dialogs, 2-column cards where useful |
| `md` | 768 px | Two-column lists, wider reading measure |
| `lg` | 1024 px | Sidebar navigation, café and map split panels |
| `xl` | 1280 px | Explore list plus map aside |

- App container `max-w-app` (1120 px), centred, with `px-4 sm:px-6`.
- Reading pages `max-w-reading` (720 px).
- No layout change may depend on JavaScript. Media queries and CSS only; the sole exception is
  MapLibre, which must still render inside its container at every width.
- Reference widths for checks: 320, 390 (Figma), 480, 768, 1024, 1280, 1440.

## Shell contract

| Width | Navigation | Header |
|---|---|---|
| < `lg` | Fixed bottom tabs, safe-area padded, content `pb` ≥ tab bar + 16 px | `AppBar` sticky, 64 px, back/title/action |
| ≥ `lg` | Persistent 16 rem sidebar with wordmark, nav, Lisboa chip | Page-level header inside content; no duplicated wordmark |

- One `nav` landmark per breakpoint, not two visible at once. Hidden navigation uses
  `display: none`, not opacity, so it leaves the tab order.
- A skip link to `main` precedes the sidebar on desktop.
- Bottom tabs and sheet footers respect `env(safe-area-inset-*)`; the viewport sets
  `viewport-fit=cover`.
- Active navigation uses `aria-current="page"`; hover states only under
  `@media (hover: hover) and (pointer: fine)`.
- Content must never be clipped by the fixed tab bar. The Figma frames show cards cut by the
  tab bar mid-scroll; production adds `scroll-padding-bottom` and page bottom padding.

## Screen matrix

All rows keep identical content and actions at every width. Desktop additions are extrapolated
from the guidelines, not taken from Figma.

| Screen | Mobile (390) | Tablet | Desktop |
|---|---|---|---|
| Explorar `/` | Wordmark header; hero; search; Lista/Mapa; chips; ranking header; one-column cards | Cards in 2 columns | ≥ `xl`: list plus sticky map aside (400 px); 1120 px container |
| Mapa `/mapa` | Wordmark header; Lista/Mapa; chips; map; selected café card below | Map 520 px, card below | ≥ `lg`: map plus 380 px sticky panel with card and in-view list |
| Café `/cafe/[slug]` | Back header; eyebrow; h1; score card; evaluate + want-to-try buttons; four bars; notes | One column, wider measure | ≥ `lg`: main column plus 360 px sticky action panel |
| Rating sheet | Bottom sheet, 828 pt max, sticky `Guardar avaliação` | Centred dialog, 28 rem | Same centred dialog |
| Filtros | Bottom sheet, 828 pt max, sticky `Mostrar cafés` | Centred dialog | Same centred dialog |
| Confirmation sheets | Bottom sheet, content height, sticky `Concluir` / `Voltar a explorar` | Centred dialog | Same centred dialog |
| A minha lista `/lista` | Back header; greeting; Guardados/Avaliações tabs; one-column cards | Cards in 2 columns | Cards in 2 columns, 1120 px max |
| Sugerir `/sugerir` | Back header; one-column form | Centred 720 px form | Same |
| Sobre, Como funciona, Privacidade, Contacto | Back header; one-column reading | 720 px reading column | Same |
| Top `/top` | Wordmark header; CTA; one-column ranking cards | 2-column cards | 2-column cards, 1120 px max |
| Landing `/best-flat-white-lisbon` | One column; Top 10 rows ≥72 px; sticky CTA after hero | 2-column Top 10 | Top 10 and "Como funciona" side by side |
| Admin `/admin` | Back header; 2-up counters; one-column queues | 2-column queues | Counters capped at 28 rem; queues 2 columns |

Tricky states to design at every width:

- Empty, filtered and no-result states occupy the same column structure as content.
- Rating confirmation and sign-in gate use the same sheet/dialog behaviour as rating.
- Long café names, `4,6` scores and decimal commas must not overflow at 320 px or 200% zoom.
- Map attribution stays visible at every breakpoint and in both map layouts.
- Admin keeps the bottom nav on phone, as framed, but it is not a public product tab.

## Component rules

- **`CafeRow` / `CafeCard`** — one DOM structure. Mobile matches the Figma card: name/area and
  bookmark on top, score and sample block, specialty/price, full-width action. Desktop may
  place score at the end of the row. No duplicated card variant per breakpoint.
- **`ScoreBadge`** — fixed numeral width with tabular figures; sample size always below.
- **`Sheet`** — one `<dialog>`. Bottom-sheet classes at base, centred classes at `sm`.
  Native focus trap, Escape, backdrop click. Footer is sticky and padded by safe area.
  Height uses `dvh`, never `vh`. Header is close + title; do not render the Figma search icon
  unless search is a real action in that sheet.
- **Buttons, chips, inputs** — `min-h-11`, 44×44 px minimum, 8 px spacing. Visual map pins may
  stay small inside a 44 px button hit area.
- **Tabs and segmented controls** — full-width on mobile, intrinsic width on desktop; selected
  state uses `aria-pressed` or `aria-current`, never colour alone.
- **Map** — explicit height per breakpoint (420 / 520 / 640 px), `resize()` on container
  change; production MapLibre replaces the illustrative SVG; list remains the accessible
  alternative; no geolocation prompt on load.
- **Forms** — single column at all widths; labels above fields; errors linked. Tablet and
  desktop do not turn a two-field form into multiple columns.
- **Typography** — no breakpoint-specific copy. `display` may grow at `sm`; body stays 16 px.

## Build order: desktop → tablet → mobile

Every phase uses the same three passes. A phase is not done until the third pass passes.

| Pass | Width | What is built | Done when |
|---|---|---|---|
| D | 1280–1440 | Full desktop composition: sidebar, 1120 container, split panels, sticky asides | All content and states present; no empty desktop regions |
| T | 768–1023 | Remove asides, collapse to 2-column lists, bottom tabs replace sidebar | No orphaned columns; controls keep 44 px |
| M | 390 (then 320) | One column, bottom tabs, bottom sheets, sticky footer | Matches the Figma frame; no horizontal scroll at 320 |

Rules for the passes:

- Build the desktop tree first, then remove with CSS. Never maintain a desktop and a mobile
  component in parallel.
- The mobile pass reintroduces no feature; if desktop shows it, mobile shows it, and the
  reverse.
- Desktop-only affordances are limited to layout and hover. Keyboard and focus behaviour is
  identical at every width.
- The map is the one component that needs explicit height and `resize()` per pass; everything
  else is layout-only.

## Implementation sequence

One branch and one PR per phase. Each phase runs the desktop, tablet and mobile passes; a phase
is not done while any width is broken.

### 1. Foundation: tokens, viewport, shell

`app/globals.css`, `app/layout.tsx`, `components/AppNav.tsx`, `components/AppBar.tsx`.

- Token layer and spacing from `DESIGN-GUIDELINES.md`; no raw values in components.
- `viewportFit: 'cover'`; safe-area padding on bottom tabs and sticky sheet footers.
- Bottom tabs < `lg`; sidebar ≥ `lg`; skip link; one visible nav at a time.
- Page bottom padding and `scroll-padding-bottom` clear the tab bar.
- Desktop header does not repeat the sidebar wordmark.

**Acceptance:** 390 px matches Figma shell; 320 and 1440 px show one navigation; no horizontal
scroll; iOS home indicator does not cover tabs or submit buttons.

### 2. Shared primitives

`components/Sheet.tsx`, `CafeCard.tsx`, `Icon.tsx`, `components/ui/*`.

- Sheet bottom/centre behaviour, sticky footer, focus and Escape.
- 44 px hit areas for every control, including map pins and icon-only buttons.
- Hover states behind a pointer media query; focus-visible everywhere.
- Card and chip layouts that stack on phone and align on desktop from the same markup.

**Acceptance:** keyboard-only rating and filter flows work at 390 and 1280 px; axe reports no
critical or serious issues.

### 3. Explorar and Filtros

`components/ExploreView.tsx`, `components/FiltersSheet.tsx`.

- One column at base; 2-column cards at `md`; map aside only at `xl`.
- Filter sheet applies and closes; active count reflected in the chip at every width.
- Empty, search, filtered and no-result states hold their column structure.
- Replace prototype copy in the sheet with production explanation.

**Acceptance:** typing narrows the list on phone and desktop; cards remain readable at 320 px;
no score appears without sample size and last visit.

### 4. Mapa

`components/MapView.tsx`, `components/MapCanvas.tsx`.

- Map height per breakpoint; panel below on phone, sticky beside from `lg`.
- Pin hit areas 44 px, accessible names, selected pin updates the card.
- Attribution and in-view list visible in both layouts.
- No map before the list on the default screen; `/mapa` owns the full map.

**Acceptance:** map resizes without blank tiles at every breakpoint; keyboard reaches every
café through the list; no location prompt on load.

### 5. Café and rating

`app/cafe/[slug]/page.tsx`, `components/RatingDialog.tsx`, `CafeActions.tsx`.

- Single column on phone; sticky action panel at `lg`.
- Dimensions bars remain proportional and labelled at every width.
- Rating sheet: bottom on phone, centred on larger screens; submit disabled until valid;
  confirmation and sign-in gate use the same pattern.
- Keep the Figma five-button row; it must fit 320 px without horizontal scroll.

**Acceptance:** rate in under 60 seconds one-handed on a phone; same flow completes with
keyboard on desktop; confirmation states exactly what is public.

### 6. A minha lista, Sugerir, informational pages, admin

`components/MyListView.tsx`, `components/SuggestForm.tsx`, `app/sobre`, `app/como-funciona`,
`app/privacidade`, `app/contacto`, `app/admin/page.tsx`.

- Lists: one column phone, two from `md`. Tabs full-width phone, intrinsic desktop.
- Forms and informational pages: 720 px reading measure, single column everywhere.
- Admin counters 2-up on phone as framed, queues split from `md`; no horizontal table.
- Remove `demonstração` and prototype-only labels from production screens.

**Acceptance:** every screen reachable from a visible tab or action; 200% zoom keeps function;
empty and signed-out states exist at both widths.

### 7. Landing and Top 10

`app/best-flat-white-lisbon/page.tsx`, `app/top/page.tsx`.

- Mobile single column, 72 px Top 10 rows, sticky CTA after hero.
- Tablet 2-column Top 10; desktop Top 10 beside "Como funciona".
- Language toggle and footer hold the same layout at all widths.

**Acceptance:** no horizontal scroll at 320 px; sticky CTA never covers content at 200% zoom;
all attribution visible without interaction.

### 8. Verification sweep

- Add Playwright projects for 390×844 (mobile) and 1280×800 (desktop); add 320 and 768 px
  reflow checks.
- For every route, assert `document.documentElement.scrollWidth <= innerWidth`.
- Run axe at 390 and 1280 for list, café, rating, filters and landing.
- Lighthouse mobile SEO and Accessibility ≥95; CLS and LCP within `NFR-5`.
- Manual: iOS Safari (safe area, keyboard over sheet), Android Chrome, phone landscape.
- Compare mobile screenshots against the matching `FlatWhiteMe/*.png` frame.

## Defects not carried over

Found in the older app (`../flatwhite-me`) and checked against the frames:

1. `viewportFit: 'cover'` — fixed in the new layout.
2. Map pins at 16 px and 12 px — fixed with a 44 px button around the visual dot/square.
3. Hover styles are unconditional — still open; wrap hover utilities when the shared button
   and nav styles are consolidated.
4. Explore map aside only at `xl` — intentional: `lg`–`xl` keeps 2-column cards, and `xl` adds
   the 400 px map column.
5. Desktop repeating the mobile `AppBar` wordmark — fixed: `AppBar` is hidden at `lg`; the
   sidebar owns the wordmark.
6. Sheet header search icon where search does not exist — fixed: sheets render close + title.

## Out of scope

Dark mode, native apps, desktop-only information or actions, new routes, new product features,
photos, opening hours, analytics. Tablet is a layout width, not a separate product.

## Risks

| Risk | Mitigation |
|---|---|
| Figma has no desktop frames | Sign off the screen matrix before implementation; changes update this plan |
| Desktop design drifts from the phone hierarchy | Reuse the same components and content order; desktop only changes columns |
| MapLibre sizing and WebGL on low-end phones | Explicit heights and `resize()`; list fallback already required |
| iOS keyboard covers sheet inputs | `dvh` heights, scrollable body, sticky footer above safe area; test on device |
| Zoom and long PT copy overflow | 320 px and 200% checks on every route in CI |
| Two DOM variants drift | One markup tree; breakpoint changes via CSS only |
