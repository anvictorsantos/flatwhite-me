# ADR 0004 — Authentication with Google Sign-In

## Status

Accepted — 2026-11-09

## Context

The app allows anonymous browsing but needs a stable identity to enforce one rating per user per café, a daily cap, note authorship and account deletion. The audience is on phones, often at a café table, so sign-in friction directly reduces ratings. The existing house projects use email/password or phone identity; neither matches a low-friction public consumer app.

## Decision

- Google Sign-In (OAuth 2.0 / OpenID Connect) is the only sign-in method in v1.
- Browsing, the map and café pages require no account.
- Sign-in is required to rate, save want-to-try, suggest a café or report content.
- Sessions are opaque random tokens stored as SHA-256 hashes in the database, delivered in httpOnly, Secure, SameSite=Lax cookies with a 30-day expiry. No JWT in the browser.
- The profile stores Google subject, private email, display name and optional nickname. Email is never rendered publicly.
- Admin access is an email allowlist (`ADMIN_EMAILS`), not a role UI.
- Account deletion anonymises ratings and deletes the profile and notes.

## Consequences

- One tap on a phone, no password reset flow, no email deliverability dependency for sign-in.
- Google becomes a runtime dependency for new ratings only; the ranking stays readable if Google is unavailable.
- Users without a Google account cannot rate. Accepted for v1; a magic-link fallback is the obvious later addition.
- The privacy page must disclose Google as the identity provider and describe what is stored.
- OAuth client secrets and the allowlist live in environment variables, never in the repository.

## Alternatives Considered

- **Email magic link via Resend.** Rejected: more typing at the counter, adds deliverability and link-expiry failure modes, and the house already has no shared auth library to reuse.
- **Anonymous device identity.** Rejected: trivial to bypass, makes one-rating-per-café meaningful only by device, and complicates account deletion and note authorship.
- **Phone OTP.** Rejected: cost per message and slower than one tap.
- **Email/password.** Rejected: password support burden with no benefit for this audience.
