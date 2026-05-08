# Skyline Watch — `real-estate-monitor`

> **Live URL:** [real-estate-monitor.prin7r.com](https://real-estate-monitor.prin7r.com)
> **Notion opportunity:** [Real estate market monitoring](https://www.notion.so/Real-estate-market-monitoring-3543ceec2619815b8c7ff494b10f2d0d)
> **Wave:** 2 · **Stage:** Qualified · **Stack:** SaaS (landing live, dashboard deferred to Wave 3)

Skyline Watch is a market-watch terminal for residential real estate. Subscribers set a target city,
budget, and must-haves &mdash; **sale or rent**. Skyline polls the listing sources, scores every new
listing against a local baseline using a 7-signal model, and pushes the matches to the subscriber's
inbox and Telegram inside two minutes.

The brand identity is **topo-map technical** &mdash; sage and clay on bone, editorial Fraunces serif over
IBM Plex Mono ticker. The landing reads like a back-office market-watch terminal, not a Zillow-ish
listing portal.

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
├── docker-compose.yml              # Single landing service · Traefik labels · env_file: .env
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
│   └── app/                        # placeholder · Wave 3 open-saas fork (see apps/app/README.md)
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
│   ├── pitch-deck.html             # Self-contained 10-slide deck
│   └── screenshots/                # landing-desktop.png · landing-mobile.png
└── scripts/
    └── capture-landing-screenshots.mjs   # Playwright capture (1440×900 + 390×844)
```

## Quickstart (local development)

```bash
cd apps/landing
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production bundle
```

Then `cp .env.example apps/landing/.env.local` and fill the `NOWPAYMENTS_*` keys to test the
checkout route end-to-end against the real NOWPayments API.

## Deployment

The production deploy lives on `storage-contabo` at `/opt/prin7r-deploys/real-estate-monitor/`,
behind `dokploy-traefik` (host-network mode). DNS is the wildcard `*.prin7r.com → 161.97.99.120`.

```bash
ssh storage-contabo
cd /opt/prin7r-deploys/real-estate-monitor
git pull
docker compose up -d --build
```

The container expects a `.env` file alongside `docker-compose.yml` with the same variable names as
`.env.example`. Live keys live only on the server, never in git.

## Payment flow

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/checkout/nowpayments` | POST | Body `{plan: "single"\|"multi"\|"investor"}` → creates a NOWPayments hosted invoice and returns `{invoice_url, invoice_id}`. Client redirects. |
| `/api/checkout/nowpayments` | GET | Health probe — returns the plan list. |
| `/api/webhooks/nowpayments` | POST | NOWPayments IPN. Verifies `x-nowpayments-sig` (HMAC-SHA512 over alphabetically-sorted JSON). |

Three tiers (`single $39 / mo`, `multi $119 / mo`, `investor $349 / mo`). Click any pricing CTA on
the live landing to open a real unpaid invoice once the server `.env` has live `NOWPAYMENTS_API_KEY`.

## Quality gates (per playbook v2 §D)

See [`DESIGN.md`](./DESIGN.md) §12. Status table in
`/Users/keer/projects/prin7r/wave2-reports/real-estate-monitor.md`.

## License

[MIT](./LICENSE) © Prin7r Projects 2026.
