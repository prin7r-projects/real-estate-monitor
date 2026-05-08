# 04 — Pain Points (root-cause)

What's wrong with how listing-shopping currently works. Each named alternative has a specific failure
mode; we list it, then say what Skyline Watch does instead.

## Pain 1 — "I lost the apartment to someone faster"

**Where it happens.** Rent-side, every major EU city, Austin TX, Denver CO, Raleigh NC, anywhere
with a tight rental market.

**Symptom.** A renter sees a listing on Idealista at 09:14, calls at 09:20, is told it has 14
viewings booked.

**Root cause.** Idealista's web index re-ranks listings on a delay; the agent who posted has already
called their pre-existing inquiry list before the listing appears in your saved-search. Your
"alert" is post-hoc — you saw the listing, but only after the people who got it directly from the
agent's CRM.

**Adjacent failure.** Zillow's saved-search emails fire on a daily digest. By the time you open the
email, the listing has been live for 8 hours.

**What Skyline does instead.**
- 60-second poll on rent-side primary sources (Idealista, ImmoScout24, MLS-rent in supported US
  markets).
- Median time-to-notify ~90 seconds from first detection. P99 under 6 minutes.
- The alert lands on Telegram (push) and email — whichever the user has enabled, in parallel.
- The freshness signal in our 7-signal score *boosts* listings caught at lag < 8 minutes; we know
  catching them early is the operational advantage.

## Pain 2 — "Zillow's saved-search digest is noise"

**Symptom.** Buyer opens her morning email; 14 saved-search results, mostly "back on market" or
"price changed by $1." Real cuts buried under churn.

**Root cause.** Zillow ranks by recency, not match quality. A $1 price-change emits a notification.
A 5% cut on a unit deeply matching your profile gets the same prominence.

**Adjacent failure.** Realtor.com and Redfin do the same — they prioritize their own engagement
metrics, not your decision quality.

**What Skyline does instead.**
- Cut velocity is its own scoring signal. A 1.0% cut after 7 days does *not* score well; a 4.5%
  second-cut after 21 days does.
- Hard filters drop sub-threshold listings before they reach you. We aim for 1–4 alerts per profile
  per week, not 14 per day.
- "Match" headline includes the score and the comp-set residual so you can decide in 8 seconds
  whether it's worth opening.

## Pain 3 — "Realtor.com / Redfin keep showing me units I've already seen"

**Symptom.** Buyer scrolls Realtor.com, the first 12 results are listings he saw last week and
explicitly skipped.

**Root cause.** No state. Realtor.com doesn't know which listings you already evaluated and decided
not to pursue.

**What Skyline does instead.**
- Per-profile state. Once you "skip" or "viewed" a listing, the queue drops it.
- Re-list detection: if a "new" listing is the same property re-listed under a new MLS ID, we tag
  it as such and lower its freshness score.
- We don't re-recommend a listing twice.

## Pain 4 — "MLS gatekeeping and broker-portal lock-in"

**Symptom.** Investor wants real comp data. The MLS only gives him a portal walled behind a
brokerage license he doesn't have, and Idealista pro tools are agency-grade ($500+/mo).

**Root cause.** MLS is a brokerage-owned cooperative; access is tied to license and broker
sponsorship. Portal vendors monetize agencies, not buyers / RTR operators.

**What Skyline does instead.**
- We read public-facing portals + MLS data licensed via brokerage partners (where present).
- Comp-set view on every alert: same-city, same-bedroom, same-decade — the same comp shape an MLS
  user would build manually, automated.
- Investor desk gets API access — embed the alerts in your own dashboard / Slack / Notion. We do
  not gate on broker license.

## Pain 5 — "I have to look at three portals because none of them cover everything"

**Symptom.** Buyer in Berlin checks Idealista (sale), ImmoScout24 (sale + rent), Immowelt (rent),
and a friend's WhatsApp tip channel daily.

**Root cause.** Listings fragment across portals. Different agencies post to different platforms.
No portal covers 100% of any city, and they all dedup-fail across each other.

**What Skyline does instead.**
- Per-city dedup keyed on `(lat-rounded, area_m2-rounded, bedroom_count)`.
- Source-tagged: every alert says which portal it came from, so the user can verify.
- 24 cities live, 60 by Q4. Honest about the gap. We don't list a city until we have 3+ source
  feeds and dedup quality clears 93%.

## Pain 6 — "The listings I get are 'cell-phone-of-the-shower' quality"

**Symptom.** Renter receives a saved-search alert. Opens. 1 photo, of a bathroom. No floor plan, no
description longer than 120 characters. Likely a scam or filler.

**Root cause.** No portal filters on listing-quality. Quality information is implicit (photos,
description length) but not surfaced.

**What Skyline does instead.**
- Listing-quality is signal #04 in the 7-signal score. Photo count, interior-photo presence,
  description length, floor-plan attached.
- Listings under a quality threshold simply don't reach the alert layer.
- Wave 3 will add a "quality breakdown" panel in the listing detail view.

## Pain 7 — "I can't tell if a unit is actually a deal or just cheap"

**Symptom.** Buyer sees a 3BR for $649k in Mueller, Austin. Is that good? Bad? She can't tell
without sitting down with comps for 30 minutes.

**Root cause.** Comp work is real work. No portal does it automatically; ranking is by recency,
saved-search, or proprietary "Zestimate" estimates that are notoriously off.

**What Skyline does instead.**
- Comp-baseline residual is the heaviest signal in the 7-signal score (weight 0.30). We compute
  same-city, same-bedroom, same-decade $/sqft (or €/m²) median and the listing's residual against
  it.
- Every alert ships with the comp set used (typically 18–36 active comps).
- The user reads the comp set in 90 seconds and decides.

## Cross-pain insight

Most of these pains share a root cause: **portals optimize for engagement, not for decision
quality.** Skyline Watch's wedge is that we are paid by the user, not by ad inventory or agency
referrals, and so the alert quality bar is the only metric that matters.
