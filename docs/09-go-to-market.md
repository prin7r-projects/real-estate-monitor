# 09 — Go-to-Market — 90-day plan

## Phase 1 — Soft launch (week 1–4)

Goal: prove the alert flow on at least one persona. Optimize for proof, not volume.

### Week 1 (this build)

- Landing live at `https://real-estate-monitor.prin7r.com`. ✅
- NOWPayments hosted invoice for all 3 tiers. ✅
- Telegram public channel `@SkylineWatchPublic` opens with one announcement post.
- Twitter account `@SkylineWatch` pinned post: hero alert card + lede.
- Friends-and-family soft preview: 8 personal-network operators receive a free 1-month Multi-city
  trial in exchange for a written 200-word debrief at end of month.

### Week 2

- Telegram channel posts the first "top-5 of the week" (anonymized).
- Twitter posts a 4-tweet thread: *the math behind the 7-signal score.*
- Reddit AMA in `r/Lisbon` (relocation-themed; Lena-persona density is highest there).
- Inbound rule: founder responds within 6 h to every email.

### Week 3

- Cross-post Reddit AMA learnings to `r/Berlin`.
- Outreach to 5 RTR-operator Telegram groups (introduce, not push). Goal: 1 referrer signing up.
- First long-form post on company blog: "the comp-set behind the $649k Mueller listing." 1,800
  words. Cross-post to BiggerPockets forum.

### Week 4

- Soft-preview group's debriefs in. Apply the top-3 product feedback items in week 5.
- First "how portals fail you" post: Idealista's saved-search delay with timestamps and
  screenshots.
- Begin launch-prep for the second city batch (Tampa, Nashville, Boise, Tallinn).

## Phase 2 — Public launch (week 5–8)

Goal: reach 600 Telegram followers, 300 Twitter followers, 30 paying subscribers.

### Week 5

- Second city batch goes live. Coverage page updated.
- Founder outreach to 3 newsletters with audience overlap. Pitch is the comp-set deep-dive blog
  post; goal is one cross-post.

### Week 6

- Twitter monthly market-temp thread for the active 24 cities. Goal: 80–120 likes; 5+ replies.
- Telegram channel commits to a 5x/week publish cadence (top of the morning + occasional alert
  highlights).
- First-month renewal data lands. Multi-city renewal target: ≥ 92%.

### Week 7

- Second Reddit AMA: `r/AmerExit` (relocator persona density).
- Apply soft-preview feedback batch 2 (typically: alert digest cadence, profile copy edits, comp
  view tweaks).

### Week 8

- Public-channel followers ≥ 600. Twitter ≥ 300. MRR target: $3,000.
- First brokerage outbound test: 10 emails. Goal: 1 reply, 0 push. Treat reply as proof of
  channel-fit.

## Phase 3 — Scale-up (week 9–12)

Goal: 80 paying subs, $8k MRR, the channel mix sorted into "double down" and "park."

### Week 9

- Comparison of channel CAC after 8 weeks. Channels under 3-month CAC payback get amplified.
- Founder outreach to 1 podcast (Bigger Pockets / Realy Funny).

### Week 10

- Second long-form blog post: a Tampa or Nashville comp-set deep-dive, mapping the same framework
  to a different city.
- Third city batch goes live.

### Week 11

- First "what we got wrong" public post. Honest review of false-positive alerts during weeks 1–10.
  Persona converts on humility.

### Week 12

- Phase-3 review. KPIs:
  - Paid subs ≥ 80.
  - MRR ≥ $8k.
  - Telegram public ≥ 1,000 followers.
  - Twitter ≥ 500 followers.
  - Brokerage outbound: 1 paid pilot (Investor desk + multi-seat).

## Activation sequence (per-subscriber)

| Day | Touchpoint |
|---|---|
| T+0 | NOWPayments invoice paid → confirmation email. Wave 3 dashboard link if available, otherwise "we'll email you within 24h with profile setup." |
| T+1 | Profile setup wizard (Wave 3) OR founder-led 15-minute call to set the profile manually (Wave 2 + early-Wave-3). |
| T+2 to T+7 | First alerts land. Founder watches the queue once a day for the first week to catch any quality issues. |
| T+14 | Check-in email. Two-question survey: "are the alerts useful? what's missing?" |
| T+30 | Renewal day. NOWPayments hosted invoice for next month. Cancel button visible. |

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Source rate-limit / TOS pushback.** | Polite poll cadences, brokerage IDX partnerships where possible, fast switch to `if-modified-since` to minimize footprint. Wave 3 priority. |
| **NOWPayments outage during peak signup.** | Plisio backup gateway documented; fallback CTA copy prepared. |
| **City coverage gap turns into churn.** | Honest expectation-setting on the landing + per-city coverage pages. Refund-first policy in week 1. |
| **Persona drift toward Zillow-style browsers.** | Hold pricing at $39 floor. Don't add free tier. Tone stays operator-first. |
| **Latency drift on rent-side P99.** | Status-page commitments + pro-rated refunds on > 24 h outages. |

## What we deliberately do *not* do in the first 90 days

- No paid acquisition.
- No video / TikTok / Instagram presence.
- No "we partner with realtors" affiliate spam.
- No Black-Friday discount (cheapens the brand).
- No mobile app (iOS push beta arrives Q3 only).
- No "AI" branding (the 7-signal model is statistical; calling it AI dilutes accuracy).
