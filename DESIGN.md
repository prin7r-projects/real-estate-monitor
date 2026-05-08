# DESIGN.md — Skyline Watch (`real-estate-monitor`)

> Canonical design + style guide. Owned by Chief of Design. Kept in sync with the live build at
> `apps/landing/`. Last revised 2026-05-08.

## 1. Product and audience

**Product.** Skyline Watch is a market-watch terminal for residential real estate. Subscribers set a
target city, budget, and must-haves &mdash; sale or rent &mdash; and receive scored alerts within minutes
when matching listings appear or move. The product is an alert flow first; the Wave 3 dashboard
deepens it into a live queue.

**Audience.** Three operator archetypes:

| Persona | What breaks for them today |
|---|---|
| **The serious renter / relocator** | Rentals turn over in hours; Zillow's daily index is too slow. Manual refresh of three portals isn't a strategy. |
| **The buyer chasing under-comp listings** | Realtor.com / Redfin are noisy and rank by recency. Real comp work happens after the listing is gone. |
| **The investor / RTR operator / broker** | Needs cross-city, cross-mode coverage with a comp-set on tap. Existing tools either gate everything behind brokerage or only do half the markets. |

Anti-personas: weekend Zillow browsers, no-budget tire-kickers, MLS-licensed agents looking for a
free MLS replacement (we are not an MLS).

## 2. Visual positioning

**Anti-aesthetic** &mdash; what Skyline Watch is **not**:
- No real-estate-app blue gradient.
- No house-icon hero or rooftops illustration.
- No glossy listing carousel with hover-zoom.
- No Zillow-orange dot or Redfin-magenta accents.
- No stock photography of city skylines (the *one* exception we explicitly forbid for this brand).
- No "your home, simplified" tagline pattern. We are not a homebuying coach.

**What it is — Wave 2 design refresh (2026-05-08).** An Electric Data Flow canvas (lifted from
`officevibe`) crossed with a market-watch terminal. The screen reads like a structured insights
operator surface, not a portal: a Soft Off-White canvas (`#F9F8F6`), Boardroom-Navy (`#0C1754`)
typography for headings, a single Brand-Electric blue (`#2545FF`) accent for alert stamps and CTAs,
softly-rounded `16px` cards with subtle shadows, and the live ticker now rendered against a navy
panel. The previous topographic-map / sage-and-clay terra-cotta direction has been retired.

Reference temperament: officevibe's Electric Data Flow — sharp insights meet soft edges,
generous pill buttons (100px radius), and a single confident accent pigment.

## 3. ShadCN baseline and local component policy

The Wave 2 marketing surface uses **hand-rolled Tailwind primitives** that match shadcn class
conventions but do **not** import from `shadcn/ui`. This is a documented exception to the
prin7r-baseline ShadCN rule, narrowly scoped:

- **Why exempt for this surface.** Skyline Watch's marketing page is essentially three custom
  components (alert card, split-tab toggle, pricing tier card) plus copy. Pulling the ShadCN registry
  in for three components adds a bundling cost without giving us a base of buttons/inputs/dialogs we
  re-use; the marketing surface has no inputs and one toggle. The cost/benefit tilts the wrong way
  here.
- **When ShadCN imports begin.** The moment `apps/app/` (the Wave 3 open-saas dashboard) starts —
  that surface needs the full primitive set (button, input, dialog, dropdown, popover, table,
  command palette). ShadCN imports begin there and DESIGN.md §3 will be updated with the vendored
  source paths.
- **No paid/pro UI libraries.** None planned for either surface.
- **Gallery references.** Refero Styles + Skiper UI for marketing-side patterns (split-tab pattern in
  particular). Cult UI inspiration for the alert-card hover state we may add in polish.

## 4. Color tokens

Lifted 2026-05-08 from `design-references/officevibe.md`. Token NAMES preserved from the v1
topographic palette (so existing `page.tsx` / `alert-ticker.tsx` / `split-modes.tsx` /
`pricing-cta.tsx` keep rendering); VALUES remapped to the Electric Data Flow palette.

```
--bone:        #F9F8F6   # surface-0 (Soft Off-White canvas)
--haze:        #EAEBF8   # surface-1 (Light Cool Gray — badge / alt section)
--contour:     #CCCCCC   # divider · hairline · Input Border Gray
--sage:        #0C1754   # primary heading / Boardroom Navy
--sage-deep:   #171417   # Pitch Black variant
--clay:        #2545FF   # Brand Electric · alert stamp · primary CTA · accent
--clay-deep:   #1A2EBC   # Brand Electric darker (hover)
--ink:         #171417   # primary text · masthead text
--graphite:    #222222   # body-secondary · muted (Medium Gray)
--watch:       #0C1754   # dark panel · Boardroom Navy
```

Contrast: `--ink` on `--bone` ≈ 16:1 (WCAG AAA). `#FFFFFF` on `--clay` ≈ 5.4:1 (AA at ≥14px).
`--bone` on `--watch` ≈ 14.6:1.

## 5. Typography

Wave 2 design refresh (2026-05-08) — display face swapped from Fraunces serif → **DM Sans**
(public-CDN substitute for ABC Favorit Variable in `officevibe`'s reference recipe). Inter and
IBM Plex Mono retained.

| Family | Role | Source |
|---|---|---|
| **DM Sans** (400–700, OpenType `ss01`/`ss04`) | Display headlines, tier names, FAQ questions, large alert headlines | Google Fonts (substitute for ABC Favorit Variable) |
| **Inter** (300–700) | Body, descriptions, navigation, CTAs | Google Fonts |
| **IBM Plex Mono** (400–600) | Ticker, kicker labels, signal weights, alert metadata, score pills | Google Fonts |

Headline scale: `clamp(2.4rem, 5.4vw, 4.6rem)` for hero · `clamp(1.8rem, 3.4vw, 2.8rem)` for
section H2 · `1.05rem`–`1.3rem` for in-card titles. Body is `1rem` Inter at 1.55 line-height.
Display headlines tighten to `letter-spacing: -0.05em` at 40px+ per the reference.

The previous editorial-italic moments (`<span class="serif-italic">…</span>`) are retained as a
class for backwards compatibility but now render as Inter italic, not Fraunces — the Electric
Data Flow direction is sans-throughout.

## 6. Spacing, radius, shadows, and borders

- **Spacing scale:** `0.25 / 0.5 / 0.7 / 0.85 / 1.0 / 1.4 / 2.0 / 3.0 / 5.5 rem`. Sections use
  `5.0–5.5rem` of vertical padding, intentionally generous; the build is paginated, not crowded.
- **Radius:** `2px` everywhere. The brand's anti-glossiness extends to corners — full-pill is reserved
  for the split-tab toggle.
- **Borders:** 1 px `--contour` for hairlines and dividers; 1 px `--ink` for the masthead logo border;
  1 px `--clay` for the featured pricing tier.
- **Shadow:** one shadow only, on the alert card: `0 16px 40px -32px rgba(27,31,28,0.3)`. No
  glassmorphism, no inset glows, no drop shadows on text.

## 7. Layout system and responsive rules

Container max-width `1180px` everywhere (`max-w-prose` Tailwind alias). Hero uses a 1.05 / 1.0 grid
desktop, collapses to single-column at ≤880 px. Split-mode section is 1.1 / 1.0 grid, collapses at
≤880 px. Coverage / scoring sections are 1 / 2 grids. Pricing is `repeat(auto-fit, minmax(280px,
1fr))`. Mobile breakpoints tested at 320, 390, 768, 1024, 1440.

Vertical rhythm is anchored by `1.4rem` and `0.85rem`. The `globals.css` explicitly fixes
`signal-row` collapse on ≤720 px so the seven-row scoring table never overflows.

## 8. Component catalog

| Component | File | Used in |
|---|---|---|
| `AlertTicker` | `apps/landing/app/alert-ticker.tsx` | Hero ticker — 12-item deterministic feed, live UTC clock |
| `SplitModes` | `apps/landing/app/split-modes.tsx` | Sale-vs-Rent split-tab section |
| `PricingCta` | `apps/landing/app/pricing-cta.tsx` | NOWPayments invoice button on each tier card |
| `Logo` | inline in `page.tsx` | Topo signet — 36×36 SVG with sage chart-line + clay alert dot |
| `SampleAlertCard` | inline in `page.tsx` | Hero — primary listing card (rent · Lisbon · 90) |
| `SecondaryAlertCard` | inline in `page.tsx` | Hero — secondary listing card (sale · Austin · 92) |
| Tier card | CSS `.tier-card` | Pricing section — featured variant for `multi` |
| Coverage mark | CSS `.coverage-mark` | Coverage chips (sage square + city code) |
| Signal row | CSS `.signal-row` | Scoring explainer (seven 01–07 rows) |
| Channel card | CSS `.channel-card` | Notification channels section |

## 9. Landing page structure

Order, top to bottom:

1. **Masthead** — logo + word-mark + nav + ghost CTA "Start watch".
2. **Hero** — eyebrow → editorial headline with italic "forty-seven seconds" → lede → CTA pair → metric kickers → two stacked alert cards (Rent / LIS-08, Sale / AUS-03) on the right.
3. **Live ticker** — dark panel, 12 items deterministic, animated with `tickerScroll` keyframes.
4. **Sale-vs-Rent split section** — toggle between sale-side and rent-side copy (rent = default).
5. **Coverage strip** — 24 cities (12 US + 12 EU), 10-source list with per-source dedup notes.
6. **7-signal scoring explainer** — table of 01–07 signals + weights.
7. **Notification channels** — 3 cards: Email · Telegram · iOS push (planned).
8. **Pricing** — three tiers, NOWPayments CTA on each. `multi` is the featured tier.
9. **FAQ** — 7 rows.
10. **Footer** — logo + contact + Telegram + repo + legal disclaimer + USD/checkout note.

## 10. Imagery and generated asset rules

The Wave 2 build ships **zero raster images on purpose**. Two SVG assets only:

- `apps/landing/public/icon.svg` — 36×36 topo-signet favicon.
- `apps/landing/public/og-image.svg` — 1200×630 social card with topo lines + the editorial italic
  pull-quote.

Future image policy: any future imagery (e.g. Wave 3 hero photo, app screenshots) goes through the
prin7r-generate-image pipeline (GPT Image 2 backed) at `apps/landing/public/generated/<name>.png`
with a sibling `<name>.prompt.txt`. Background requirement: no people, no skyline photography, no
glossy interiors. Permitted: topo-overlay illustrations, schematic listing-card composites,
dashboard screenshots in dark-watch palette.

## 11. Motion and interaction rules

- **Ticker** — single CSS keyframe `tickerScroll`, 64 s linear, infinite. Hover does not pause it on
  Wave 2 (intentional — the ticker is decorative, not a tooltip surface).
- **Pulse dot** — 1.6 s ease-in-out alternating opacity on `.alert-stamp .pulse`. No translate, no
  scale &mdash; the alert stamp itself never moves.
- **Hover transitions** — `0.18s ease` on the tier CTA hover (background → clay) and split-tab hover
  (color shift). No translateY shifts, no scale, no shadow swells.
- **Reduced motion.** TBD &mdash; `prefers-reduced-motion: reduce` should kill the ticker scroll. Ship
  fix in polish pass; it is not a blocker.

## 12. Accessibility and quality gates

| Gate | Status | Note |
|---|---|---|
| `DESIGN.md` exists at root with all 15 sections | ✅ | This file. |
| ShadCN baseline followed; any exception documented | ✅ | Exception in §3 above (marketing-only). |
| Desktop screenshot at `/docs/screenshots/landing-desktop.png` | ✅ | 1440 × 900 fullPage. |
| Mobile screenshot at `/docs/screenshots/landing-mobile.png` | ✅ | 390 × 844 fullPage. |
| Both screenshots linked in DESIGN.md §13 + embedded in README | ✅ | README has a 2-col table at top. |
| No text overlap or overflow at 320 / 768 / 1024 / 1440 | ✅ | Explicit `signal-row` rule + `hero-grid`/`split-grid` collapse rules. |
| Keyboard focus visible on all interactive elements | ✅ | `a:focus-visible / button:focus-visible` rule pinned to `--clay` outline. |
| All images have meaningful alt | ✅ | No `<img>` ships; `Logo` SVG is `aria-hidden`, the topo grid div is `aria-hidden`. The two SVG files in `public/` carry `aria-label`s. |
| All copy is real (no Lorem ipsum, no TODO) | ✅ | All copy hand-written. One `Wave 3:` comment in the IPN route is a developer-side stub note, not user-visible. |
| `curl -sI <slug>.prin7r.com` returns HTTP/2 200 + valid LE cert | filled at deploy time | See `wave2-reports/real-estate-monitor.md`. |
| NOWPayments CTA produces a real unpaid hosted invoice | filled at deploy time | Live verification recorded in the report. |

## 13. Screenshots and verification artifacts

Both screenshots captured from the live deploy via `scripts/capture-landing-screenshots.mjs`
(Playwright Chromium, `device_scale_factor: 2`, `wait_until: networkidle`). Captured 2026-05-08.

| Path | Viewport | Source URL |
|---|---|---|
| `docs/screenshots/landing-desktop.png` | 1440 × 900 fullPage | https://real-estate-monitor.prin7r.com |
| `docs/screenshots/landing-mobile.png` | 390 × 844 fullPage | https://real-estate-monitor.prin7r.com |

Embedded in:
- `README.md` — top-of-file 2-column table.
- This file — the table directly above is the canonical reference.

## 14. External references and library sources

- Next.js 15.1.4 (App Router, standalone output) — production framework.
- React 19.0.0 — UI runtime.
- Tailwind CSS 3.4.17 — utilities; design tokens live in `globals.css` via CSS variables.
- IBM Plex Mono / Fraunces / Inter — Google Fonts, preconnected in `layout.tsx`.
- `crypto` (Node built-in) — HMAC-SHA512 IPN verification, copied algorithm shape from
  `payments-prototypes/src/lib/signatures.ts`.
- Playwright Chromium — screenshot capture (devDependency in `scripts/`).
- NOWPayments REST API — `POST /v1/invoice` for hosted-invoice creation; IPN signature header is
  `x-nowpayments-sig`, HMAC-SHA512 over JSON-stringified, alphabetically-sorted payload.

No paid UI libraries. No tracking SDKs. No analytics on the marketing surface in Wave 2.

## 15. Changelog

- **2026-05-08 — Wave 2 design refresh — palette + typography lifted from `officevibe` (Electric
  Data Flow).** Direction shifted from topographic-map terra-cotta + sage to Electric Data Flow:
  Soft Off-White canvas (`#F9F8F6`), Boardroom-Navy (`#0C1754`) headings, Brand-Electric
  (`#2545FF`) accent for alert stamps and CTAs, Light-Cool-Gray (`#EAEBF8`) badge surface.
  Display face swapped Fraunces serif → DM Sans (public-CDN substitute for ABC Favorit
  Variable). Card radius increased from 2-3px → 16px; button radius from 2px → 100px pill
  (officevibe's signature). Token NAMES preserved (bone/clay/sage/ink/graphite/haze/contour/watch)
  so existing `page.tsx`, `alert-ticker.tsx`, `split-modes.tsx`, `pricing-cta.tsx` keep rendering
  without code changes — only values remapped.
- **2026-05-08 — Wave 2 initial build.** Brand identity (topo-map technical: sage + clay + ink;
  Fraunces + Inter + IBM Plex Mono). Landing structure across 9 sections. Sale-vs-Rent split-tab.
  NOWPayments hosted-invoice + IPN webhook (HMAC-SHA512). Three-tier pricing
  (`single $39 / multi $119 / investor $349`). Open-saas fork deferred to Wave 3.
