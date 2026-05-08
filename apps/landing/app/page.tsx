import AlertTicker from "./alert-ticker";
import PricingCta from "./pricing-cta";
import SplitModes from "./split-modes";

const COVERAGE_US = [
  "Austin TX",
  "San Antonio TX",
  "Denver CO",
  "Phoenix AZ",
  "Salt Lake UT",
  "Raleigh NC",
  "Charlotte NC",
  "Tampa FL",
  "Miami FL",
  "Nashville TN",
  "Boise ID",
  "Portland OR",
];
const COVERAGE_EU = [
  "Berlin DE",
  "Lisbon PT",
  "Madrid ES",
  "Barcelona ES",
  "Amsterdam NL",
  "Prague CZ",
  "Vienna AT",
  "Tallinn EE",
  "Warsaw PL",
  "Athens GR",
  "Budapest HU",
  "Sofia BG",
];

const SOURCES = [
  { label: "MLS / IDX feeds", note: "via brokerage partner — sale + rent" },
  { label: "Zillow public", note: "polled · dedup against MLS" },
  { label: "Realtor.com / Redfin", note: "secondary read, anomaly cross-check" },
  { label: "ImmoScout24 (DE/AT)", note: "rent + sale, 60s cadence" },
  { label: "Idealista (ES/PT/IT)", note: "rent + sale" },
  { label: "Funda (NL)", note: "sale-side, 90s cadence" },
  { label: "Sreality (CZ)", note: "rent + sale" },
  { label: "Rightmove / Zoopla (UK)", note: "sale + rent" },
  { label: "SeLoger (FR)", note: "sale + rent" },
  { label: "Spitogatos (GR)", note: "rent + sale" },
];

const SIGNALS = [
  {
    n: "01",
    name: "Comp-baseline residual",
    desc: "Same-city, same-bedroom, same-decade $/sqft (or €/m²) median. Listings >2σ under the rolling 90-day baseline jump to the top.",
    weight: "weight 0.30",
  },
  {
    n: "02",
    name: "Price-cut acceleration",
    desc: "Cumulative cuts × cut velocity. Sellers do not cut once and stop — second cuts mean motivation. Detected within minutes.",
    weight: "weight 0.18",
  },
  {
    n: "03",
    name: "Days-on-market context",
    desc: "DOM raw, plus a stale/fresh classifier that distinguishes a listing's real exposure from re-list churn.",
    weight: "weight 0.12",
  },
  {
    n: "04",
    name: "Listing-quality score",
    desc: "Photo count, interior-photo presence, description completeness, floor-plan attached. Filters out 'cell-phone-of-the-shower' listings.",
    weight: "weight 0.10",
  },
  {
    n: "05",
    name: "Match-to-profile fit",
    desc: "Hard filters (rooms, must-have amenities, max budget, district whitelist) plus soft preferences. Soft prefs only ever break ties.",
    weight: "weight 0.14",
  },
  {
    n: "06",
    name: "Freshness gap",
    desc: "Time-since-list at first detection. Beating Zillow's index by 4–10 minutes is the typical edge on rent.",
    weight: "weight 0.10",
  },
  {
    n: "07",
    name: "Anomaly check",
    desc: "Outlier detection vs. the listing's own block — square-footage drift, mis-categorization, photo-mismatch flags. Catches the underpriced listing the seller didn't mean to underprice.",
    weight: "weight 0.06",
  },
];

const FAQ = [
  {
    q: "How is this different from Zillow saved-search emails?",
    a: "Zillow re-emails its own index on a daily cadence and ranks by recency, not match-quality. We poll sources every 60 to 180 seconds, dedup at ingest, and score against an actual local baseline. The first version of this product was built precisely because the lead engineer kept losing rentals to people who were on a different alert system.",
  },
  {
    q: "Do you cover both sale and rent?",
    a: "Yes — both first-class. Rent is on a tighter cadence (sub-minute on paid plans) because rental listings turn over in hours, not weeks. The same scoring engine applies to both, with separate baselines per side of the market.",
  },
  {
    q: "Where does the data come from?",
    a: "MLS/IDX where we have brokerage partnership, Zillow/Realtor.com/Redfin for sale-side cross-check, and the major EU portals (ImmoScout24, Idealista, Funda, SeLoger, Sreality, Rightmove, Zoopla, Spitogatos) for rent + sale. We dedup at ingest and tag every alert with its primary source so you can confirm independently.",
  },
  {
    q: "How fast is 'within minutes'?",
    a: "Median time-to-notify on rent is about 90 seconds from first detection. Sale-side is closer to 4 minutes because we pull a comp-set snapshot before sending. Tail latency on US east-coast and EU prime markets is under 6 minutes for 99% of alerts.",
  },
  {
    q: "Can I run this for clients (broker, RTR operator, relocation consultant)?",
    a: "The Investor desk plan is sized for that — 25 cities, sale + rent + small-commercial, comp-set + spread report on demand, API access for embedding in your own dashboards. We do not gatekeep on B2B usage.",
  },
  {
    q: "Why crypto checkout?",
    a: "Skyline Watch is a global product (we ship alerts in EU, UK, US, LATAM markets day-one). Card processing across that surface is a tax problem; stablecoin checkout is not. NOWPayments hosted invoice gives you USDT/USDC, with card on-ramp where their partner network supports it.",
  },
  {
    q: "What is the refund policy?",
    a: "30-day money-back on every tier. The reasoning: if the alert flow doesn't fit your market in the first month, it never will. We refund first and ask why second.",
  },
];

export default function Page() {
  return (
    <main className="topo-bg">
      {/* MASTHEAD */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.4rem 1.5rem",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <a href="#top" aria-label="Skyline Watch — home" style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <Logo />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontFamily: "Fraunces, serif", fontSize: "1.2rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
              Skyline Watch
            </span>
            <span className="kicker" style={{ marginTop: 4 }}>
              market-watch terminal
            </span>
          </div>
        </a>
        <nav aria-label="Primary" style={{ display: "flex", gap: "1.6rem", alignItems: "center" }}>
          <a href="#how" className="kicker">
            How it works
          </a>
          <a href="#scoring" className="kicker">
            Scoring
          </a>
          <a href="#pricing" className="kicker">
            Pricing
          </a>
          <a href="#pricing" className="tier-cta ghost" style={{ width: "auto", padding: "0.55rem 0.9rem" }}>
            Start watch
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section id="top" style={{ padding: "3.5rem 1.5rem 6rem", position: "relative" }}>
        <div className="topo-grid" aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.45, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: "3.4rem" }} className="hero-grid">
          <div>
            <span className="eyebrow">Real-time market watch · sale + rent</span>
            <h1
              className="headline"
              style={{
                fontSize: "clamp(2.4rem, 5.4vw, 4.6rem)",
                lineHeight: 1.04,
                marginTop: "1rem",
              }}
            >
              The listing was on the market for <span className="serif-italic" style={{ color: "var(--clay-deep)" }}>forty-seven seconds</span> when we paged you.
            </h1>
            <p
              style={{
                color: "var(--graphite)",
                fontSize: "1.1rem",
                lineHeight: 1.55,
                marginTop: "1.4rem",
                maxWidth: 560,
              }}
            >
              Skyline Watch is a market-watch terminal for residential real estate. Set your target city, budget, and
              must-haves &mdash; sale or rent. We poll the sources, score every new listing against a local baseline, and
              push the matches to your inbox and your phone before Zillow has finished re-indexing.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "2rem", flexWrap: "wrap" }}>
              <a href="#pricing" className="tier-cta" style={{ width: "auto", display: "inline-flex", alignItems: "center" }}>
                Start a city watch &mdash; from $39/mo
              </a>
              <a href="#scoring" className="tier-cta ghost" style={{ width: "auto", display: "inline-flex", alignItems: "center" }}>
                See the 7-signal scoring
              </a>
            </div>
            <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", color: "var(--graphite)" }}>
              <div className="kicker">~90s median rent alert</div>
              <div className="kicker">~4m sale alert with comps</div>
              <div className="kicker">24 cities live · 60+ planned</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", alignSelf: "center" }}>
            <SampleAlertCard />
            <SecondaryAlertCard />
          </div>
        </div>
        <div style={{ marginTop: "3.6rem", maxWidth: 1180, margin: "3.6rem auto 0", borderTop: "1px solid var(--contour)", borderBottom: "1px solid var(--contour)" }}>
          <div className="dark-panel" style={{ borderRadius: 2 }}>
            <AlertTicker />
          </div>
        </div>
      </section>

      <SplitModes />

      {/* COVERAGE STRIP */}
      <section
        id="how"
        style={{ padding: "5rem 1.5rem", borderTop: "1px solid var(--contour)", background: "var(--haze)" }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "3rem" }} className="split-grid">
            <div>
              <span className="eyebrow">Coverage</span>
              <h2 className="headline" style={{ fontSize: "clamp(1.7rem, 3vw, 2.4rem)", marginTop: "0.7rem" }}>
                24 cities live. 60 by Q4. Honest about both numbers.
              </h2>
              <p style={{ color: "var(--graphite)", marginTop: "0.9rem", lineHeight: 1.55 }}>
                We launch a city only when at least three independent sources cover it and the dedup quality clears
                93%. Half-coverage is worse than no coverage &mdash; a missed alert is a stolen apartment.
              </p>
            </div>
            <div>
              <div className="kicker" style={{ marginBottom: "0.8rem" }}>US · sale + rent</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginBottom: "1.4rem" }}>
                {COVERAGE_US.map((c) => (
                  <span className="coverage-mark" key={c}>
                    <span className="mark-dot" />
                    {c}
                  </span>
                ))}
              </div>
              <div className="kicker" style={{ marginBottom: "0.8rem" }}>EU · sale + rent</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
                {COVERAGE_EU.map((c) => (
                  <span className="coverage-mark" key={c}>
                    <span className="mark-dot" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: "3rem", borderTop: "1px solid var(--contour)", paddingTop: "1.6rem" }}>
            <div className="kicker">Sources we read · per-city dedup</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.6rem", marginTop: "1rem" }}>
              {SOURCES.map((s) => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", padding: "0.5rem 0", borderTop: "1px dashed var(--contour)" }}>
                  <span style={{ fontFamily: "IBM Plex Mono", fontSize: "0.8rem", color: "var(--ink)" }}>{s.label}</span>
                  <span style={{ fontFamily: "IBM Plex Mono", fontSize: "0.7rem", color: "var(--graphite)" }}>{s.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SCORING EXPLAINER */}
      <section id="scoring" style={{ padding: "5.5rem 1.5rem", borderTop: "1px solid var(--contour)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ maxWidth: 760 }}>
            <span className="eyebrow">The 7-signal score</span>
            <h2 className="headline" style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.8rem)", marginTop: "0.6rem", lineHeight: 1.1 }}>
              Every listing scored 0&ndash;100. Two listings of the same price tell two completely different stories.
            </h2>
            <p style={{ color: "var(--graphite)", marginTop: "0.85rem", lineHeight: 1.55 }}>
              The score is a weighted average of seven signals. Comp-baseline residual is the heaviest weight; the
              other six prevent that one signal from being gamed. The full weight table is below; the implementation
              is open to subscribers in the dashboard.
            </p>
          </div>
          <div style={{ marginTop: "2.5rem" }}>
            {SIGNALS.map((s) => (
              <div key={s.n} className="signal-row">
                <span className="sig-num">{s.n}</span>
                <span className="sig-name">{s.name}</span>
                <span className="sig-desc">{s.desc}</span>
                <span className="sig-weight">{s.weight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHANNELS */}
      <section
        style={{ padding: "5rem 1.5rem", borderTop: "1px solid var(--contour)", background: "var(--haze)" }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <span className="eyebrow">Notification channels</span>
          <h2 className="headline" style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", marginTop: "0.6rem" }}>
            Three rails, one pager.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.1rem", marginTop: "1.8rem" }}>
            <div className="channel-card">
              <span className="ch-tag">Email</span>
              <div className="headline" style={{ fontSize: "1.1rem" }}>
                Inbox · daily summary or push
              </div>
              <p style={{ color: "var(--graphite)", fontSize: "0.92rem" }}>
                Each alert renders as a one-screen card with the comp set, the score, and a direct deep-link to the
                source listing. No tracking pixels, no marketing chrome.
              </p>
              <span className="ch-status">Live · all plans</span>
            </div>
            <div className="channel-card">
              <span className="ch-tag">Telegram</span>
              <div className="headline" style={{ fontSize: "1.1rem" }}>
                Bot · push within seconds
              </div>
              <p style={{ color: "var(--graphite)", fontSize: "0.92rem" }}>
                @SkylineWatchBot pushes the alert as a card with inline buttons: open listing, request comp pack,
                snooze district. The fastest channel for rent matches.
              </p>
              <span className="ch-status">Live · all plans</span>
            </div>
            <div className="channel-card">
              <span className="ch-tag">iOS push</span>
              <div className="headline" style={{ fontSize: "1.1rem" }}>
                Native · planned Q3
              </div>
              <p style={{ color: "var(--graphite)", fontSize: "0.92rem" }}>
                A small native iOS app for subscribers who want the push without joining yet another bot. Beta opens
                to Investor-tier subscribers first.
              </p>
              <span className="ch-status">Beta · invite list open</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "5.5rem 1.5rem", borderTop: "1px solid var(--contour)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <span className="eyebrow">Pricing</span>
          <h2 className="headline" style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.8rem)", marginTop: "0.6rem", lineHeight: 1.1 }}>
            Three tiers. No annual lock-in.
          </h2>
          <p style={{ color: "var(--graphite)", marginTop: "0.7rem", maxWidth: 720 }}>
            Paid via NOWPayments hosted invoice (USDT/USDC, with card on-ramp where their partner network supports
            it). 30-day money-back on every tier. Cancel by replying &ldquo;stop&rdquo; to any alert.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.4rem", marginTop: "2.4rem" }}>
            <article className="tier-card">
              <header>
                <div className="tier-name">Single-city watch</div>
                <span className="kicker">For one specific market</span>
              </header>
              <div className="tier-price">
                <span className="amount">$39</span>
                <span className="unit">/ month · per city</span>
              </div>
              <ul>
                <li>1 city, sale OR rent (your pick)</li>
                <li>Unlimited match profiles</li>
                <li>Email + Telegram alerts, 1-min cadence</li>
                <li>Comp-set view per alert</li>
                <li>Cancel any time</li>
              </ul>
              <PricingCta plan="single" label="Start single-city — $39" />
            </article>
            <article className="tier-card featured">
              <header>
                <div className="tier-name">Multi-city operator</div>
                <span className="kicker">For relocators &amp; serious shoppers</span>
              </header>
              <div className="tier-price">
                <span className="amount">$119</span>
                <span className="unit">/ month · 5 cities</span>
              </div>
              <ul>
                <li>Up to 5 cities, sale + rent on all of them</li>
                <li>Unlimited profiles, sub-minute rent cadence</li>
                <li>Email + Telegram + iOS push (when live)</li>
                <li>Weekly market baseline report per city</li>
                <li>Comp-set + spread on every alert</li>
              </ul>
              <PricingCta plan="multi" label="Start multi-city — $119" />
            </article>
            <article className="tier-card">
              <header>
                <div className="tier-name">Investor desk</div>
                <span className="kicker">For brokers, RTR operators, funds</span>
              </header>
              <div className="tier-price">
                <span className="amount">$349</span>
                <span className="unit">/ month · 25 cities</span>
              </div>
              <ul>
                <li>25 cities, sale + rent + small commercial</li>
                <li>Comp-pack &amp; spread report on demand</li>
                <li>API access (REST + webhook out)</li>
                <li>Multi-seat (up to 5 operators)</li>
                <li>Priority routing, escalation channel</li>
              </ul>
              <PricingCta plan="investor" label="Start investor desk — $349" />
            </article>
          </div>
          <p className="kicker" style={{ marginTop: "1.4rem", color: "var(--graphite)" }}>
            Need a custom multi-tenant deployment for an agency or fund? Email&nbsp;
            <a href="mailto:watch@prin7r.com" style={{ color: "var(--clay-deep)" }}>watch@prin7r.com</a>.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "5rem 1.5rem", borderTop: "1px solid var(--contour)", background: "var(--haze)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <span className="eyebrow">FAQ</span>
          <h2 className="headline" style={{ fontSize: "clamp(1.7rem, 3vw, 2.4rem)", marginTop: "0.6rem" }}>
            What people actually ask before they sign up.
          </h2>
          <div style={{ marginTop: "1.5rem" }}>
            {FAQ.map((row) => (
              <div className="faq-row" key={row.q}>
                <div className="faq-q">{row.q}</div>
                <div className="faq-a">{row.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "3rem 1.5rem 4rem", borderTop: "1px solid var(--contour)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
            <Logo />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: "Fraunces, serif", fontSize: "1.05rem", fontWeight: 600 }}>Skyline Watch</span>
              <span className="kicker" style={{ marginTop: 4 }}>
                a Prin7r product · 2026
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2.4rem", flexWrap: "wrap", color: "var(--graphite)", fontFamily: "IBM Plex Mono", fontSize: "0.78rem" }}>
            <div>
              <div className="kicker" style={{ marginBottom: "0.4rem" }}>Contact</div>
              <a href="mailto:watch@prin7r.com" style={{ color: "var(--ink)" }}>watch@prin7r.com</a>
            </div>
            <div>
              <div className="kicker" style={{ marginBottom: "0.4rem" }}>Telegram</div>
              <a href="https://t.me/SkylineWatchBot" style={{ color: "var(--ink)" }}>@SkylineWatchBot</a>
            </div>
            <div>
              <div className="kicker" style={{ marginBottom: "0.4rem" }}>Repository</div>
              <a href="https://github.com/prin7r-projects/real-estate-monitor" style={{ color: "var(--ink)" }}>
                prin7r-projects/real-estate-monitor
              </a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1180, margin: "2.5rem auto 0", borderTop: "1px solid var(--contour)", paddingTop: "1.4rem", color: "var(--graphite)", fontSize: "0.78rem" }}>
          Skyline Watch is an independent listing-monitoring service. We do not represent buyers, sellers, landlords,
          or tenants in any transaction. We are not a brokerage, MLS, or an investment advisor. Listings remain the
          property of their original sources and are referenced for monitoring only. Pricing in USD; checkout via
          NOWPayments hosted invoice. 30-day money-back on every tier.
        </div>
      </footer>
      <style>{`
        @media (max-width: 880px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2.4rem !important; }
        }
      `}</style>
    </main>
  );
}

function Logo() {
  return (
    <svg width={36} height={36} viewBox="0 0 36 36" aria-hidden="true">
      <rect x="2" y="2" width="32" height="32" fill="none" stroke="#1B1F1C" strokeWidth="1" />
      <path d="M5 26 L9 18 L14 22 L20 12 L25 17 L31 9" stroke="#5E7263" strokeWidth="1.4" fill="none" strokeLinecap="square" />
      <circle cx="20" cy="12" r="2.4" fill="#C8794D" stroke="#1B1F1C" strokeWidth="0.8" />
      <line x1="2" y1="32" x2="34" y2="32" stroke="#1B1F1C" strokeWidth="0.6" />
    </svg>
  );
}

function SampleAlertCard() {
  return (
    <div className="alert-card" role="figure" aria-label="Sample Skyline Watch alert — rental match in Lisbon">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
        <span className="alert-stamp">
          <span className="pulse" aria-hidden="true" />
          MATCHED 47s AGO
        </span>
        <span className="kicker">SKW · LIS-08</span>
      </div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: "1.25rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>
        Estrela · 1BR + study · 1,450 €/mo
      </div>
      <div style={{ color: "var(--graphite)", fontSize: "0.82rem", margin: "0.25rem 0 1rem" }}>
        76 m² · 4th floor · lift · in-unit laundry · listed 3m 12s ago on Idealista
      </div>
      <div className="alert-row">
        <span className="label">Score</span>
        <span className="value tabnums">
          <span className="score-pill">
            score <span className="score-num">90</span>
          </span>
        </span>
      </div>
      <div className="alert-row">
        <span className="label">Comp baseline</span>
        <span className="value tabnums">19,07 €/m² · this listing 19,08 €</span>
      </div>
      <div className="alert-row">
        <span className="label">Vs. district median</span>
        <span className="value tabnums">−9.4% · 22 active comps</span>
      </div>
      <div className="alert-row">
        <span className="label">Freshness</span>
        <span className="value">first-detected · index lag est. ~6 min</span>
      </div>
      <div className="alert-row">
        <span className="label">Match</span>
        <span className="value">profile &ldquo;LIS-relocation-1&rdquo; · 6/6 hard filters</span>
      </div>
      <div style={{ marginTop: "1.05rem" }}>
        <div className="kicker" style={{ marginBottom: 6 }}>Score breakdown</div>
        <div className="score-bar">
          <span style={{ width: "90%" }} />
        </div>
      </div>
    </div>
  );
}

function SecondaryAlertCard() {
  return (
    <div
      className="alert-card"
      role="figure"
      aria-label="Sample Skyline Watch alert — sale price cut in Austin"
      style={{ background: "linear-gradient(180deg, var(--bone) 0%, #f3ecda 100%)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
        <span className="alert-stamp" style={{ background: "var(--ink)" }}>
          <span className="pulse" aria-hidden="true" />
          PRICE CUT · 2nd
        </span>
        <span className="kicker">SKW · AUS-03</span>
      </div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: "1.18rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>
        Mueller · 3BR/2BA SFH · $649,000 ↓ from $673,000
      </div>
      <div style={{ color: "var(--graphite)", fontSize: "0.82rem", margin: "0.25rem 0 1rem" }}>
        2,140 sqft · 2018 build · DOM 28d · 2nd cut · score 92
      </div>
      <div className="alert-row">
        <span className="label">Cut velocity</span>
        <span className="value tabnums">$24k in 9d (3.6%)</span>
      </div>
      <div className="alert-row">
        <span className="label">Comp anchor</span>
        <span className="value tabnums">$303/sqft · block median $317</span>
      </div>
      <div className="alert-row">
        <span className="label">Stale-vs-fresh</span>
        <span className="value">tagged stale · 41d effective DOM</span>
      </div>
      <div className="alert-row">
        <span className="label">Anomaly</span>
        <span className="value">photo-mismatch flag — kitchen reshot 6h ago</span>
      </div>
    </div>
  );
}
