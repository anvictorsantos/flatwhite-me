# ADR 0001 — Stack: Next.js, Postgres, Prisma

## Status

Accepted — 2026-11-09

## Context

The two existing house projects diverge: PacePilot is a Vue 3 SPA plus an Express/MongoDB API, Barber-ai is a Next.js App Router app with Postgres and Prisma. Flat White Me is a public city guide. Its core asset is indexable café pages and fast first paint for people searching on a phone. It has no offline engine, no background jobs and no complex domain events.

## Decision

Use Next.js 16 App Router, React 19, TypeScript strict (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Tailwind 4 with semantic tokens, Postgres 16 on Neon (EU), Prisma 7, Zod 4, Vitest and Playwright with axe. Deploy the web service on Render with `/api/health` and `prisma migrate deploy` on start. A single package, no monorepo, no separate API service.

## Consequences

- Café pages are server-rendered and indexable without extra work.
- One deployable unit and one database; simpler operations than the PacePilot split.
- Rankings are expressed in SQL, which is where the aggregation belongs.
- The Firebase/Vercel path is not used; Render matches the other projects.
- The stack inherits the strict TypeScript and token rules already enforced in Barber-ai.

## Alternatives Considered

- **Vue 3 SPA + Express + MongoDB (PacePilot style).** Rejected: SEO and first paint would need a separate prerender layer, and the ranking is relational.
- **Astro with islands.** Rejected: good for content, but the map, rating modal and session handling would spread across more moving parts.
- **Vercel + Postgres.** Rejected only for consistency with the existing projects; no technical objection.
