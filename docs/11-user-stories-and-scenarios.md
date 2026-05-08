# 11 · User stories and scenarios

> Skyline Watch is a real-time market-watch terminal for residential rent + sale. Subscribers set
> a profile (city, side, budget, criteria); we ingest sources, score every new listing against a
> local baseline, and page only the matches that beat the comp.

## 1. Personas summary

- **Lena, 34, software engineer relocating Berlin → Lisbon.** Cross-shopping rent (1.3–1.7k €) +
  sale (250–340k €). Wants sub-minute alerts, both sides. — see `05-audience-profile.md` §Lena.
- **Marco, 41, RTR operator with 12-unit short-term portfolio.** Looking for 3–5 acquisitions in
  2026. Wants under-comp listings on day 1. — see `05-audience-profile.md` §Marco.
- **Skyline Watch operator (internal).** Owns ingest source health; replaces broken pollers;
  reviews scoring drift.

## 2. Primary user stories (12)

1. **As Lena**, I want to set a profile (city + budget + bedrooms + radius), so that what I get
   is filtered to my actual constraint.
2. **As Lena**, I want both rent and sale on one profile, so that I'm not running two products.
3. **As Lena**, I want sub-minute notifications on a high-scoring match, so that I beat slower
   competitors to the broker.
4. **As Lena**, I want notifications via email + Telegram, so that I get them on whatever device
   I have at the moment.
5. **As Lena**, I want a score with the listing (e.g., "+18% under comp"), so that I know why this
   one was sent and why others weren't.
6. **As Lena**, I want a stop-flow if I'm under offer or moved, so that the system doesn't keep
   pinging me.
7. **As Marco**, I want a "deep-watch" tier that scores against historical residual data, so that
   I catch under-priced listings vs the 30-day comp.
8. **As Marco**, I want CSV export of last 30 days of matches with scoring breakdown, so that I
   have a record of what passed by.
9. **As Marco**, I want anomaly flags (e.g., listing relisted 3× in a month at descending price),
   so that I see motivated sellers.
10. **As Skyline Watch operator**, I want a queue of "broken pollers" sorted by source freshness
    SLA, so that I fix the freshest-impact source first.
11. **As Skyline Watch operator**, I want a dedup-rate dashboard per source, so that I catch
    when one source starts duplicating another.
12. **As Lena**, I want to update my profile mid-cycle and have it apply to the next ingest, so
    that my changing search reality is honored.

## 3. Main scenarios (happy paths)

### Scenario A — Lena gets a sub-minute alert

1. **Trigger.** Lena saved Lisbon profile yesterday: rent 1.3–1.7k, 1BR + study, 5km radius from
   Estrela.
2. **Steps.**
   1. 13:42:11 — Idealista poller picks up a new listing for Lisbon, 1.4k, 2 rooms, Estrela.
   2. 13:42:14 — normalizer cleans + dedupes (no match in last 24h).
   3. 13:42:18 — scoring engine assigns 7-signal score: residual −18% vs comp; profile fit 0.92.
   4. 13:42:20 — match queue picks it up; email + Telegram dispatched.
   5. 13:42:38 — Lena's phone buzzes.
3. **Success criteria.** End-to-end ingest → notification < 60s p95.
4. **Frontend.** Profile setup, alert email + Telegram, listing detail.
5. **Backend.** Source poller → normalizer → deduper → scoring engine → match queue → email +
   Telegram workers.

### Scenario B — Marco subscribes Deep-Watch, gets daily digest + anomalies

1. **Trigger.** Marco bought Deep-Watch tier ($199/mo).
2. **Steps.**
   1. Profile set across Madrid + Barcelona + Valencia, 60–120k budget, sale only, RTR-suitable
      filters.
   2. Daily 09:00 digest of yesterday's top 10 matches by score.
   3. Anomaly flagged: a Madrid listing relisted 3× in 30d at descending prices.
   4. Marco clicks through, contacts broker, opens negotiation.
3. **Success criteria.** Digest lands daily; anomaly visible; CSV export works.

### Scenario C — Operator fixes a broken poller

1. **Trigger.** Pager: "ImmoScout24 source freshness > 30 min."
2. **Steps.** Operator opens source console; sees poller returning 503; rotates IP / updates
   user-agent; poller resumes; freshness recovers.
3. **Success criteria.** Source freshness < 5 min within 15 min of pager.

### Scenario D — Profile update mid-cycle

1. **Trigger.** Lena's offer falls through; expands radius to 8km.
2. **Steps.** Updates profile via web. Next match on a new ingest applies the wider radius.
3. **Success criteria.** Updated profile applies at next ingest; old matches not re-sent.

### Scenario E — Stop-flow

1. **Trigger.** Lena signs the lease.
2. **Steps.** Hits "pause my profile" in email footer or web. Future matches halted; subscription
   continues until period end.
3. **Success criteria.** No further notifications; subscription billing unchanged.

### Scenario F — Comp baseline backfill

1. **Trigger.** Skyline added a new city (Porto).
2. **Steps.** Backfill job ingests last 90 days from sources; computes comp baseline; new profiles
   in Porto can subscribe.
3. **Success criteria.** Porto profile generates first match within 24h.

## 4. Edge case scenarios

### Edge A — Source returns the same listing on two endpoints

Deduper uses (city, address, sqm, price ±2%, listing date) as a soft fingerprint; cross-source
dupes collapse to one canonical row.

### Edge B — Listing scrubbed (price edited, photos changed)

Re-ingest detects change; if price drop > 5%, a "price-cut" alert fires; otherwise the listing
remains unchanged.

### Edge C — Subscriber timezone

Each profile has `tz`; digest scheduled at 09:00 local. Real-time alerts always fire immediately.

### Edge D — Source TOS shift (poller forbidden)

Source removed from active pool; subscribers notified that "City X coverage degraded; we're
working on a substitute." No silent gaps.

### Edge E — High-volume profile (1k matches/day)

Subscriber pinged with daily digest only, not per-listing, when matches > 50/day. Setting
adjustable per profile.

### Edge F — Geocoding ambiguity

A street name matches two neighborhoods. Listing tagged `geo_uncertain`; not sent until operator
review or auto-resolved by 1 km radius majority.

## 5. Anti-scenarios

1. **No real-PII broker contact info collection.** We do not scrape and persist agent personal
   numbers; only listing-side public contact.
2. **No "AI investment advice."** We score price residual + market signals; we do not predict
   ROI or recommend buy decisions.
3. **No mass-email-to-all-listings.** No spam to listing-side brokers.
4. **No daily-only product.** Real-time is the product; daily digest is opt-in convenience.
5. **No global one-button "rent or sale anywhere."** Subscribers commit to a city / region pool.
