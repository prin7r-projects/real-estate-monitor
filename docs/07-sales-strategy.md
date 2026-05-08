# 07 — Sales Strategy

## Motion: PLG with sales-assist on Investor desk

- **Self-serve** for Single-city ($39) and Multi-city ($119). Sign up → NOWPayments invoice → first
  alert within 24 h. No sales call, no demo.
- **Sales-assist** for Investor desk ($349). Clicking the CTA opens NOWPayments self-serve, but a
  founder-led check-in lands within 48 h to confirm cities, profiles, and API integration. The Wave
  3 multi-tenant dashboard makes this fully self-serve, but in Wave 2 + early-Wave-3 we keep the
  human in the loop.
- **Custom** for brokerages / funds with more than 5 seats or > 25 cities. Email
  `watch@prin7r.com`. Pricing is annual, paid invoice (NOWPayments OR direct stablecoin invoice for
  named B2B customers per playbook v2 §C).

## Pricing tiers (live)

| Tier | Price | Cities | Sale + Rent | Profiles | Channels | Cadence | Comp-set | API | Seats |
|---|---|---|---|---|---|---|---|---|---|
| Single-city | $39 / mo | 1 | sale OR rent | unlimited | email + Telegram | 1-min | per-alert | — | 1 |
| Multi-city operator (★ featured) | $119 / mo | 5 | sale + rent | unlimited | email + Telegram + iOS push | sub-min rent | per-alert + spread | — | 1 |
| Investor desk | $349 / mo | 25 | sale + rent + small commercial | unlimited | all + webhook | sub-min rent | comp-pack on demand | yes | 5 |
| Custom | from $1,500 / mo | 25+ | all sides | unlimited | all + webhook + private feeds | priority | comp-pack + spread report | yes | 5+ |

All tiers: monthly cadence, NOWPayments hosted invoice (USDT / USDC by default), 30-day money-back,
cancel any time by replying "stop" to any alert.

## Pricing rationale

- **$39 / mo single-city.** Anchors the entry point at the low end of B2B SaaS for a "real product"
  perception. One missed apartment costs the user more than a year of subscription.
- **$119 / mo multi-city.** ~3x single-city for 5x cities — explicit volume incentive. This is the
  featured tier because the relocator persona maps directly here.
- **$349 / mo investor desk.** ~3x multi-city for 5x cities + API + multi-seat. Aimed at a persona
  who would otherwise pay $500+/month for Idealista-pro-equivalent or build internal tooling.
- **Custom from $1.5k.** Reserved for brokerages and funds. Not on the landing.

## Objection handling

### "Why crypto checkout? I don't have USDT."

NOWPayments hosts a card on-ramp via their partner network. The user lands on the NOWPayments
hosted page and pays with whatever rail they have — card, USDT, USDC, ETH, BTC. We don't see card
data. The hosted page handles the conversion.

If the user really doesn't want crypto: we accept direct ACH / SEPA invoicing on Investor desk and
above, with a 5% surcharge to cover the operational overhead. We do not push it; most subscribers
are fine with NOWPayments.

### "How do you compete with free Zillow saved-search?"

We don't. Zillow is a portal monetized by ad inventory; their incentive is engagement, not your
decision quality. Skyline is a paid alert tool, optimized only for alert quality. The two products
solve different problems despite looking superficially similar.

If a user genuinely thinks Zillow's daily digest is sufficient, they're not our customer. We don't
try to convert them.

### "I want to see a sample alert before I pay."

Two paths:

1. **Telegram public channel** `@SkylineWatchPublic` posts the day's top-5 scored alerts
   (anonymized: city, score, residual, mode). Free preview of what paid subscribers get on their
   own profiles.
2. **Inline on the landing** — the hero shows two sample alert cards (rent / Lisbon / 90, sale /
   Austin / 92). The shapes and the data fields are exactly what subscribers receive.

### "30 days isn't enough to evaluate."

For Investor desk, we give 60 days on a documented request. We've never needed to extend further.
The reasoning: if the alert flow doesn't fit your market in 30–60 days, it never will.

### "My city isn't on the coverage list."

Honest answer: we won't fake coverage. We launch a city only when we have ≥ 3 source feeds and
dedup quality clears 93%. Email `watch@prin7r.com` with the city; if there's a queue of 20+
requests for the same city, we accelerate launch (typically 4–8 weeks).

### "What's the data quality SLA?"

- Coverage: ≥ 95% of public listings within 6 minutes for tier-1 cities.
- Dedup quality: ≥ 93% per city.
- Alert latency: P50 ≤ 2 min, P99 ≤ 6 min.
- Incidents: any source outage > 30 min triggers a status-page entry. Refunds pro-rated on > 24 h
  outages.

## Conversion funnel target (year 1)

| Step | Target conversion |
|---|---|
| Landing visit → Pricing scroll | 35% |
| Pricing scroll → Click any CTA | 4.5% |
| CTA click → NOWPayments invoice loaded | 95% (server-side) |
| Invoice loaded → Paid | 22% |
| **Net visit-to-paid** | **0.32%** |

A 0.32% landing-to-paid conversion at the prices above gives a healthy CAC payback at any organic
channel and cushions paid acquisition once we know which channels convert.

## Renewal & churn

| Persona | Expected month-1 churn | Month-12 LTV |
|---|---|---|
| Single-city buyer (Anchor) | ~30% (closes the deal, churns) | $80–$160 |
| Multi-city relocator (Lena) | ~7% | $1,000–$1,400 |
| Investor desk operator (Marco) | ~3% | $4,200–$6,300 |

Single-city is intentionally a high-churn / low-LTV / high-volume bucket. Multi-city and Investor
desk drive most revenue.

## What we explicitly don't do

- **Free trial.** Exhausts our cost (sources cost real $) without filtering for serious users.
  30-day money-back is the equivalent.
- **Annual lock-in discount.** Forces commitment in a market where the user might find an apartment
  in week 3 and not need us. Monthly only.
- **Tiered cities.** All cities, all plans. Difference is *how many* you can monitor.
- **Coupon codes / Black-Friday sales.** Cheapens the brand; the persona doesn't shop on price.
