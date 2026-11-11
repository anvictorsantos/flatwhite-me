# System 08 — Sobre, Como funciona, Privacidade e Top 10

Figma: **06 · Como funciona**, **07 · Privacidade**, **09 · Top 10 de Lisboa**.

## Outcome

The three informational screens reachable from the `Sobre` tab.

## Scope

- `#/about`: hub linking to Como funciona, Privacidade, Moderação (demo) and Top 10.
- **06 Como funciona**: weights table (Sabor 40%, Textura do leite 30%, Temperatura 10%, Qualidade-preço 20%), recency explanation, 3-rating minimum.
- **07 Privacidade**: what is public (name/alias, ratings, notes), what is private (email, want-to-try, location), account deletion, system disclaimer.
- **09 Top 10**: full ranking, `Onde beber um flat white em Lisboa.`, example-data note, `Explorar lista e mapa` action.
- Session control for the system: signed-in as Inês, with a simulated sign-out that drives the signed-out flows.

## Acceptance check

- Every claim matches `docs/DESIGN-GUIDELINES.md`, `docs/DATA-MODEL.md` and ADR 0002.
- Weights shown always sum to 100% and match README.
- Top 10 rows link to their café screens.
