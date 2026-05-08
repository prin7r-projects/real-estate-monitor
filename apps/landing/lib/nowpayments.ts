import crypto from "node:crypto";
import { requiredEnv } from "./env";

export type Plan = {
  id: "single" | "multi" | "investor";
  label: string;
  price_usd: number;
  description: string;
};

export const PLANS: Record<Plan["id"], Plan> = {
  single: {
    id: "single",
    label: "Single-city watch",
    price_usd: 39,
    description: "Skyline Watch · Single-city — 1 city, sale OR rent, unlimited profiles, 1-min alerts.",
  },
  multi: {
    id: "multi",
    label: "Multi-city operator",
    price_usd: 119,
    description: "Skyline Watch · Multi-city — up to 5 cities, sale + rent, multi-channel alerts, baseline reports.",
  },
  investor: {
    id: "investor",
    label: "Investor desk",
    price_usd: 349,
    description: "Skyline Watch · Investor — 25 cities, sale + rent + small commercial, comp-set + spread report, API access.",
  },
};

export type CreatedInvoice = {
  invoice_id: string;
  invoice_url: string;
  order_id: string;
  raw: Record<string, unknown>;
};

export async function createNowpaymentsInvoice(plan: Plan, baseUrl: string): Promise<CreatedInvoice> {
  const apiKey = requiredEnv("NOWPAYMENTS_API_KEY");
  const orderId = `skyline_${plan.id}_${Date.now().toString(36)}`;
  const body = {
    price_amount: plan.price_usd,
    price_currency: "usd",
    order_id: orderId,
    order_description: plan.description,
    ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`,
    success_url: `${baseUrl}/?checkout=success&plan=${plan.id}`,
    cancel_url: `${baseUrl}/?checkout=cancelled&plan=${plan.id}`,
    is_fee_paid_by_user: false,
    is_fixed_rate: false,
  };

  const res = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`NOWPayments returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(`NOWPayments invoice creation failed: ${msg}`);
  }

  const invoiceId = String(data.id ?? "");
  const invoiceUrl = String(data.invoice_url ?? "");
  if (!invoiceId || !invoiceUrl) {
    throw new Error("NOWPayments did not return invoice_url/id");
  }
  return {
    invoice_id: invoiceId,
    invoice_url: invoiceUrl,
    order_id: orderId,
    raw: data,
  };
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function timingSafeHex(a: string, b: string) {
  const aL = a.trim().toLowerCase();
  const bL = b.trim().toLowerCase();
  if (aL.length !== bL.length) return false;
  return crypto.timingSafeEqual(Buffer.from(aL, "hex"), Buffer.from(bL, "hex"));
}

export function verifyIpnSignature(payload: unknown, signature: string | null, secret: string) {
  if (!signature) return false;
  const sorted = JSON.stringify(sortObject(payload));
  const expected = crypto.createHmac("sha512", secret.trim()).update(sorted).digest("hex");
  return timingSafeHex(expected, signature);
}
