# System 04 — Avaliar visita

Figma: **Avaliar · Lume Coffee**, **11 · Avaliação guardada**, **13 · Entrar**.

## Outcome

The rating sheet: four 1–5 groups, price paid, save, confirmation, and the sign-in gate.

## Scope

- Sheet over the café screen: title `Avaliar visita`, café name, scale explanation.
- Four groups (Sabor, Textura do leite, Temperatura, Qualidade-preço) as five 44 px buttons each; one selected state per group.
- `Preço pago` euro input defaulting to the café's price.
- Sticky `Guardar avaliação`; disabled until all four groups are chosen.
- On save: store the rating locally, show **11 · Avaliação guardada** sheet with visit summary, `Concluir` returns to the café.
- Signed-out state: number `13 · Entrar` with simulated Google, privacy link and `Continuar sem conta`.
- Editing an existing rating preloads its values (entry from A minha lista).

## Acceptance check

- Keyboard alone can score all four groups and save.
- Re-saving updates the same rating instead of adding a second.
- The confirmation states exactly what is public.
