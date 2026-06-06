import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, getLiveInvoice } from "@/lib/supabase/school-data";
import { generatePaymentReference, hasPaystackConfig, initializePaystackTransaction } from "@/lib/payments/paystack";

export async function POST(request: NextRequest) {
  if (!hasPaystackConfig()) return NextResponse.json({ status: "not_configured", message: "Paystack is not configured. Add PAYSTACK_SECRET_KEY to Vercel environment variables." }, { status: 503 });
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });

  const body = await request.json().catch(() => null) as { invoiceNo?: string; email?: string } | null;
  if (!body?.invoiceNo) return NextResponse.json({ status: "error", message: "invoiceNo is required." }, { status: 400 });

  try {
    const invoice = await getLiveInvoice(supabase, body.invoiceNo.toUpperCase());
    if (!invoice) return NextResponse.json({ status: "error", message: "Invoice not found." }, { status: 404 });
    const balance = Number(invoice.amount ?? 0) - Number(invoice.amount_paid ?? 0);
    if (balance <= 0) return NextResponse.json({ status: "error", message: "Invoice is already fully paid." }, { status: 400 });

    const student = invoice.students as Record<string, unknown> | null;
    const email = body.email || String(student?.guardian_email ?? student?.student_email ?? "");
    if (!email) return NextResponse.json({ status: "error", message: "Payer email is required for Paystack initialization." }, { status: 400 });

    const reference = generatePaymentReference(invoice.invoice_no);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const callbackUrl = `${appUrl}/dashboard/receipts/${reference}`;
    const paystack = await initializePaystackTransaction({
      email,
      amount: balance,
      reference,
      callbackUrl,
      metadata: {
        invoice_no: invoice.invoice_no,
        invoice_id: invoice.id,
        student_id: invoice.student_id,
        organization_id: invoice.organization_id,
      },
    });

    return NextResponse.json({ status: "ok", provider: "paystack", reference, amount: balance, authorizationUrl: paystack.data?.authorization_url });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to initialize payment" }, { status: 500 });
  }
}
