# Skyline Watch — `real-estate-monitor`

> **Live URL:** [real-estate-monitor.prin7r.com](https://real-estate-monitor.prin7r.com)
> **Notion opportunity:** [Real estate market monitoring](https://www.notion.so/Real-estate-market-monitoring-3543ceec2619815b8c7ff494b10f2d0d)
> **Wave:** 3 · **Stage:** In Development · **Stack:** SaaS (landing live, dashboard + API in progress)

Skyline Watch is a market-watch terminal for residential real estate. Subscribers set a target city,
budget, and must-haves &mdash; **sale or rent**. Skyline polls the listing sources, scores every new
listing against a local baseline using a 7-signal model, and pushes the matches to the subscriber's
inbox and Telegram inside two minutes.

## Screenshots

| Desktop · 1440 × 900 | Mobile · 390 × 844 |
|---|---|
| ![Skyline Watch landing — desktop](docs/screenshots/landing-desktop.png) | ![Skyline Watch landing — mobile](docs/screenshots/landing-mobile.png) |

## Repository structure

```
real-estate-monitor/
├── DESIGN.md                       # Canonical design + style guide (15 sections)
├── README.md                       # This file
├── Dockerfile.landing              # Multistage Next.js 15 standalone build
├── Dockerfile.api                  # API service build
├── Dockerfile.app                  # Wasp dashboard build
├── docker-compose.yml              # Full stack: postgres + redis + landing + api + app
├── .env.example                    # NOWPAYMENTS_* + NEXT_PUBLIC_SITE_URL
├── .github/workflows/
│   └── landing-build.yml           # CI typecheck + next build on apps/landing/**
├── apps/
│   ├── landing/                    # Next.js 15 + Tailwind landing
│   │   ├── app/
│   │   │   ├── page.tsx            # Hero + split-tabs + coverage + scoring + pricing + FAQ + footer
│   │   │   ├── layout.tsx          # Fonts + metadata
│   │   │   ├── globals.css         # Design-token CSS
│   │   │   ├── alert-ticker.tsx    # Live-clock alert ticker (client component)
│   │   │   ├── split-modes.tsx     # Sale-vs-Rent split-tab section (client component)
│   │   │   ├── pricing-cta.tsx     # NOWPayments invoice CTA (client component)
│   │   │   └── api/
│   │   │       ├── checkout/nowpayments/route.ts
│   │   │       └── webhooks/nowpayments/route.ts
│   │   ├── lib/
│   │   │   ├── env.ts              # MissingEnvError + helpers
│   │   │   └── nowpayments.ts      # invoice POST + IPN HMAC-SHA512
│   │   └── public/                 # icon.svg, og-image.svg, robots.txt
│   ├── app/                        # Wasp dashboard (Phase 1+)
│   │   ├── main.wasp               # Wasp configuration
│   │   ├── schema.prisma           # Database schema
│   │   └── src/
│   │       ├── profiles/           # Profile management
│   │       ├── matches/            # Match dashboard
│   │       └── lib/                # Utilities
│   └── api/                        # Bun + Hono API (Phase 2+)
│       ├── src/
│       │   ├── db/                 # Database schema + connection
│       │   ├── pollers/            # Source pollers
│       │   ├── normalizer/         # Listing normalization
│       │   ├── deduper/            # Deduplication
│       │   ├── scoring/            # 7-signal scoring engine
│       │   ├── delivery/           # Email + Telegram delivery
│       │   └── routes/             # API routes
│       └── drizzle/                # Database migrations
├── docs/
│   ├── 01-brand-identity.md
│   ├── 02-architecture.md
│   ├── 03-user-journeys.md
│   ├── 04-pain-points.md
│   ├── 05-audience-profile.md
│   ├── 06-sales-channels.md
│   ├── 07-sales-strategy.md
│   ├── 08-marketing-strategy.md
│   ├── 09-go-to-market.md
│   ├── 10-pitch-deck.md
│   ├── 11-user-stories-and-scenarios.md
│   ├── 12-technical-specification.md
│   ├── 13-implementation-plan.md
│   ├── pitch-deck.html             # Self-contained 10-slide deck
│   └── screenshots/                # landing-desktop.png · landing-mobile.png
└── scripts/
    └── capture-landing-screenshots.mjs   # Playwright capture (1440×900 + 390×844)
```

## Quickstart (local development)

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 16 with PostGIS
- Redis

### Setup

```bash
# Clone repository
git clone https://github.com/prin7r-projects/real-estate-monitor.git
cd real-estate-monitor

# Start database and Redis
docker compose up -d postgres redis

# Set up landing page
cd apps/landing
cp .env.example .env.local
pnpm install
pnpm dev          # http://localhost:3000

# Set up API
cd ../api
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev          # http://localhost:3001

# Set up dashboard
cd ../app
# Follow Wasp setup instructions
```

## Deployment

The production deploy lives on `storage-contabo` at `/opt/prin7r-deploys/real-estate-monitor/`,
behind `dokploy-traefik` (host-network mode). DNS is the wildcard `*.prin7r.com → 161.97.99.120`.

```bash
ssh storage-contabo
cd /opt/prin7r-deploys/real-estate-monitor
git pull
docker compose up -d --build
```

## Payment flow

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/checkout/nowpayments` | POST | Body `{plan: "single"\|"multi"\|"investor"}` → creates a NOWPayments hosted invoice and returns `{invoice_url, invoice_id}`. Client redirects. |
| `/api/checkout/nowpayments` | GET | Health probe — returns the plan list. |
| `/api/webhooks/nowpayments` | POST | NOWPayments IPN. Verifies `x-nowpayments-sig` (HMAC-SHA512 over alphabetically-sorted JSON). |

Three tiers (`single $39 / mo`, `multi $119 / mo`, `investor $349 / mo`). Click any pricing CTA on
the live landing to open a real unpaid invoice once the server `.env` has live `NOWPAYMENTS_API_KEY`.

## API Endpoints

### Health
- `GET /api/healthz` - Health check
- `GET /api/readyz` - Readiness check

### Profiles
- `GET /api/v1/profiles` - List user's profiles
- `POST /api/v1/profiles` - Create new profile
- `GET /api/v1/profiles/:id` - Get profile details
- `PATCH /api/v1/profiles/:id` - Update profile
- `POST /api/v1/profiles/:id/pause` - Pause profile
- `POST /api/v1/profiles/:id/resume` - Resume profile

### Matches
- `GET /api/v1/matches` - Get user's matches
- `GET /api/v1/matches/:id` - Get match details

### Sources (Operator only)
- `GET /api/v1/sources` - List all sources
- `POST /api/v1/sources/:id/restart` - Restart source

## Quality gates (per playbook v2 §D)

See [`DESIGN.md`](./DESIGN.md) §12.

## License

[MIT](./LICENSE) © Prin7r Projects 2026.
