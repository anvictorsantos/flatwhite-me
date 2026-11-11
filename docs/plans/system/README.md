# System implementation plans

One plan per Figma screen group, one branch and one PR per plan. Plans land with the foundation; each branch implements one of them.

| Plan | Screens | Branch |
|---|---|---|
| [00-foundation](00-foundation.md) | shell, tokens, routes | `feat/system-foundation` |
| [01-explore](01-explore.md) | 01 Explorar Lisboa, lista e estados | `feat/system-explore` |
| [02-map](02-map.md) | 02 Mapa de Lisboa | `feat/system-map` |
| [03-cafe](03-cafe.md) | Café · Lume Coffee | `feat/system-cafe` |
| [04-rating](04-rating.md) | Avaliar visita | `feat/system-rating` |
| [05-filters](05-filters.md) | 14 Filtros, resultados filtrados | delivered with 01 and 02 |
| [06-my-list](06-my-list.md) | 04 A minha lista, lista vazia | `feat/system-my-list` |
| [07-suggest](07-suggest.md) | 05 Sugerir café, 12 Sugestão enviada, 13 Entrar | `feat/system-suggest` |
| [08-about](08-about.md) | 06 Como funciona, 07 Privacidade, 09 Top 10 | `feat/system-about` |
| [09-moderation](09-moderation.md) | 08 Moderação e estados | `feat/system-moderation` |

Cross-cutting: [responsive implementation plan](../RESPONSIVE.md) — one mobile-first layout per
screen, with the desktop contract for every screen group.

## Conventions

- Portuguese (PT-PT) copy, decimal comma, `3,00 €`, `8 nov 2026`.
- Tokens only; no raw hex outside `:root`.
- 44 px minimum targets, visible focus, one `h1` per screen.
- Every screen is reachable from a bottom tab or a visible in-screen action.
- Any screen not yet implemented stays behind its registered route, never a dead link.
