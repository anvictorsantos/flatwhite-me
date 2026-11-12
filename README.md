<p align="center">
  <img src="public/brand/logo.png" width="120" alt="Flat White Me logo" />
</p>

<h1 align="center">Flat White Me</h1>

<p align="center">
  <strong>Ranking the best flat whites in Lisbon, scored by the people who drank them.</strong><br />
  Public browse app in Portuguese, backed by real visits and real scores.
</p>

<p align="center">
  <a href="https://flatwhite.me"><img alt="Live app at flatwhite.me" src="https://img.shields.io/badge/live-flatwhite.me-b4532a?style=flat-square" /></a>
  <a href="https://github.com/anvictorsantos/flatwhite-me/actions/workflows/ci.yml"><img alt="CI status" src="https://github.com/anvictorsantos/flatwhite-me/actions/workflows/ci.yml/badge.svg" /></a>
  <img alt="Node 22.18+" src="https://img.shields.io/badge/node-22.18%2B-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img alt="TypeScript strict" src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="PostgreSQL 16" src="https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat-square&logo=postgresql&logoColor=white" />
</p>

## What it is

Flat White Me answers one question: where should I drink a flat white in Lisbon? Cafés and
scores come from Postgres, not from seeded fixtures. The app:

- **Browses the directory.** Explore with search, filters and a real MapLibre map on
  OpenFreeMap tiles; café pages, top 10 and a PT/EN landing page.
- **Scores a visit.** Signed-in users rate taste, milk texture, temperature and value, plus
  price, milk type, size, visit date and an optional note.
- **Ranks by evidence.** Each café score is a recency-weighted mean of visible visit scores
  from the last 365 days. Three ratings make a café ranked; fewer stay out of the top list.
- **Remembers what you want.** Saved cafés, your rating history and a private want-to-try list.
- **Keeps the directory honest.** Suggestions go through admin review; duplicates are flagged
  by Overture id or normalized name within 100 m; reports hide notes; nothing is paid placement.
- **Explains itself.** Public notes, score explainers, JSON-LD at three ratings, sitemap,
  robots and a web manifest.

## Stack

| Area | Stack |
| --- | --- |
| App | Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4 with semantic tokens |
| Data | Prisma 7, PostgreSQL 16, Zod 4 at every trust boundary |
| Map | MapLibre GL JS with the OpenFreeMap `liberty` style |
| Auth | Google Sign-In, HMAC-hashed opaque session tokens, httpOnly cookie |
| Quality | ESLint, Prettier, Vitest, Playwright, axe, Lighthouse |

## Prerequisites

- **Node 22.18+** (`.nvmrc`; CI and Render pin `22.18.0`).
- **npm**.
- **PostgreSQL 16** with `prisma/schema.prisma` applied. The repository has no migrations
  directory; the schema is applied with the database tooling used for the environment.

## Quickstart

```bash
cp .env.example .env.local   # fill DATABASE_URL and the Google credentials
npm install
npm run db:generate
npm run dev
```

The app runs at `http://localhost:3000`. The health endpoint is `/api/health`.

`DATABASE_URL` is the only required value for browsing. Google Sign-In needs
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` and `SESSION_SECRET`;
`ADMIN_EMAILS` grants the admin role. `NEXT_PUBLIC_MAP_STYLE_URL` defaults to the
OpenFreeMap style, and `NEXT_PUBLIC_SITE_URL` is used for absolute metadata.

### No seeded data

There are no seeded ratings, users, cafés or notes. Directory rows come from Overture imports
and admin-approved suggestions; scores come from real signed-in visits. Local screens that
need ratings stay empty until someone rates a café.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next dev server on `:3000` |
| `npm run build` | production build |
| `npm run start` | run the production build |
| `npm run typecheck` | `tsc --noEmit` with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| `npm run lint` | ESLint 9 flat config |
| `npm run format` / `format:check` | Prettier write / check |
| `npm test` | Vitest unit tests |
| `npm run test:overflow` | 320–1280 px overflow check; needs `BASE_URL` |
| `npm run test:e2e` | Playwright flows; starts `:3100` |
| `npm run test:axe` | axe serious/critical audit; needs `BASE_URL` |
| `npm run test:lighthouse` | mobile Lighthouse accessibility/SEO; starts `:3101` |
| `npm run db:generate` | Prisma client into `generated/prisma` |

CI (`.github/workflows/ci.yml`) runs one `quality` job: Prisma generate, typecheck, lint,
format check, unit tests, a production dependency audit and the build, all with placeholder
env values.

## API

| Endpoint | Auth | Notes |
| --- | --- | --- |
| `GET /api/health` | public | health check |
| `GET /api/cafes` | public | search and filters |
| `GET /api/geocode` | session | place search and reverse geocoding for suggestions |
| `GET /api/library` | session | your ratings and saved cafés |
| `POST /api/ratings` | session | create or overwrite one live rating per café |
| `POST /api/want-to-try` · `DELETE` | session | saved-café toggle |
| `POST /api/suggestions` | session | submit a missing café |
| `POST /api/reports` | session | report a note or rating |
| `POST /api/account/nickname` | session | change public nickname |
| `POST /api/account/delete` | session | anonymise ratings, remove notes |
| `POST /api/admin/suggestions/[id]` | admin | approve, reject or merge |
| `POST /api/admin/cafes/[id]` | admin | close, reopen or flag specialty |
| `POST /api/admin/ratings/[id]` | admin | hide or restore a rating |
| `POST /api/admin/reports/[id]` | admin | hide or dismiss a reported note |
| `GET /auth/google` · `GET /auth/callback` | public | Google OAuth start and callback |
| `POST /auth/signout` | session | clear the session cookie |

## Configuration

### Google Sign-In

The redirect URI must match the Google Cloud console entry exactly: `/auth/callback`.
Sessions are HMAC-hashed opaque tokens in a 30-day httpOnly/SameSite=Lax cookie, signed with
`SESSION_SECRET`. `ADMIN_EMAILS` is a comma-separated allowlist applied on sign-in.

### Map

`NEXT_PUBLIC_MAP_STYLE_URL` points at the OpenFreeMap `liberty` style by default. MapLibre
runs with a locally served worker. OpenFreeMap, OpenStreetMap and Overture attribution must
stay visible.

### Tailwind

Tailwind 4 with `@tailwindcss/postcss` and a CSS-first theme. Token values live in
`app/globals.css` under `@theme`; there is no `tailwind.config.js`. Use the mapped names
(`bg-surface`, `text-accent`, `border-border`, `rounded-card`, `text-display`) instead of
arbitrary values or raw hex in components.

### Deployment

`render.yaml` defines one Next.js web service:

- Build: `npm ci && npm run build`
- Start: `npm run start`
- Health: `/api/health`
- Database: external Postgres through `DATABASE_URL`
- Set the Google credentials, `SESSION_SECRET` and `ADMIN_EMAILS` in the Render dashboard
  or blueprint.

## Docs

| Document | Covers |
| --- | --- |
| `docs/BRIEF.md` | why this exists, who it is for, success criteria |
| `docs/PRD.md` | users, journeys, requirements |
| `docs/MVP-SCOPE.md` | scope and non-goals |
| `docs/DATA-MODEL.md` | domain and persistence |
| `docs/BUILD-PLAN.md` | phases and current state |
| `docs/DESIGN-GUIDELINES.md` | visual system and tokens |
| `docs/LANDING-PAGE-SPEC.md` | landing page spec |
| `docs/LAUNCH.md` | launch gate, environment and deploy checks |
| `docs/adr/` | accepted decisions and trade-offs |
| `docs/plans/` | implementation plans |
| `GLOSSARY.md` | canonical vocabulary |
| `AGENTS.md` | rules every change follows |
