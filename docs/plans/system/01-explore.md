# System 01 — Explorar Lisboa

Figma: frame **01 · Explorar Lisboa**, plus the list states in **Resultados**.

## Outcome

The default screen: brand header with city chip, hero, search, Lista/Mapa switch, filter chips, and the ranked list rendered from example data.

## Scope

- Header: `Flat White Me` + `Lisboa` pill.
- Hero: `O teu próximo flat white.` and the honest lede.
- Search input (`Pesquisar café ou bairro`) that filters by café name and neighbourhood as you type.
- Segmented control: Lista selected, Mapa navigates to `#/map`.
- Chips: `Filtros` opens the filters sheet; `Perto de mim` opens the simulated location sheet.
- Ranking section header with count, window and system note.
- `CafeRow` cards: name, area, score, sample size, last visit, specialty and price, `Avaliar este café`, bookmark.
- States: default ranking, filtered (`Resultados filtrados` with filter summary), search (`Pesquisa: Lume`), no results.

## Data

Example cafés from `system/data.js`, sorted by score. No paid placement, no editorial badge.

## Acceptance check

- Typing `Lume` narrows to Lume Coffee and shows `1 café encontrado`.
- `Filtros` chip shows the active filter count when filters apply.
- Every card exposes one bookmark toggle with a 44 px target and `aria-pressed`.
- No score appears without sample size and last visit.
