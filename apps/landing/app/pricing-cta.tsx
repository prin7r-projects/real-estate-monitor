"use client";

import { useState } from "react";

type Plan = "single" | "multi" | "investor";

type Props = {
  plan: Plan;
  label: string;
};

type Resp =
  | {
      mode: "live";
      plan: string;
      price_usd: number;
      invoice_id: string;
      invoice_url: string;
      order_id: string;
    }
  | { error: string; message?: string; missing?: string };

export default function PricingCta({ plan, label }: Props) {
  const [pending, setPending] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setErrMsg(null);
    try {
      const res = await fetch("/api/checkout/nowpayments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as Resp;
      if ("invoice_url" in data) {
        window.location.href = data.invoice_url;
        return;
      }
      // Surface a friendly fallback for the operator while live keys land
      if ((data as { error: string }).error === "missing_env") {
        window.location.href = `mailto:watch@prin7r.com?subject=Skyline%20Watch%20%E2%80%94%20${plan}%20plan&body=I%27d%20like%20to%20start%20the%20${plan}%20plan%20on%20Skyline%20Watch.`;
        return;
      }
      setErrMsg(
        (data as { message?: string }).message ?? "Could not open checkout. Please try again or email watch@prin7r.com."
      );
    } catch {
      setErrMsg("Network error. Please try again or email watch@prin7r.com.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" className="tier-cta" onClick={handleClick} disabled={pending} aria-label={label}>
        {pending ? "Opening invoice…" : label}
      </button>
      {errMsg ? (
        <p className="kicker" style={{ color: "var(--clay-deep)", marginTop: "0.4rem" }}>
          {errMsg}
        </p>
      ) : null}
    </>
  );
}
