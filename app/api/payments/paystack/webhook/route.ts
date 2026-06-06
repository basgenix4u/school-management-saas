import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, recordVerifiedPayment } from "@/lib/supabase/school-data";
import { verifyPaystackSignature } from "@/lib/payments/paystack";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(rawBody, signature)) return NextResponse.json({ status: "invalid_signature" }, { status: 401 });
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured" }, { status: 503 });

  const event = JSON.parse(rawBody) as { event?: string; data?: Record<string, unknown> };
  if (event.event !== "charge.success" || !event.data) return NextResponse.json({ status: "ignored" });

  try {
    const data = event.data;
    const metadata = (data.metadata ?? {}) as Record<string, unknown>;
    const invoiceNo = String(metadata.invoice_no ?? "");
    if (!invoiceNo) return NextResponse.json({ status: "ignored", message: "Missing invoice_no metadata" });
    const amount = Number(data.amount ?? 0) / 100;
    const customer = data.customer as Record<string, unknown> | undefined;
    const payerEmail = customer?.email ? String(customer.email) : undefined;
    const reference = String(data.reference);
    const record = await recordVerifiedPayment(supabase, { invoiceNo, reference, amount, provider: "paystack", payerEmail, metadata });
    return NextResponse.json({ status: "recorded", record });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Webhook processing failed" }, { status: 500 });
  }
}
