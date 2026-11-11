# ADR 0002 — Public scorecard and recency-weighted ranking

## Status

Accepted — 2026-11-09

## Context

The product promise is "the best flat white in Lisbon", not "a café directory". A single star rating mixes service, pastries and coffee. Editorial rankings are opaque and stale. We need a score that is specific to the drink, understandable to a visitor, resistant to one enthusiastic outlier, and honest about sample size.

## Decision

Every visit is scored on four dimensions, 1–5:

| Dimension | Weight |
|---|---|
| Taste (espresso balance and strength) | 40% |
| Milk texture (microfoam, no bubbles) | 30% |
| Temperature (drinkable, not scalding) | 10% |
| Value (quality relative to price paid) | 20% |

Visit score is the weighted sum. Each user has one live rating per café; a new visit overwrites it and appends the old values to history.

Café score is the weighted mean of visible visits from the last 365 days, with a recency weight that halves every 182.5 days. A café needs at least 3 ratings to be ranked; 1–2 appears as "Too few ratings"; zero as "Unrated". Every displayed score carries its sample size and latest visit date. No editorial override, no Bayesian shrinkage, no paid placement.

## Consequences

- The score is explainable in one paragraph and reproducible in SQL.
- Small samples are visible rather than smoothed away; users can discount them.
- Old ratings fade without disappearing abruptly at a cutoff.
- A café can lose rank simply because its good ratings aged out; the UI must explain recency.
- The formula becomes a public contract. Changing weights or half-life is a product decision, not a tweak, and needs an ADR update.
- At least 3 ratings per café is a launch constraint; cold start is the main product risk.

## Alternatives Considered

- **Single 1–5 star rating.** Rejected: re-creates Google Maps, loses the flat-white specificity that justifies the app.
- **Plain mean of all visits.** Rejected: a café that was good in 2022 would rank forever, and one vote can dominate a small sample.
- **Bayesian shrinkage toward the town mean.** Rejected for v1: hides small samples instead of labelling them, and adds a prior that is hard to explain.
- **Editorial weighting or "verified" raters.** Rejected: unverifiable at this scale and contradicts the no-gatekeeping promise.
