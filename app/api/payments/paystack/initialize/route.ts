import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, listLiveInvoicesByNo } from "@/lib/supabase/school-data";
import { generatePaymentReference, hasPaystackConfig, initializePaystackTransaction } from "@/lib/payments/paystack";
import { invalidInputResponse, paystackInitializeSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "paystack-initialize"), { limit: 30, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  if (!hasPaystackConfig()) return NextResponse.json({ status: "not_configured", message: "Paystack is not configured. Add PAYSTACK_SECRET_KEY to Vercel environment variables." }, { status: 503 });
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });

  const parsed = paystackInitializeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  const body = parsed.data;

  try {
    // Numbers repeat across schools and this lookup bypasses RLS, so matches
    // are disambiguated by the payer's address against the invoice's family.
    // Every failure answers identically to avoid leaking which numbers exist.
    const notFound = () => NextResponse.json({ status: "error", message: "Invoice not found." }, { status: 404 });
    const matches = await listLiveInvoicesByNo(supabase, body.invoiceNo.toUpperCase());
    if (!matches.length) return notFound();
    const payerEmail = body.email?.toLowerCase().trim() ?? "";
    const familyEmails = (row: (typeof matches)[number]) => {
      const family = row.students as Record<string, unknown> | null;
      return [family?.guardian_email, family?.student_email].map((value) => String(value ?? "").toLowerCase().trim()).filter(Boolean);
    };
    const invoice = payerEmail
      ? matches.find((row) => familyEmails(row).includes(payerEmail))
      : matches.find((row) => familyEmails(row).length > 0) ?? (matches.length === 1 ? matches[0] : undefined);
    if (!invoice) return notFound();
    const balance = Number(invoice.amount ?? 0) - Number(invoice.amount_paid ?? 0);
    if (balance <= 0) return NextResponse.json({ status: "error", message: "Invoice is already fully paid." }, { status: 400 });

    const student = invoice.students as Record<string, unknown> | null;
    const email = payerEmail || String(student?.guardian_email ?? student?.student_email ?? "");
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
