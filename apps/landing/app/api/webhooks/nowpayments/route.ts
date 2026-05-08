import { NextRequest, NextResponse } from "next/server";
import { verifyIpnSignature } from "@/lib/nowpayments";
import { optionalEnv } from "@/lib/env";

// [SKYLINE_NOWPAYMENTS_IPN] hosted-invoice IPN webhook
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = optionalEnv("NOWPAYMENTS_IPN_SECRET");
  if (!secret) {
    console.warn("[SKYLINE_NOWPAYMENTS_IPN] missing_env NOWPAYMENTS_IPN_SECRET");
    return NextResponse.json(
      { error: "missing_env", missing: "NOWPAYMENTS_IPN_SECRET", message: "Webhook handler is not configured." },
      { status: 503 }
    );
  }

  const signature = req.headers.get("x-nowpayments-sig");
  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const verified = verifyIpnSignature(payload, signature, secret);
  if (!verified) {
    console.warn("[SKYLINE_NOWPAYMENTS_IPN] signature_invalid", {
      orderId: payload.order_id,
      paymentId: payload.payment_id,
    });
    return NextResponse.json({ error: "signature_invalid" }, { status: 401 });
  }

  const status = String(payload.payment_status ?? "");
  const orderId = String(payload.order_id ?? "");
  const paid = ["finished", "confirmed", "sending", "partially_paid"].includes(status);
  console.log("[SKYLINE_NOWPAYMENTS_IPN] verified", {
    orderId,
    status,
    paid,
    paymentId: payload.payment_id,
  });

  // Wave 3: persist payment + provision dashboard subscription. Wave 2 stub returns ok.
  return NextResponse.json({
    ok: true,
    verified: true,
    paid,
    order_id: orderId,
    status,
  });
}
