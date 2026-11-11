# Flat White Me

Public browse app ranking the best flat whites in Lisbon, scored by the people who drank them. Portuguese (PT-PT), desktop-first with a phone layout that matches the Figma frames in `FlatWhiteMe/`. Cafés and scores come from Postgres; there are no seeded ratings.

The app ships the public MVP: explore list with search and filters, MapLibre map on OpenFreeMap tiles, café pages, top 10, PT/EN landing, rating sheet with a four-dimension scorecard and visit metadata, saved cafés, suggestions, public notes and reports, Google Sign-In with opaque session cookies, admin review and launch metrics, account deletion, SEO/PWA metadata, and a Render blueprint. Strict TypeScript, Tailwind tokens, ESLint, Prettier, Vitest, Playwright, axe and Lighthouse are wired in.

## Requirements

- Node 22.18+ (`.nvmrc`)
- npm
- PostgreSQL 16 for Prisma work

## Setup

```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run dev
```

`DATABASE_URL` must point at a Postgres 16 database with `prisma/schema.prisma` applied. The repository has no migrations directory; the schema is applied with the database tooling used for the environment. The app runs at `http://localhost:3000`. The health endpoint is `/api/health`.

## Scripts

```bash
npm run dev              # Next dev server
npm run build            # next build
npm run start            # next start
npm run typecheck        # tsc --noEmit, strict
npm run lint             # ESLint
npm run format           # Prettier
npm run format:check
npm test                 # Vitest validation tests
npm run test:overflow    # 320–1280 px overflow, needs BASE_URL
npm run test:e2e         # Playwright flows, starts :3100
npm run test:axe         # axe serious/critical, needs BASE_URL
npm run test:lighthouse  # mobile Lighthouse, starts :3101
npm run db:generate      # Prisma client into generated/prisma
```

## Configuration

### TypeScript

Strict mode plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. The `@/` alias points at the repository root. `npm run typecheck` is mandatory in CI.

### Tailwind

Tailwind 4 with `@tailwindcss/postcss` and a CSS-first theme. Token values live in `app/globals.css` under `@theme`; there is no `tailwind.config.js`. Use the mapped names (`bg-surface`, `text-accent`, `border-border`, `rounded-card`, `text-display`) instead of arbitrary values or raw hex in components.

### Google Sign-In

- Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_REDIRECT_URI`.
- The redirect URI must match the Google Cloud console entry exactly: `/auth/callback`.
- Sessions are HMAC-hashed opaque tokens in a 30-day httpOnly/SameSite=Lax cookie, signed with `SESSION_SECRET`.
- `ADMIN_EMAILS` is a comma-separated allowlist that grants the admin role on sign-in.

### Map

- `NEXT_PUBLIC_MAP_STYLE_URL` points at the OpenFreeMap `liberty` style by default.
- MapLibre runs with a locally served worker.
- OpenFreeMap, OpenStreetMap and Overture attribution must stay visible.

### Render

`render.yaml` defines one Next.js web service:

- Build: `npm ci && npm run build`
- Start: `npm run start`
- Health: `/api/health`
- Database: external Postgres through `DATABASE_URL`
- Set the Google credentials, `SESSION_SECRET` and `ADMIN_EMAILS` in the Render dashboard or blueprint.

### ESLint and Prettier

ESLint 9 flat config on the Next.js core-web-vitals and TypeScript presets. Prettier owns formatting. Both run in CI along with typecheck, unit tests, a production dependency audit and the build.

## Docs

- `docs/BRIEF.md` — product brief.
- `docs/PRD.md` — product requirements.
- `docs/DATA-MODEL.md` — domain and persistence.
- `docs/BUILD-PLAN.md` — phases and current state.
- `docs/DESIGN-GUIDELINES.md` — visual system.
- `docs/MVP-SCOPE.md` — scope and non-goals.
- `docs/LAUNCH.md` — launch gate and deploy checks.
- `docs/adr/` — decisions.
- `docs/plans/` — implementation plans.
- `GLOSSARY.md` — canonical terms.
