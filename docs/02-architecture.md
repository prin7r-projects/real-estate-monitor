# 02 — Architecture

## System diagram

```mermaid
flowchart LR
  subgraph Sources
    MLS[MLS / IDX feed]
    Z[Zillow public]
    R[Realtor.com / Redfin]
    EU1[ImmoScout24]
    EU2[Idealista]
    EU3[Funda · Sreality · Rightmove · Zoopla · SeLoger · Spitogatos]
  end

  subgraph IngestLayer["Ingest layer · apps/api · Bun + Hono · Wave 3"]
    P[Source pollers · 60-300s]
    N[Normalizer]
    D[Deduper · cross-source]
    L[Listing store · Postgres]
  end

  subgraph ScoringEngine["Scoring · 7-signal model"]
    C[Comp-baseline residual]
    V[Cut velocity]
    M[DOM context]
    Q[Listing-quality]
    F[Profile fit]
    H[Freshness]
    A[Anomaly check]
  end

  subgraph Delivery["Delivery"]
    Q2[Match queue]
    EM[Email worker]
    TG[Telegram worker · @SkylineWatchBot]
    iOS[iOS push · Wave 3 beta]
  end

  subgraph Marketing["Public surface"]
    LP[apps/landing · Next.js 15]
    NW[NOWPayments · /api/checkout/nowpayments]
    IPN[/api/webhooks/nowpayments]
  end

  Sources --> P --> N --> D --> L
  L --> C --> Q2
  L --> V --> Q2
  L --> M --> Q2
  L --> Q --> Q2
  L --> F --> Q2
  L --> H --> Q2
  L --> A --> Q2
  Q2 --> EM
  Q2 --> TG
  Q2 --> iOS
  LP --> NW --> IPN
```

## Components

### `apps/landing/` — Next.js 15 (App Router, standalone)

The Wave 2 surface. Three responsibilities:

1. **Marketing surface.** Hero, split-tab section (sale vs. rent), coverage strip, scoring
   explainer, pricing, FAQ, footer. Hand-rolled components in TypeScript + Tailwind.
2. **NOWPayments hosted-invoice creation.** `app/api/checkout/nowpayments/route.ts` validates the
   plan, calls `POST https://api.nowpayments.io/v1/invoice` with the project's `x-api-key`, returns
   `{invoice_url, invoice_id}`.
3. **NOWPayments IPN webhook.** `app/api/webhooks/nowpayments/route.ts` verifies `x-nowpayments-sig`
   (HMAC-SHA512 over `JSON.stringify(sortObject(payload))`), returns `{ok, verified, paid, status}`.
   Wave 2 is a stub — Wave 3 persists the payment and provisions a tenant.

The container is a Node 22-alpine multistage build with `output: 'standalone'`. Behind
`dokploy-traefik` host-network mode on `storage-contabo`. TLS via Let's Encrypt HTTP-01.

### `apps/app/` — open-saas dashboard (Wave 3, placeholder)

Forks `wasp-lang/open-saas`. Replaces its demo domain with Skyline's: `Tenant`, `User`, `Profile`,
`Listing`, `Match`. Routes: `/queue`, `/profiles`, `/listing/:id`, `/billing`, `/api-keys`,
`/settings`. NOWPayments wired as the upgrade rail. See `apps/app/README.md` for the cold-start plan.

### `apps/api/` — ingestion + scoring engine (Wave 3, not yet scaffolded)

Bun + Hono job queue. Two cadence tiers:

| Tier | Cadence | Sources |
|---|---|---|
| Hot | 60–90 s | rent on EU primaries (Idealista, ImmoScout24), MLS rent in supported US markets |
| Warm | 3–5 min | sale-side everywhere |
| Cold | 15 min | secondary cross-check (Zillow, Realtor.com, Redfin) |

Scoring is the 7-signal model in `docs/04-pain-points.md` & inline on the landing. Each signal is a
pure function over `Listing × CompSet × Profile → number`; final score is a weighted average.

## Data flows

### Hot path: new rental listing detected

1. `Idealista poller` reads city feed at 60 s cadence, returns 12 new IDs.
2. `Normalizer` maps to internal `Listing` shape; emits to `dedupe-queue`.
3. `Deduper` keyed on `(city, lat-rounded, area_m2-rounded, bedroom_count)`; drops cross-portal
   duplicates within 24 h.
4. `Listing store` upserts into Postgres (RLS by `tenant_id` for the multi-tenant Wave 3 case).
5. `Scoring engine` enqueues 7 signal jobs, computes weighted average, writes `Match` rows for any
   `Profile` whose hard filters pass.
6. `Match queue` fans out to `email-worker` + `telegram-worker` + (Wave 3) `ios-push-worker`.
7. Email lands at +90 s median (P50), +6 min P99.

### Slow path: sale-side cut detection

1. `MLS poller` (3–5 min cadence) reads listing diff.
2. `Cut detector` watches `price` field history; emits a `CutEvent` if Δ ≥ 1.0% AND time-since-list ≥
   7 days.
3. `Cut velocity` signal updates the listing's score, re-emits to scoring engine.
4. If new score crosses any active `Profile` threshold, a `Match` is created and routed.

## Deploy topology

| Surface | Host | Path | TLS | Notes |
|---|---|---|---|---|
| `apps/landing/` | `storage-contabo` (`161.97.99.120`) | `/opt/prin7r-deploys/real-estate-monitor/` | Let's Encrypt R12 | docker compose · Traefik labels · `expose: ["3000"]` |
| `apps/app/` (Wave 3) | TBD (likely same host) | TBD | Let's Encrypt | open-saas dev server during scaffold |
| `apps/api/` (Wave 3) | TBD (likely separate host for poller fan-out) | TBD | internal-only | Bun + Hono |

DNS is wildcard `*.prin7r.com → 161.97.99.120` already configured at Cloudflare — no per-subdomain
records needed.

## Environment variables

```
NEXT_PUBLIC_SITE_URL      # https://real-estate-monitor.prin7r.com
NOWPAYMENTS_API_KEY       # live API key, server-only
NOWPAYMENTS_IPN_SECRET    # IPN HMAC secret, server-only
NOWPAYMENTS_SANDBOX       # false in prod
```

Live values live only in `/opt/prin7r-deploys/real-estate-monitor/.env` on the server, never in git.

## Logging

Convention: every server-side log line carries one of these tags:

- `[SKYLINE_NOWPAYMENTS]` — invoice route lifecycle.
- `[SKYLINE_NOWPAYMENTS_IPN]` — webhook lifecycle.
- (Wave 3) `[SKYLINE_INGEST]`, `[SKYLINE_SCORE]`, `[SKYLINE_DELIVER]`.

Logs are JSON-structured for the container; Traefik handles access logs separately.
