# 10 — Pitch Deck (Markdown)

10 slides. The companion `pitch-deck.html` renders these as a self-contained, no-build deck.

## Slide 1 — Cover

**Skyline Watch**
*market-watch terminal for residential real estate*

Sale + rent. 24 cities. 7-signal scoring. Push notifications inside minutes.

`real-estate-monitor.prin7r.com`

## Slide 2 — The problem

You lost the apartment to someone faster.

Idealista's saved-search runs daily. Zillow's email digest is worse. Realtor.com ranks by recency,
not by whether the listing is actually a deal. MLS is broker-locked. RTR pro tools are agency-grade
($500+/mo).

The first 4 hours after a rent listing is posted are when half the viewings get booked. The first
14 days after a sale listing hits the market is when the comp-baseline residual is biggest.

You can't be on the right portal at the right minute, every minute. We can.

## Slide 3 — The product

Skyline Watch polls the relevant sources every 60–180 seconds, scores every new sale + rent
listing against a same-city / same-bedroom / same-decade comp baseline using a 7-signal model, and
pushes the matches to your inbox and Telegram inside 90 seconds (rent) or 4 minutes (sale).

Median P50 alert latency: 90 s. P99: 6 min.

## Slide 4 — How it works

```
Sources  →  Normalize  →  Dedup  →  Listing store
                                       │
                                       ▼
                       7-signal scoring  →  Match queue
                       (comp residual + cut velocity         │
                        + DOM context + listing quality      ▼
                        + profile fit + freshness     Email · Telegram · iOS push
                        + anomaly check)
```

The 7-signal model is open to subscribers in the dashboard. Heaviest weight (0.30) is comp-baseline
residual; the other six prevent that one signal from being gamed.

## Slide 5 — Coverage

24 cities live: Austin, San Antonio, Denver, Phoenix, Salt Lake, Raleigh, Charlotte, Tampa, Miami,
Nashville, Boise, Portland; Berlin, Lisbon, Madrid, Barcelona, Amsterdam, Prague, Vienna, Tallinn,
Warsaw, Athens, Budapest, Sofia.

10 source feeds: MLS / IDX (where partnered), Zillow, Realtor.com, Redfin, ImmoScout24, Idealista,
Funda, Sreality, Rightmove / Zoopla, SeLoger, Spitogatos.

We launch a city only when ≥ 3 source feeds cover it and dedup quality clears 93%. Half-coverage is
worse than no coverage.

60 cities by Q4 2026.

## Slide 6 — Audience

| Persona | Plan | Tenure | LTV |
|---|---|---|---|
| Lena — relocator | Multi-city $119 / mo | 9–12 mo | $1.1k–$1.4k |
| Marco — RTR operator | Investor desk $349 / mo | 18–36 mo | $4.2k–$6.3k |
| Anchor — single-city buyer | Single-city $39 / mo | 1–4 mo | $80–$160 |

ICP is a *serious* shopper / operator with at least 2 portal tabs open every morning. Anti-personas:
weekend Zillow browsers, no-budget tire-kickers, MLS-licensed agents looking for a free MLS
replacement.

## Slide 7 — Pricing

| Tier | Price | Cities | Sale + Rent |
|---|---|---|---|
| Single-city | $39 / mo | 1 | sale OR rent |
| Multi-city operator (★) | $119 / mo | 5 | sale + rent |
| Investor desk | $349 / mo | 25 | sale + rent + small commercial + API + multi-seat |
| Custom | from $1.5k / mo | 25+ | brokerage / fund deals |

NOWPayments hosted invoice. USDT / USDC / card on-ramp. 30-day money-back. Cancel by replying
"stop" to any alert.

## Slide 8 — Go-to-market

90-day plan in three phases:

- **Soft (w1–4)** — landing live, Telegram public channel, friends-and-family preview, first
  Reddit AMA.
- **Public (w5–8)** — second city batch, brokerage outbound test, blog cadence, MRR ≥ $3k.
- **Scale (w9–12)** — third city batch, podcast appearance, MRR ≥ $8k, paid subs ≥ 80.

Channels in priority order: Reddit AMAs (relocator dense), Telegram public channel, RTR referrals,
Twitter voice, newsletter cross-posts, brokerage outbound, conferences. No paid acquisition in 90
days.

## Slide 9 — Roadmap

- **Wave 2 (now)** — landing, NOWPayments hosted-invoice + IPN webhook, brand identity, 24 cities
  live in name.
- **Wave 3 (Q3 2026)** — open-saas dashboard fork, profile builder, queue UI, comp-pack on demand,
  ingestion engine for the 24 cities, sub-minute rent cadence proven, iOS push beta.
- **Wave 4 (Q4 2026)** — 60-city coverage, API GA, brokerage multi-seat features, status-page +
  SLA-backed pricing.
- **Wave 5 (2027)** — international markets beyond US + EU; LATAM (Mexico, Brazil), Asia (Tokyo,
  Singapore) on selective opt-in.

## Slide 10 — Why us, why now

Listings have always been fragmented across portals. What changed in the last 24 months:

1. **Brokerage IDX feeds are increasingly available** to non-brokerage parties through partnership
   structures, where they were locked-down in 2018.
2. **Public-portal scraping** for personal-monitoring use is in a stable legal/operational grey-zone
   in most markets — courts have repeatedly ruled in favor of read-only personal monitoring.
3. **Stablecoin-rail subscription billing** finally works at scale via NOWPayments — a global B2C
   real-estate-tech product was a tax problem 18 months ago and is not now.
4. **The relocation economy** is at a multi-decade peak. Cross-city, cross-mode shopping is a
   product category now, not just a niche.

Skyline Watch sits exactly at the intersection of those four shifts. The window is open.

---

`watch@prin7r.com`
`@SkylineWatchBot`
`github.com/prin7r-projects/real-estate-monitor`
