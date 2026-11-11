# Flat White Me — Landing Page Spec

## Goal

Rank for "best flat white Lisbon" / "melhor flat white Lisboa" and route searchers into the app. The page must be useful on its own: a visitor who never taps anything still leaves knowing the current top cafés and how the score works.

URL: `/best-flat-white-lisbon` (PT and EN variants share the route; language is a cookie/query preference, not a separate URL in v1).

## Information Architecture

1. **Header** — wordmark, language toggle, "Mapa" link.
2. **Hero** — H1, one-line explainer, primary CTA "Ver o ranking" / "See the ranking". No image.
3. **Top 10** — ranked cafés with score, sample size, neighbourhood. Each row links to its café page. Below it: "Only cafés with 3+ ratings are ranked."
4. **How the score works** — four dimensions, weights, recency decay, 3-rating minimum. Short paragraphs plus a worked example.
5. **Why this exists** — two sentences: generic café stars hide flat-white quality; this ranking scores the drink.
6. **Latest ratings** — five most recent public notes with café name and date. Demonstrates activity without a feed.
7. **FAQ** — four questions: how cafés get listed, how to rate, why a café is missing, whether cafés can pay.
8. **Footer** — about, privacy, Overture and OpenStreetMap attribution, contact, language toggle.

## Copy Tone

- PT-PT primary, English secondary.
- Direct and local. First person plural only when accurate; prefer imperative CTAs.
- No superlatives without the ranking behind them. Never "the ultimate guide".
- H1 PT: "O melhor flat white de Lisboa". H1 EN: "Lisbon's best flat white".
- Subline PT: "Avaliado por quem bebeu. Sem publicidade, sem lugares pagos."
- Subline EN: "Rated by people who drank it. No ads, no paid placements."

## CTA Behaviour

- Primary CTA scrolls to Top 10, then a second CTA enters `/`.
- "Avaliar um café" opens `/` if signed out, or the rating modal for the nearest café if location is already granted.
- Language toggle changes copy in place and persists in a cookie.
- Café rows are real links, middle-click and Cmd-click work.

## SEO and Metadata

- `<title>` PT: "Melhor flat white em Lisboa — ranking 2026 | Flat White Me"; EN equivalent.
- Meta description under 155 characters, includes town and ranking basis.
- Canonical URL `https://flatwhite.me/best-flat-white-lisbon`, with `hreflang` for `pt-PT` and `en`.
- Open Graph: title, description, `og:type=website`, static image (wordmark on cream).
- JSON-LD: `ItemList` of the Top 10 with links. No `AggregateRating` on the page itself; café pages own rating markup and only when ≥3 ratings.
- XML sitemap includes this page, café pages and `/about`.

## Responsive

- Mobile: single column; Top 10 rows 72 px tall; sticky CTA appears after the hero.
- Tablet: two-column Top 10.
- Desktop: max width 1120 px; Top 10 and "How it works" side by side.
- No horizontal scroll at 320 px width.

## Accessibility

- WCAG 2.2 AA.
- Rank number, café name, score, sample size and neighbourhood are all text, not conveyed by colour.
- Language toggle is a labelled group, not an icon-only control.
- FAQ uses native `<details>`/`<summary>`.
- Sticky CTA does not overlap content when zoomed to 200%.

## Out of Scope

- Contact forms, newsletter signup, cookie banner.
- Embedded interactive map on this page; link to `/` instead.
- Dynamic OG image generation.
- Testimonials, press logos, café photography.
- Paid or sponsored placements.

## Acceptance

- Page renders with JavaScript disabled and shows the current Top 10 from the server.
- Top 10 never includes cafés below 3 ratings or closed cafés.
- Language toggle changes all visible copy and `<html lang>`.
- Lighthouse SEO ≥95 and Accessibility ≥95 on mobile.
- axe reports no critical or serious violations.
- All attributions visible without interaction.
