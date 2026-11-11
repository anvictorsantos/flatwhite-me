# System 05 — Filtros e resultados

Figma: **14 · Filtros**, **Filtros · 4,5+**, **4,6+**, **Lume**, **Resultados · 4,5+ / 4,6+ / Lume**.

## Outcome

The filters sheet and every result state it produces, on both list and map.

## Scope

- Sheet: `À tua medida.` with the preview explanation.
- Search field (`Pesquisar café ou bairro`) that previews matches live.
- `Nota mínima`: Todas / 4,5+ / 4,6+ segmented buttons.
- `Preço`: Todos / Até 3 € / 3–4 €.
- `Especialidade`: Todos / Só especialidade.
- `Mostrar cafés` applies and closes; sheet state is reflected in chips and results.
- Result headers state the active filters and the café count, with the system note.
- Empty result state with a reset action.

## Acceptance check

- Each control's selected state is visible without colour alone (`aria-pressed`).
- Applying and reopening the sheet preserves selections.
- Results always match the header summary.
