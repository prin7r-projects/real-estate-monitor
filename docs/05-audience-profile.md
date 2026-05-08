# 05 — Audience Profile

## ICP — operator profile

**Who.** Someone serious about a residential real-estate decision (rent or buy) in the next 90 days.
Treats listing-shopping as work. Currently has at least 2 portal tabs open.

**Demographics.** 28–55. Software engineer, designer, lawyer, doctor, founder, RTR operator,
mid-career professional. Median household income $90k–$300k (US) or €60k–€180k (EU).

**Geographic.** Living in or relocating into a tight market: Austin, Denver, Raleigh, Tampa, Miami,
Phoenix, Salt Lake (US); Berlin, Lisbon, Madrid, Barcelona, Amsterdam, Prague, Warsaw, Tallinn (EU).

**Mindset.** Will pay $39–$349 / month for a tool that pays for itself. Has bought a $1k Bloomberg
terminal subscription, an MLS portal seat, or a Notion Plus account before. Sees software as a
budget item, not a cost.

## Persona 1 (primary) — Lena, the relocator

| Field | Value |
|---|---|
| Age / role | 34 · staff software engineer |
| Where | Berlin → Lisbon, in 6 weeks |
| Goal | 1BR + study, 1,300–1,700 €, Estrela / Alvalade / Anjos |
| Currently uses | Idealista (multiple saved searches), ImmoScout24, WhatsApp groups, Reddit |
| Frustrations | Idealista's saved-search is daily; rentals turn over in 4 hours; she missed two units last week |
| Channels she lives in | Telegram (relocation groups), Reddit (`r/IWantOut`), email |
| Buying authority | Self · pays personally |
| Plan she'll buy | Multi-city operator $119 / mo (Lisbon + Madrid + Berlin) |
| Likely tenure | 9–12 months (keeps profiles active for "next move") |

## Persona 2 (secondary) — Marco, the RTR operator

| Field | Value |
|---|---|
| Age / role | 41 · runs 12-unit short-term rental portfolio |
| Where | Madrid + Barcelona + Valencia |
| Goal | 3–5 acquisitions in 2026, 3BR+, ≤350k €, must-have lift |
| Currently uses | Idealista pro (resents the cost), Excel comps, accountant tip-off network |
| Frustrations | Idealista pro is agency-grade; broker-locked MLS gives him nothing useful; he loses listings to faster operators |
| Channels he lives in | WhatsApp brokers, Telegram operator group, his own Slack |
| Buying authority | Sole proprietor · expenses against rental income |
| Plan he'll buy | Investor desk $349 / mo (3 cities now, more later) |
| Likely tenure | 18–36 months |

## Anti-personas (we explicitly do not optimize for these)

### Anti-persona 1 — the weekend Zillow browser

A 27-year-old browsing Zillow on Sunday afternoon "to dream." Not actively shopping, no budget set,
no profile. Will not pay $39 / mo. Will churn in week 1.

**How we exclude them.** Pricing starts at $39 / mo with a clearly-stated 30-day money-back. The
landing's tone is "operator," not "dreamer." The eyebrows say "for serious buyers, renters,
investors burned by stale data."

### Anti-persona 2 — the no-budget tire-kicker

Wants Skyline Watch for free, will not pay anything. Wants alerts but doesn't want to commit to
even a city.

**How we exclude them.** No free tier. Single-city plan starts at $39 / mo, billed monthly. If
$39 / month is too high to justify, the user hasn't yet accepted that they're shopping seriously —
they should keep using Zillow.

### Anti-persona 3 — the MLS-licensed agent looking for a free MLS replacement

Realtors who hope Skyline can replace their MLS portal. We're not an MLS. We don't have the
listings the MLS does, and we have no plans to. We monitor public listings + brokerage IDX feeds
where we have partnership.

**How we exclude them.** Pricing tiers are framed for *buyers / renters / investors*, not for
brokerage operations. Investor desk's API doc is for embedding alerts in operator dashboards, not
for sub-licensing listing data.

## Channel mapping

| Persona | Primary channel | Secondary | Lifetime contact frequency |
|---|---|---|---|
| Lena (relocator) | Telegram bot push | Email | 3–8 alerts / week peak |
| Marco (RTR) | Slack via API webhook | Email | 5–12 alerts / week steady |
| Anchor (single-city buyer) | Email | Telegram bot push | 1–3 alerts / week |

## Sizing the addressable market

| Segment | Estimated active monthly buyers/renters | % addressable | Skyline TAM (mo) |
|---|---|---|---|
| US tier-2 cities (24 we cover at launch + 60 planned) | ~2.4M serious shoppers / month | 1.0% capturable | ~24,000 customers / mo |
| EU primary cities (12 covered + 24 planned) | ~1.6M serious shoppers / month | 1.5% capturable | ~24,000 customers / mo |
| RTR operators (US + EU + LATAM) | ~80,000 active operators | 4.0% capturable | ~3,200 customers / mo |

These are intentionally cautious estimates. The 1% / 1.5% / 4% capture rates are the operator-tier
adoption realistic ceiling, not a near-term forecast. Year-1 target is ~1,200 paying subscribers
across all three personas.
