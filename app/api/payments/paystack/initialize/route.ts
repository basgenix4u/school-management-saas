import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { withSession } from "@/lib/auth/api-guard";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getLiveInvoice } from "@/lib/supabase/school-data";
import { generatePaymentReference, hasPaystackConfig, initializePaystackTransaction } from "@/lib/payments/paystack";
import { invalidInputResponse, paystackInitializeSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

/**
 * Starts a Paystack checkout for an issued invoice.
 *
 * Authenticated: any signed-in member may pay, but the lookup runs through
 * their own school's rows, so a number from another school can never
 * resolve here — guessing across schools by email would risk charging the
 * wrong family. After payment the payer returns to the surface they came
 * from: portals for portal roles, finance for staff.
 */
export const POST = withSession(async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "paystack-initialize"), { limit: 30, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  if (!hasPaystackConfig()) return NextResponse.json({ status: "not_configured", message: "Paystack is not configured. Add PAYSTACK_SECRET_KEY to Vercel environment variables." }, { status: 503 });
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });

  const parsed = paystackInitializeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  const body = parsed.data;

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
    const landing = context.role === "STUDENT"
      ? `/portal/receipts/${reference}?from=student`
      : context.role === "PARENT"
        ? `/portal/receipts/${reference}?from=parent`
        : `/dashboard/receipts/${reference}`;
    const paystack = await initializePaystackTransaction({
      email,
      amount: balance,
      reference,
      callbackUrl: `${appUrl}${landing}`,
      metadata: {
        invoice_no: invoice.invoice_no,
        invoice_id: invoice.id,
        student_id: invoice.student_id,
        organization_id: invoice.organization_id,
      },
    });

    return NextResponse.json({ status: "ok", provider: "paystack", reference, amount: balance, authorizationUrl: paystack.data?.authorization_url });
  } catch (error) {
    return apiError("POST /api/payments/paystack/initialize", error);
  }
});
