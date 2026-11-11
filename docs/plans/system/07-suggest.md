# System 07 — Sugerir café

Figma: **05 · Sugerir café**, **12 · Sugestão enviada**.

## Outcome

Suggestion form for a café the directory does not have, plus its confirmation sheet.

## Scope

- App bar: back, `Sugerir café`, search.
- Eyebrow explanation: suggestions are reviewed before appearing on the map.
- `Procurar cafés existentes` search with the `Não encontrámos este café` result for `Café da Esquina`.
- Form: café name, address, optional coordinates, note, submit `Enviar sugestão` with disabled state until required fields are valid.
- Confirmation sheet **12 · Sugestão enviada**: `Obrigada pela sugestão.`, pending-review explanation, `Voltar a explorar`.
- Signed-out state reuses the Entrar sheet before the form submits.

## Acceptance check

- Submitting with an empty name is blocked and the error is linked to the field.
- The confirmation explains what happens next and that nothing is public yet.
- The form can be reached from the suggestions entry on Sobre and from an empty search result.
