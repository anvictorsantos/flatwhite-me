# Flat White Me

Ranking the best flat whites in Lisbon, scored by the people who drank them.

Public browse app, Portuguese (PT-PT), built desktop-first with a phone layout that matches the
Figma frames in `FlatWhiteMe/`. Cafés and scores come from Postgres; there are no seeded ratings.

## Stack

Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, Prisma 7, Postgres 16,
MapLibre with OpenFreeMap tiles.

## Commands

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test              # Vitest validation tests
npm run test:overflow # 320–1280 px overflow, needs BASE_URL
npm run test:e2e      # Playwright flows, starts :3100
npm run test:axe      # axe serious/critical, needs BASE_URL
npm run test:lighthouse # mobile Lighthouse, starts :3101
npm run db:generate
```

`DATABASE_URL` points at the local Postgres instance; see `.env.example`.

## Implemented

- Shell: desktop sidebar, phone bottom tabs, safe-area padding, 44 px controls.
- Explore list with search and filters, map, café page, top 10, landing, info pages.
- Rating sheet with four scores, price, milk, size, visit date and note; signed-in users save,
  signed-out users get the sign-in gate first.
- Real MapLibre map with OpenFreeMap/OpenStreetMap attribution and a locally served worker.
- Google Sign-In: `/auth/google`, `/auth/callback`, `/auth/signout`; HMAC-hashed session tokens
  in a 30-day httpOnly/SameSite=Lax cookie; `ADMIN_EMAILS` sets the admin role.
- Ratings: `POST /api/ratings` with server-side Zod validation, one live rating per user/café,
  revision history, 20-per-day cap and 30-day note lock; `/api/library`; the rating sheet
  preloads an existing rating, saves it and shows a confirmation; `/lista` lists your ratings.
- Saved cafés: heart toggle, `POST`/`DELETE /api/want-to-try`, saved section in `/lista`.
- Suggestions: `/sugerir` search plus form, `POST /api/suggestions`, pending confirmation.
- Admin: `/admin` with pending suggestions, duplicate candidates, approve, reject, merge,
  reported-note hide or dismiss, café close/reopen, specialty flag and launch-gate metrics.
- Account deletion: `/api/account/delete`, two-step control on `/privacidade`.
- Public notes on café pages with a report sheet; nickname editing from `/lista`.
- SEO/PWA: café metadata, `CafeOrCoffeeShop` JSON-LD at 3+ ratings, landing metadata,
  sitemap, robots, web manifest and 192/512 icons.
- Tests: Vitest validation tests, 320–1280 px overflow, axe serious/critical, Lighthouse
  mobile accessibility/SEO and seven Playwright flows. An opt-in Google OAuth smoke test runs
  with `E2E_GOOGLE=1`.

## Deploy

`render.yaml` defines the web service, health check and env vars. `.github/workflows/ci.yml`
runs lint, format, typecheck, unit tests and build. Production still needs the Render service,
Neon database, DNS and the Google redirect URI.

## Not implemented

Café closure detection beyond admin review, automated Google login with a real account
(consent needs a human), and the ≥100 ratings launch gate, which depends on real users.

## Docs

`docs/plans/RESPONSIVE.md` is the current implementation plan; `docs/` holds the product docs
and the screen plans under `docs/plans/system/`.
