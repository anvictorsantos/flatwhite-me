# System 06 — A minha lista

Figma: **04 · A minha lista**, **Lista · só Lume**, **Lista · só Pátio**, **Lista · vazia**.

## Outcome

Personal list with two tabs: saved cafés and my ratings, including empty and single-item states.

## Scope

- App bar: back, `A minha lista`, search.
- Greeting `Os teus próximos cafés.` and `Olá, Inês. Só tu vês esta lista.`
- Tabs: `Guardados` / `Avaliações` with counts.
- Saved: one card per saved café with score, sample size, date and `Remover dos guardados`.
- Ratings: one card per rating with visit date, four values, quoted note and `Editar avaliação`, plus the note lock hint.
- Empty saved state: sentence, `Guardar um café`/`Explorar cafés` action, then the ratings section.
- Signed-out state points to the Entrar sheet.

## Acceptance check

- Removing the last saved café shows the empty state immediately.
- Tab state persists while navigating within the screen.
- Editing a rating opens the rating sheet preloaded with its values.
