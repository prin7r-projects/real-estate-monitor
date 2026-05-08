# 01 — Brand Identity

## Brand pyramid

| Layer | Value |
|---|---|
| **Essence** | *Vigilance.* |
| **Personality** | Watchful · Editorial · Technical |
| **Values** | Freshness over polish · Signal over noise · Honest coverage |
| **Attributes** | Topo-map · Newsroom · Terminal · Field-report · Anti-glossy |

## Positioning statement

For serious renters, buyers, and investors who lose listings to slower competitors, **Skyline Watch**
is a *real-time market-watch terminal* that scores every new sale and rent listing against a local
baseline and pages you within minutes &mdash; unlike Zillow's saved-search digest, Realtor.com's
recency-ranked clutter, and broker-locked MLS portals, **because we read all the relevant sources,
dedup at ingest, and send only the matches that actually beat the comp.**

## Audience persona

### Primary — Lena, the relocator (rent + sale)

- 34, software engineer, moving Berlin → Lisbon for a job. Cross-shopping rentals (1,300–1,700 €) and
  sale (250–340k €). Has tabs open in Idealista and ImmoScout24 every morning at 06:30.
- **Goal:** find a 1BR + study before the relocation date in 6 weeks. Doesn't care about hand-holding;
  cares about not missing a listing.
- **Frustrations:** Zillow doesn't cover Lisbon. Idealista's saved search is daily. WhatsApp brokers
  send irrelevant listings. Friends-of-friends "I know a place" channel has dried up.
- **Channels she lives in:** Telegram (relocation groups), Reddit (`r/IWantOut`, `r/Lisbon`), email,
  Idealista app push.
- **Why Skyline:** sub-minute alerts on rent + sale, both sides, scored, with comp baseline. She
  configures one profile per side and stops checking portals.

### Secondary — Marco, the small-portfolio RTR operator

- 41, runs a 12-unit short-term rental portfolio across Madrid + Barcelona + Valencia. Looking for
  3–5 acquisition targets in 2026.
- **Goal:** catch under-comp listings on day 1. Lose interest after day 7.
- **Frustrations:** Idealista pro tools are agency-grade and cost a lot. He paid for one and got a
  lead-gen funnel for renters, not a buyer's tool.
- **Channels:** WhatsApp brokers, his own Excel comp-set spreadsheet, his accountant's tip-off
  network, two Telegram channels.
- **Why Skyline:** the Investor desk plan covers all three of his cities, gives him the comp-set on
  every alert, and an API to feed his own dashboard.

## Voice & tone

| Do's | Don'ts |
|---|---|
| Vigilant, never breathless | "Don't miss out" / FOMO copy |
| Editorial, with one italic pause per page | Generic SaaS landing-page voice |
| Specific numbers (47 s, 90, −9.4%) | Vague qualifiers ("amazing matches") |
| Honest about the gaps (24 cities live, 60 by Q4) | Faking coverage we don't have |
| Use "we" sparingly, "you" plenty | "Our AI-powered platform" |
| Treat the user as an operator | Treat the user as a homebuying coach |

**Sample sentence (do).** *The listing was on the market for forty-seven seconds when we paged you.*
**Sample sentence (don't).** *Skyline Watch's revolutionary AI helps you find your dream home faster than ever.*

## Visual system

### Palette — "topo-map technical"

| Role | Hex | Use |
|---|---|---|
| Bone (paper) | `#EFE8DA` | Primary surface |
| Haze (paper-2) | `#D5CDB9` | Alternating section background |
| Contour | `#A39A82` | Hairline dividers, 1 px lines |
| Sage | `#5E7263` | Topo-map line work, primary muted |
| Sage-deep | `#3F4F44` | Hover shade for sage |
| Clay | `#C8794D` | Alert/signal — `MATCHED 47s`, primary CTA |
| Clay-deep | `#9C5A36` | Error / "PRICE−" |
| Ink | `#1B1F1C` | Primary text, masthead |
| Graphite | `#4B5050` | Secondary body text |
| Watch | `#1F2A23` | Dark-mode terminal panel (ticker) |

### Typography pair

- **Display:** [Fraunces](https://fonts.google.com/specimen/Fraunces) (300–700, italic; opsz 9–144).
- **Body:** [Inter](https://fonts.google.com/specimen/Inter) (300–700).
- **Mono:** [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (400–600).

### Logo concept

Topo-signet — a 36 × 36 framed mark. Inner content is a sage-coloured chart line tracing five points
(low-low-mid-low-mid-high) with a clay-orange "alert dot" at the highest peak. Black 1 px frame, 1 px
underline. Reads as "watching the chart move." Implementation in `apps/landing/app/page.tsx` and
`apps/landing/public/icon.svg`.

### Spacing / radius / motion

- Spacing scale: `0.25 / 0.5 / 0.7 / 0.85 / 1.0 / 1.4 / 2.0 / 3.0 / 5.5 rem`.
- Radius: 2 px everywhere; full-pill only on the split-tab toggle.
- Motion: ticker scroll (64 s linear infinite), pulse dot (1.6 s ease-in-out). No hover translates,
  no scale, no parallax.

## Forbidden

- Real-estate-app blue gradient.
- Stock photography of city skylines, rooftops, or interiors.
- Zillow-orange or Redfin-magenta accents.
- "Find your dream home" / "your home, simplified" copy patterns.
- Mimicking Linear / Vercel / Anthropic visual identities.
