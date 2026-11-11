# Launch checklist

Status: not launched. Everything below must pass before public launch.

## Gate

Public launch only when `docs/METRICS.sql` shows **≥100 visible ratings across ≥40 cafés**. Seed from real accounts only: import the directory, rate cafés yourself, invite 5–10 friends for one week. No fabricated users, ratings or notes.

## Environment

| Variable | Where |
|---|---|
| `DATABASE_URL` | Neon Postgres, EU region |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud console; redirect URI `https://flatwhite.me/auth/callback` |
| `SESSION_SECRET` | 48 random bytes, per environment |
| `ADMIN_EMAILS` | Comma-separated allowlist |
| `SENTRY_DSN` | Sentry project, PII scrubbing on |
| `NEXT_PUBLIC_SITE_URL` | `https://flatwhite.me` |
| `NEXT_PUBLIC_MAP_STYLE_URL` | `https://tiles.openfreemap.org/styles/liberty` |

## Deploy

1. Create the Render web service from `render.yaml`; attach the Neon `DATABASE_URL`.
2. Confirm `npm run db:deploy` runs before start and `/api/health` returns 200.
3. Point `flatwhite.me` at Render and verify HTTPS and canonical redirects.
4. Register the production Google redirect URI.
5. Run the Overture import against production once and check `docs/import-reports/`.

## Before announcing

- [ ] `npm run typecheck`, `npm test`, `npm run build` green in CI
- [ ] `npm audit --audit-level=high` clean
- [ ] Sign in with Google works on phone and desktop; session survives restart
- [ ] Rating, edit, note lock, daily cap, want-to-try exercised on production
- [ ] Suggestion submitted, approved by an admin, appears publicly
- [ ] Account deletion anonymises ratings and removes notes
- [ ] Map loads on a mid-range Android phone; list works without map
- [ ] Empty states seen with real data: no ranking, one café, no saved cafés
- [ ] `/best-flat-white-lisbon` renders with JavaScript disabled, PT and EN
- [ ] Lighthouse mobile SEO and Accessibility ≥95; axe no critical/serious
- [ ] `robots.txt`, `sitemap.xml`, manifest, icons and OG image resolve on the domain
- [ ] Sentry receives a deliberate test error; no email or note text in the event
- [ ] Database backup exists and a restore into a scratch database was verified
- [ ] Rollback rehearsed: redeploy the previous Render build

## Rollback

Redeploy the previous Render deploy. Migrations are additive until launch, so a rollback needs no database change. If a bad import lands, re-run the previous Overture snapshot; `operating_status` is not a reliable closure signal.

## Weekly

Run `docs/METRICS.sql` and record ranked cafés, ratings, raters and returning raters. No third-party analytics.

## Known gaps

- Contact mailbox `contacto@flatwhite.me` must exist.
- No ESLint/Prettier scripts yet; CI covers typecheck, unit tests, build and audit.
- Map interaction has not been verified by an automated browser test.
