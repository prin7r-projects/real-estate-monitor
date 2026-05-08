import { NextRequest, NextResponse } from "next/server";
import { createNowpaymentsInvoice, PLANS } from "@/lib/nowpayments";
import { MissingEnvError } from "@/lib/env";

// [SKYLINE_NOWPAYMENTS] hosted-invoice route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteBaseUrl(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "real-estate-monitor.prin7r.com";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const planId = body?.plan;
  if (!planId || !(planId in PLANS)) {
    return NextResponse.json(
      {
        error: "unknown_plan",
        message: `Unknown plan: ${planId ?? "(none)"}. Allowed: ${Object.keys(PLANS).join(", ")}.`,
      },
      { status: 400 }
    );
  }

  const plan = PLANS[planId as keyof typeof PLANS];
  console.log("[SKYLINE_NOWPAYMENTS] checkout requested", { plan: plan.id, price_usd: plan.price_usd });

  try {
    const baseUrl = siteBaseUrl(req);
    const invoice = await createNowpaymentsInvoice(plan, baseUrl);
    console.log("[SKYLINE_NOWPAYMENTS] invoice created", {
      plan: plan.id,
      order_id: invoice.order_id,
      invoice_id: invoice.invoice_id,
    });
    return NextResponse.json({
      mode: "live",
      plan: plan.id,
      price_usd: plan.price_usd,
      invoice_id: invoice.invoice_id,
      invoice_url: invoice.invoice_url,
      order_id: invoice.order_id,
    });
  } catch (err) {
    if (err instanceof MissingEnvError) {
      console.warn("[SKYLINE_NOWPAYMENTS] missing_env", { variable: err.variable });
      return NextResponse.json(
        {
          error: "missing_env",
          missing: err.variable,
          message:
            "Skyline Watch is not configured for live checkout on this deployment yet. Email watch@prin7r.com to start your subscription manually.",
        },
        { status: 503 }
      );
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[SKYLINE_NOWPAYMENTS] upstream_error", { message: msg });
    return NextResponse.json({ error: "upstream_error", message: msg }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "skyline-watch.checkout.nowpayments",
      plans: Object.values(PLANS).map((p) => ({ id: p.id, label: p.label, price_usd: p.price_usd })),
    },
    { status: 200 }
  );
}
