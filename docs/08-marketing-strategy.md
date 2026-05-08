# 08 — Marketing Strategy

## Positioning

> *Skyline Watch is the market-watch terminal for residential real estate. We poll the listing
> sources every 60–180 seconds, score every new sale and rent listing against a local baseline, and
> push the matches inside minutes. Built for people who refuse to keep losing apartments to faster
> Zillow users.*

The positioning sentence anchors three decisions:

1. **Market-watch terminal**, not a portal. We mean *terminal* in the Bloomberg-terminal sense — a
   focused operator surface, not a browseable feed.
2. **Score every new listing**, not every listing. Skyline is an alert tool, not a search engine.
3. **People who refuse to keep losing apartments.** The buyer is already irritated with the status
   quo. Skyline is the reaction, not the introduction.

## Messaging hierarchy

### Tier 1 — the headline (anyone)

> *The listing was on the market for forty-seven seconds when we paged you.*

A specific, falsifiable claim that becomes the brand stamp. The "47s" badge appears on the hero
listing card and in the Twitter avatar.

### Tier 2 — the ledes (different audiences see different ledes)

| Audience | Lede |
|---|---|
| Relocator | *Rentals turn over in hours, not weeks. Skyline polls every 60 seconds and pushes the matches before Zillow has finished re-indexing.* |
| Sale-side buyer | *Catch the price cut on day zero, not on day twenty-one. Comp-baseline residual scored on every listing.* |
| RTR / investor | *Cross-city alerts with a comp-set on tap. API access. Multi-seat. The desk a senior bidder keeps open in the second monitor.* |

### Tier 3 — the proof points

- 7-signal score, weighted; comp-baseline is 0.30, with 6 other signals to prevent gaming.
- 24 cities live. 60 by Q4. Honest about both numbers.
- Sub-minute polling on rent-side primaries. Median 90 s alert latency.
- Sources: MLS / IDX where available + 10 named public portals, deduped at ingest.
- Telegram + email today; native iOS push on the way.

## Content pillars

### Pillar 1 — "What I lost this week"

Weekly anonymized post on the Skyline blog + Telegram + Twitter: "the top-5 listings our
subscribers caught this week, and the comp-context that scored them." Pure proof-of-product. Builds
the credibility that converts the next visitor.

### Pillar 2 — "Comp-set deep dives"

Monthly long-form: a single comp-set walked through publicly. *"Here's how the same-block 3BRs in
Mueller, Austin trade. Here's why the $649k 2nd-cut listing is genuinely under comp."* Builds SEO
authority and gives reluctant buyers a credibility signal.

### Pillar 3 — "How portals fail you"

Bi-monthly: a specific Zillow / Realtor.com / Redfin / Idealista failure mode, named, with
screenshots. Not a hit piece — a forensic. The persona lives this every day; reading our writeup
crystallizes the pain that drives them to subscribe.

### Pillar 4 — "Coverage launch reports"

When a new city goes live, a launch post: "we now monitor Tampa FL with these sources, this dedup
quality, this alert cadence. Expect ~6 alerts/week if your profile is strict." Sets expectations
honestly and earns recurring local-press traction in the launch market.

## Channel mix (recap from doc 06)

Concentrate first 90 days on Reddit AMAs (channel 1), Telegram public channel (channel 3), and RTR
referrals (channel 4). Twitter (channel 2) is a slow voice-build, not a paid push. Brokerage
outbound (channel 5) holds until month 4.

## Tone of voice (recap from doc 01)

Vigilant. Editorial. Technical. One italic pause per landing page. Concrete numbers in every
section. No SaaS pitch-deck voice.

## Brand assets used in marketing

| Asset | Where | Purpose |
|---|---|---|
| Hero alert card (Lisbon / 90) | Landing, Twitter pinned, Telegram channel header | Brand-stamp |
| `MATCHED 47s AGO` badge | All channels | Headline differentiator |
| Topo-signet logo | Favicon, OG image, footer | Identifying mark |
| OG image SVG | Twitter / Reddit shares | Click-through rate |
| Live ticker (animated) | Landing only | Texture + proof |

## Press / mentions playbook

- Goal: 1 quality mention per quarter from a real-estate-finance newsletter (BiggerPockets,
  Multifamily Insiders, Bisnow's morning brief, Lenny's newsletter "real estate" tag).
- No PR firm. Founder-direct outreach. Pitch is always a *specific story* (e.g. "we monitored the
  Mueller submarket for 90 days; here's what cuts looked like vs. the comp baseline"), never a
  product launch.

## Launch sequence (90 days)

| Week | Activity |
|---|---|
| 1 | Landing live (this commit). Telegram public channel opens. Twitter pinned post. |
| 2 | First Reddit AMA in `r/Lisbon`. First "what I lost this week" post on Telegram. |
| 3 | Outbound to 5 RTR-operator Telegram groups (introduce, not push). |
| 4 | First "comp-set deep dive" long-form (Mueller, Austin). Cross-post to BiggerPockets forum. |
| 5–6 | First "how portals fail you" — Idealista's saved-search delay, with screenshots. |
| 7 | Launch second city batch (4 cities). |
| 8 | Twitter monthly market-temp thread. |
| 9 | First brokerage outbound test (10 emails, no push). |
| 10–12 | Iterate; concentrate where conversion rate is best. |

## Success metrics — first 90 days

- Landing visits: 18,000.
- NOWPayments invoices created: 360 (≈ 2% click-to-invoice).
- Paid subscribers: 80 (≈ 22% invoice-to-paid; 0.44% visit-to-paid).
- MRR: ~$8,000.
- Telegram public channel followers: 600.
- Twitter followers: 300.

These are intentionally tight, achievable targets; if any metric materially overshoots, we shift
spend to the channel responsible. If any materially undershoots, we shift away.
