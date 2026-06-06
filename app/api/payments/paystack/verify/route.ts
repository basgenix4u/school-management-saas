import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, recordVerifiedPayment } from "@/lib/supabase/school-data";
import { hasPaystackConfig, verifyPaystackTransaction } from "@/lib/payments/paystack";

export async function POST(request: NextRequest) {
  if (!hasPaystackConfig()) return NextResponse.json({ status: "not_configured", message: "Paystack is not configured." }, { status: 503 });
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });

  const body = await request.json().catch(() => null) as { reference?: string } | null;
  if (!body?.reference) return NextResponse.json({ status: "error", message: "reference is required." }, { status: 400 });

  try {
    const verification = await verifyPaystackTransaction(body.reference);
    if (verification.data?.status !== "success") return NextResponse.json({ status: "pending", verification });
    const metadata = verification.data.metadata ?? {};
    const invoiceNo = String(metadata.invoice_no ?? "");
    if (!invoiceNo) throw new Error("Paystack metadata is missing invoice_no.");
    const amount = Number(verification.data.amount ?? 0) / 100;
    const payerEmail = verification.data.customer?.email;
    const record = await recordVerifiedPayment(supabase, { invoiceNo, reference: verification.data.reference, amount, provider: "paystack", payerEmail, metadata });
    return NextResponse.json({ status: "verified", verification: verification.data, record });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to verify payment" }, { status: 500 });
  }
}
