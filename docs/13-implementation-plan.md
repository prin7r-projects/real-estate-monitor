# 13 · Implementation plan

> **Hand-off ready.** Read `01`, `02`, `11`, `12` first. Phase 0 (landing + checkout) is COMPLETE.
> Phases 1–6 ship ingest + scoring + delivery.
>
> **Repo:** https://github.com/prin7r-projects/real-estate-monitor
> **Live:** https://real-estate-monitor.prin7r.com (landing live as Skyline Watch, milky canvas,
> officevibe ref)
> **Deploy:** storage-contabo `/opt/prin7r-deploys/real-estate-monitor`
> **Secrets:** NOWPAYMENTS_API_KEY, NOWPAYMENTS_IPN_SECRET, POSTMARK_SERVER_TOKEN,
> TELEGRAM_BOT_TOKEN, MAPBOX_TOKEN (or self-host Nominatim), DATABASE_URL, REDIS_URL,
> per-MLS credentials.
> **Tone:** Skyline Watch. Watchful. Editorial. Technical. See `01-brand-identity.md` §Voice.

## Phase 0 — Wave 2 landing + checkout (DONE)

- ✅ Skyline Watch brand; canvas swap to milky #FAFAF8 per officevibe ref; NOWPayments invoice
  flow; screenshots in `/docs/screenshots/`.

## Phase 1 — Postgres+PostGIS schema + Wasp scaffold + profile setup

- **Goal.** Subscriber can sign up + set a profile + see "no matches yet" page.
- **Tasks.**
  1. Wasp scaffold; magic-link auth.
  2. Drizzle migration with PostGIS `geog` columns.
  3. Profile setup form: city, side, budget, bedrooms, radius, extras.
- **Deps.** Phase 0; Postgres + PostGIS.
- **Effort.** 130 tool-uses, 6h.
- **DoD.**
  - Lena can sign up + create a profile in <2 min.

## Phase 2 — Source pollers (3 cities) + normalizer + deduper

- **Goal.** Ingest Lisbon (Idealista), Madrid (Idealista), Berlin (ImmoScout24) every 60s.
- **Tasks.**
  1. Bun + Hono `apps/api`. Poller per source; 60–300s intervals.
  2. Normalizer: per-source field map → canonical `LISTINGS` row.
  3. Deduper: fingerprint by (city, address_norm, sqm, price ±2%, published_at day).
  4. Source health dashboard.
- **Deps.** Phase 1.
- **Effort.** 220 tool-uses, 11h.
- **DoD.**
  - Three sources running; freshness < 5 min p95.
  - Dedup rate < 5% within source; > 90% catch on cross-source duplicates.

## Phase 3 — 7-signal scoring engine + comp baseline

- **Goal.** Every new listing scored against the city's 30-day comp baseline.
- **Tasks.**
  1. Comp baseline: rolling 30-day median ±MAD per (city, side, bedroom-tier, sqm-tier).
  2. 7 signals: residual, cut velocity, DOM context, listing quality, profile fit, freshness,
     anomaly.
  3. Score = weighted sum; threshold to qualify as match per profile.
- **Deps.** Phase 2.
- **Effort.** 200 tool-uses, 10h.
- **DoD.**
  - Lena scenario A end-to-end on a synthetic ingest event with score > threshold.
  - Score reproducible (deterministic given listing + comp).

## Phase 4 — Email + Telegram delivery + match dashboard

- **Goal.** Subscribers receive notifications; can browse past matches in the dashboard.
- **Tasks.**
  1. Match queue → email worker (Postmark) + Telegram worker.
  2. Telegram pairing flow.
  3. Match dashboard with score breakdown.
  4. Pause / resume controls.
- **Deps.** Phase 3.
- **Effort.** 150 tool-uses, 7h.
- **DoD.**
  - Lena receives sub-minute alert end-to-end.
  - Pause stops alerts; subscription billing unchanged.

## Phase 5 — Deep-Watch tier + daily digest + CSV export + anomalies

- **Goal.** Marco's tier ($199/mo) lights up.
- **Tasks.**
  1. Daily digest cron at 09:00 local per profile.
  2. Anomaly flagger (re-list 3× / month, descending price, etc.).
  3. CSV export endpoint with 30-day match history.
- **Deps.** Phase 4.
- **Effort.** 110 tool-uses, 5h.
- **DoD.**
  - Marco scenario B end-to-end.
  - CSV downloads work.

## Phase 6 — Coverage expansion + production polish

- **Goal.** Add Funda (NL), Rightmove (UK), Spitogatos (GR); perf budgets; ops.
- **Tasks.**
  1. New pollers per source; coverage map updated.
  2. Loki + Grafana.
  3. Backups + restore drill.
  4. Lighthouse pass on `/`.
- **Deps.** Phase 2.
- **Effort.** 170 tool-uses, 8h.
- **DoD.**
  - 6 cities live with < 60s p95 ingest-to-notify.

## Cross-cutting concerns

- **Accessibility:** WCAG AA on dashboard.
- **i18n:** EN-only Wave 2/3; PT/ES/DE Wave 4.
- **Mobile:** dashboard mobile-readable.
- **Telemetry:** Phase 1 logs; Phase 6 metrics + alerts.

## Risk register

| Risk | Owner | Mitigation |
|---|---|---|
| Source TOS shift / blocking | Eng + Ops | Polite headers; per-source rotation pool; communicate degraded coverage to subscribers. |
| Comp baseline drift in thin markets | Eng | Per-tier MAD windowing; flag thin segments in score breakdown. |
| Scoring false positives | Eng | Per-profile threshold tuning; subscriber feedback button on email. |
| Geocoder rate limit | Eng | Cache per address; self-host Nominatim as primary in Wave 3. |
| Notification fatigue | Product | Per-profile match cap; daily digest cap when match volume > 50. |

## Resume instructions

1. `git clone https://github.com/prin7r-projects/real-estate-monitor && cd real-estate-monitor`
2. Read `01`, `02`, `11`, `12`.
3. Pick the next phase.
