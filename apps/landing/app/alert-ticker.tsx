"use client";

import { useEffect, useState } from "react";

// Deterministic mock feed. Wave 3 wires real ingestion.
const FEED: Array<{ kind: "sale" | "rent"; line: string; mode: "match" | "drop" | "fresh" }> = [
  { kind: "sale", line: "AUS · Mueller · 3BR/2BA · −$24k vs Apr · score 92", mode: "drop" },
  { kind: "rent", line: "BER · Friedrichshain · 2-Zi · 1,180 € · score 88", mode: "match" },
  { kind: "sale", line: "DEN · Wash Park · 2BR · stale 41d · score 71", mode: "fresh" },
  { kind: "rent", line: "LIS · Estrela · 1BR · 1,450 € · score 90 · matched 47s ago", mode: "match" },
  { kind: "sale", line: "SAT · Boerne · 4BR/SFH · −$48k 2nd cut · score 95", mode: "drop" },
  { kind: "rent", line: "AMS · De Pijp · 2-zi · €2,180 · 6 photos · score 82", mode: "fresh" },
  { kind: "sale", line: "PHX · Arcadia · 5BR/pool · listed 3m ago · score 89", mode: "fresh" },
  { kind: "rent", line: "BCN · Gràcia · 1BR · €1,520 · returns vs lease comp · score 86", mode: "match" },
  { kind: "sale", line: "MIA · Coconut Grove · 2BR/cond · −$30k · score 78", mode: "drop" },
  { kind: "rent", line: "PRG · Vinohrady · 3+kk · 38,400 Kč · score 91", mode: "match" },
  { kind: "sale", line: "RDU · Five Points · 3BR · returns under comp · score 84", mode: "match" },
  { kind: "rent", line: "MAD · Chamberí · 2BR · €1,890 · score 87 · matched 2m ago", mode: "match" },
];

function dotClass(mode: "match" | "drop" | "fresh") {
  if (mode === "match") return "dot green-dot";
  return "dot";
}

function tag(mode: "match" | "drop" | "fresh") {
  if (mode === "match") return "MATCH";
  if (mode === "drop") return "PRICE−";
  return "FRESH";
}

export default function AlertTicker() {
  // Hydration-safe live clock without locale-dependent randomness
  const [stamp, setStamp] = useState<string>("");
  useEffect(() => {
    function tick() {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      const ss = String(d.getUTCSeconds()).padStart(2, "0");
      setStamp(`${hh}:${mm}:${ss} UTC`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Render twice for seamless scroll
  const items = [...FEED, ...FEED];

  return (
    <div className="ticker-wrap" aria-label="Skyline Watch live alert feed (sample)">
      <div className="ticker-track">
        <span className="ticker-item">
          <span className="dot" />
          <span>FEED · {stamp || "00:00:00 UTC"}</span>
        </span>
        {items.map((item, idx) => (
          <span className="ticker-item" key={idx}>
            <span className={dotClass(item.mode)} />
            <span>
              [{tag(item.mode)}] {item.kind.toUpperCase()} · {item.line}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
