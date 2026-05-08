# 03 — User Journeys

Three journeys, mapping discovery → first value → recurring use. Each ends with the moment the user
stops checking portals and lets Skyline Watch be the queue.

## Journey 1 — Lena (relocator, rent-side primary)

### Discovery

- 06:42, Tuesday. Lena is in r/Lisbon reading a thread about how rentals get taken in 4 hours. A
  comment links to a tweet recommending Skyline Watch with a screenshot of a `MATCHED 47s AGO` alert
  card. She follows the link.
- Lands on `https://real-estate-monitor.prin7r.com`. Hero immediately reads "the listing was on the
  market for forty-seven seconds when we paged you." She's pre-sold.
- She toggles the SALE/RENT split-tab to RENT. Reads the four bullets. Confirms it does what she
  wants for rent-side.
- Scrolls to coverage. Lisbon is in the EU coverage row. ✅
- Scrolls to pricing. Multi-city operator $119 / month covers Lisbon + Berlin + Madrid (she's
  cross-shopping during a Lisbon-or-Madrid tradeoff). Clicks "Start multi-city — $119".
- NOWPayments hosted invoice opens. She pays in USDT.

### First value (T+0 to T+72 hours)

- T+5 min: redirected to `/?checkout=success&plan=multi`. Email arrives (mocked in Wave 2) with the
  signup link to the Wave 3 dashboard. Wave 2 acceptable: she gets a "we'll let you know when the
  dashboard is live, your alerts will start landing within 24h" email.
- T+24 h (Wave 3 path): she sets up two profiles — "LIS-relocate-1" (rent, 1BR + study, ≤1,600 €,
  Estrela / Alvalade / Anjos, must-have laundry + lift) and "MAD-relocate-1" (rent, 2BR, ≤1,900 €,
  Chamberí / Salamanca, must-have lift).
- T+30 h: first alert lands by Telegram. Listing in Estrela, score 87, 3 minutes after first
  detection. She opens the deep-link, schedules a viewing.
- T+72 h: 5 alerts total. 1 viewing scheduled. She has stopped opening Idealista directly.

### Recurring use

- Week 2: she finds a unit. She does not cancel — instead, she pauses the Lisbon profile and keeps
  Madrid + Berlin active for "next time."
- Month 3: she starts a "BCN-tourist-flat-shopping" profile for a 2-week summer trip with her
  partner. Tells two relocator friends.
- Month 6: she upgrades nothing, downgrades nothing. The product hums along at $119 / month.
- LTV expectation: 9–12 months for a relocator persona; longer if they keep multi-city profiles
  active for vacation/relocation flexibility.

## Journey 2 — Marco (RTR operator, sale-side primary)

### Discovery

- Marco is on a paid Idealista pro plan that he resents. A peer in a small Telegram group
  (`@madrid-rtr-operators`) shares a `/comp-pack` screenshot from Skyline. Marco clicks.
- Lands, scrolls fast (he's mobile, on the metro), goes straight to pricing. Investor desk $349 / mo
  with API + 25 cities is exactly the spec he's been looking for.
- Clicks "Start investor desk — $349". Pays USDT.

### First value (T+0 to T+14 days)

- T+0: NOWPayments redirect. Confirmation email.
- T+24h (Wave 3): he sets up profiles for Madrid + Barcelona + Valencia — all three on sale-side,
  3BR+, ≤350k €, must-have lift, listed within last 30 days. He turns ON the API.
- T+5 days: 3 alerts scored ≥85 land on his Slack via the webhook he wired up. One in Carabanchel,
  −€18k cut on day 12, score 88. He goes to view it that evening.
- T+14 days: he has bid on one property and is in due diligence on another. Comp-set view on each
  alert is the difference between guessing and bidding.

### Recurring use

- Month 1: he closes the Carabanchel deal at €298k (asking €316k). Skyline alert told him the cut
  was 2nd-cut at 4.5% velocity; he knew the seller was motivated. He calculates the alert paid for
  itself ~50× over.
- Month 6: he refers two operator friends. One signs up for Investor desk. Skyline now has 1 word-
  of-mouth lead per month from Marco's network.
- LTV expectation: B2B operators churn slowly; 18–36 month retention is realistic if the alert
  quality holds.

## Journey 3 — Anchor (sale-side buyer, single-city)

### Discovery

- Anchor is shopping for a SFH in Austin TX. Has been on Realtor.com daily for 4 months. Tired.
- Sees a Twitter thread about Skyline. Opens. Scrolls. Reads one of the FAQs: "how is this different
  from Zillow saved-search emails?" The answer convinces him.
- Doesn't need multi-city. Picks Single-city watch $39 / mo. Pays USDT.

### First value (T+0 to T+30 days)

- T+24h (Wave 3): sets a profile — Austin, sale, 3BR+, $550k–$700k, Mueller / Bouldin Creek / South
  Congress, must-have garage. Wires email + Telegram.
- T+6 days: a Mueller listing matches. Score 92 (price cut, 2nd cut, anomaly: photo refresh). Anchor
  calls his agent within 20 minutes. They're at the showing the next day.
- T+12 days: he writes an offer 3.5% under list. Accepted. Closes 28 days later.

### Recurring use

- He cancels the moment he closes. Skyline does not push-retain. He'll come back when his sister
  starts looking next year — referral channel.
- LTV expectation: 1–4 months for a single-city buyer. The honest acquisition story for this segment
  is volume, not retention.

## Cross-journey notes

| Journey | Primary channel | Time-to-first-alert (Wave 3 target) | Likely retention |
|---|---|---|---|
| Lena (relocator) | Telegram + email | 24–36 h after profile setup | 9–12 months |
| Marco (RTR) | Slack via API + email | < 24 h, then 3–8 alerts/week | 18–36 months |
| Anchor (single buyer) | Email primarily | 4–10 days after profile setup | 1–4 months |

All three journeys converge on one moment: the user **stops opening listing portals manually**
because the queue contains exactly the listings they would have flagged anyway. That's the product.
