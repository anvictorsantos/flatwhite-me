# System 09 — Moderação e estados de denúncia

Figma: **08 · Moderação**, **Moderação · sugestão aprovada**, **Moderação · nota oculta**, **Denúncia · confirmação**, **Perto de mim**.

## Outcome

Admin review screen with its transitions, plus the report and location sheets that feed it.

## Scope

- `#/admin`: reserved-area label, counters (sugestões, denúncias), pending suggestion card with duplicate check and `Aprovar sugestão`, reported-note card.
- Approve → approved state with green confirmation; report → hidden-note state. Counters update.
- `Denunciar nota` sheet from the café screen; `Concluir` shows **Denúncia · confirmação** explaining that hiding is a moderation decision.
- `Perto de mim` sheet: **Localização · demonstração**, explicit `Ver mapa de exemplo`, no real geolocation request.
- Admin entry is labelled `Moderação · demonstração` and reached only from Sobre; no product navigation exposes it.

## Acceptance check

- Approving and hiding both update counts and card state without a reload.
- The report confirmation never claims immediate removal.
- No location permission is requested anywhere in the system.
