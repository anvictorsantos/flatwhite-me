# System 03 — Café

Figma: **Café · Lume Coffee**.

## Outcome

Café detail screen: identity, score block, rating action, saved state and the four dimensions.

## Scope

- App bar: back, café name, search.
- Eyebrow `Santos · Café de especialidade`, `h1` café name.
- Score card: `4,6` out of 5, ranking flag, `24 avaliações nos últimos 365 dias`, last visit.
- Actions: `Avaliar este café` (primary, opens rating sheet) and `Guardado na minha lista` toggle.
- `Cada detalhe conta`: four labelled bars (Sabor 4,7 · Textura do leite 4,6 · Temperatura 4,5 · Qualidade-preço 4,3), value always in text.
- Empty state for a café with fewer than 3 ratings: `Ainda sem nota` plus a working rating action.
- Links to its map position.

## Acceptance check

- Bar widths are proportional to the value; the number is always readable without colour.
- Both actions meet 44 px and have visible focus.
- The saved toggle persists and matches the badge state on the list.
