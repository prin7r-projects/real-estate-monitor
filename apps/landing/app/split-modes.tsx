"use client";

import { useState } from "react";

type Mode = "sale" | "rent";

const COPY: Record<Mode, { kicker: string; headline: string; lede: string; bullets: { h: string; b: string }[] }> = {
  sale: {
    kicker: "Sale-side · for buyers, relocators, investors",
    headline: "Catch the price cut on day zero, not on day twenty-one.",
    lede:
      "We watch every sale listing in your target city, recompute a comp baseline daily, and ping you the moment a unit moves more than two standard deviations below its block. The alert lands before the open house.",
    bullets: [
      {
        h: "Comp-baseline scoring",
        b: "Each listing scored against a same-city, same-bedroom, same-decade comp set. We tell you it's a deal vs. just cheap.",
      },
      {
        h: "Stale-vs-fresh signal",
        b: "Days-on-market and re-list streaks broken out — separate the just-listed gems from the desperate price cuts.",
      },
      {
        h: "Listing-quality filter",
        b: "Photo count + interior-photo presence + description completeness. No more 'walk-in shower' Polaroids of plumbing.",
      },
      {
        h: "Pre-offer comp pack",
        b: "Click any alert to see the comp set we used, the spread, and three 'just-sold' anchors. Walk into the showing armed.",
      },
    ],
  },
  rent: {
    kicker: "Rent-side · for renters, relocators, RTR operators",
    headline: "First-mover advantage on rentals you'd actually sign for.",
    lede:
      "Rentals turn over in hours, not weeks. We poll the same sources every 60 seconds, score against the same-area lease comp set, and push the unit to your phone within minutes — usually before it hits Zillow's index.",
    bullets: [
      {
        h: "Sub-minute push cadence",
        b: "60-second poll on rental sources for paid plans. New listing → score → notification, all inside two minutes on a healthy day.",
      },
      {
        h: "Lease comp baseline",
        b: "€/m² (or $/sqft) plotted against the rolling 90-day district median. Under-market unit jumps to the top of your queue automatically.",
      },
      {
        h: "Amenity gate, not amenity preference",
        b: "Hard filters for must-have items: in-unit laundry, dishwasher, lift, balcony, pets-OK. Listings that don't match never reach you.",
      },
      {
        h: "Cross-city relocation profile",
        b: "Set a profile for each city you're considering — Lisbon, Berlin, Austin, Madrid — and let the queue tell you which market actually has options now.",
      },
    ],
  },
};

export default function SplitModes() {
  const [mode, setMode] = useState<Mode>("rent");
  const data = COPY[mode];

  return (
    <section style={{ padding: "5.5rem 1.5rem", borderTop: "1px solid var(--contour)" }} aria-labelledby="split-heading">
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.4rem", marginBottom: "2rem" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <span className="eyebrow">Both sides of the market</span>
            <h2 id="split-heading" className="headline" style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.6rem)", marginTop: "0.7rem" }}>
              Sale or rent — same pipeline, same scoring discipline.
            </h2>
            <p style={{ color: "var(--graphite)", marginTop: "0.65rem", maxWidth: 720 }}>
              Most listing-alert services pretend rent and sale are the same problem. They aren&rsquo;t. The
              freshness clock is faster on rent, the comp set is finer on sale, and the loss from missing a unit
              is six hours on rent vs. four weeks on sale. We tuned the pipeline for both.
            </p>
          </div>
          <div className="split-tabs" role="tablist" aria-label="Listing mode">
            <button role="tab" aria-selected={mode === "sale"} onClick={() => setMode("sale")}>
              Sale
            </button>
            <button role="tab" aria-selected={mode === "rent"} onClick={() => setMode("rent")}>
              Rent
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "3rem" }} className="split-grid">
          <div>
            <span className="kicker">{data.kicker}</span>
            <h3 className="headline" style={{ fontSize: "clamp(1.4rem, 2.6vw, 2rem)", marginTop: "0.6rem", lineHeight: 1.2 }}>
              {data.headline}
            </h3>
            <p style={{ color: "var(--graphite)", marginTop: "0.85rem", lineHeight: 1.55 }}>{data.lede}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {data.bullets.map((b) => (
              <div key={b.h} style={{ borderLeft: "2px solid var(--clay)", paddingLeft: "1rem" }}>
                <div className="headline" style={{ fontSize: "1.05rem" }}>
                  {b.h}
                </div>
                <div style={{ color: "var(--graphite)", marginTop: "0.25rem", fontSize: "0.93rem" }}>{b.b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 880px) {
          .split-grid { grid-template-columns: 1fr !important; gap: 1.6rem !important; }
        }
      `}</style>
    </section>
  );
}
