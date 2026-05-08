# `apps/app/` — Wave 3 dashboard (planned)

This folder is a placeholder. The Wave 2 deliverable for `real-estate-monitor` is the marketing landing
in `apps/landing/`. The full subscriber dashboard ships in Wave 3 as a fork of
[`wasp-lang/open-saas`](https://github.com/wasp-lang/open-saas).

## Wave 3 build plan

### Domain model

- `Tenant` — billing entity, holds the active NOWPayments subscription.
- `User` — operator under a tenant. Multi-seat for `investor` plan only.
- `Profile` — match profile owned by a user. Holds:
  - `mode`: `sale` | `rent` (rent profiles can be tighter on the freshness clock)
  - `cities`: list of `cityId`s the profile applies to (1 / 5 / 25 by plan)
  - `hardFilters`: must-haves (rooms, max budget, district whitelist, must-have amenities)
  - `softPreferences`: tie-breakers (floor, view, year-built)
  - `notificationChannels`: list of `email` / `telegram` / `ios-push`
- `Listing` — normalized listing record. Source-tagged, deduped at ingest.
- `Match` — the alert object. Holds the score breakdown, comp set used, sent-at timestamp,
  and the channel(s) it was delivered on.

### Routes

| Path | Purpose |
|---|---|
| `/queue` | The live alert queue. Default landing page after login. Shows new matches at the top with sort controls (score, time, city). |
| `/profiles` | CRUD for match profiles. Soft-delete; never purge — profiles inform comp models even when paused. |
| `/listing/:id` | Detail view: listing fields, photo gallery, full score breakdown, comp set used, source link. |
| `/billing` | NOWPayments subscription status, last invoice, plan upgrade/downgrade, cancel. |
| `/api-keys` | Investor plan only: REST tokens + webhook configuration. |
| `/settings` | Notification channels, Telegram pairing, iOS push device registration. |

### Wave 3 dependencies

- `apps/api/` — Bun + Hono ingestion + scoring engine (separate Wave 3 build).
- Postgres for `Listing`, `Match`, `Profile`, `Tenant`. Redis for rate-limit + queue.
- NOWPayments subscription billing wired through the existing `apps/landing/` checkout route.

### Why deferred to Wave 3

The Wave 2 mandate is "marketing landing live + checkout integration verified end-to-end." Forking
open-saas, replacing its demo domain model, and configuring auth + database + NOWPayments
subscription billing is a one-week engineering scope and was explicitly bumped to a later wave by the
playbook. This `README.md` documents the plan so the Wave 3 agent can pick up cold.

— Wave 2 build agent · 2026-05-08
