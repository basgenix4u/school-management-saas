import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { announcementHtml, hasResendConfig, sendEmail } from "@/lib/email/resend";
import { recordCommunicationDelivery } from "@/lib/supabase/school-data";
import { invalidInputResponse, sendEmailSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

export const POST = withAuth("announcements.manage", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "communications-send"), { limit: 20, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  if (!hasResendConfig()) return NextResponse.json({ status: "not_configured", message: "Email delivery is not configured. Add RESEND_API_KEY and EMAIL_FROM to Vercel environment variables." }, { status: 503 });

  const parsed = sendEmailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  const body = parsed.data;
  const recipients = [...new Set(body.recipients.split(/[\n,;]/).map((email) => email.trim().toLowerCase()).filter(Boolean))];
  if (!recipients.length) return NextResponse.json({ status: "error", code: "invalid_input", message: "At least one recipient email is required." }, { status: 400 });
  if (recipients.length > 500) return NextResponse.json({ status: "error", code: "invalid_input", message: "Send to at most 500 recipients at a time." }, { status: 400 });
  const malformed = recipients.find((email) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
  if (malformed) return NextResponse.json({ status: "error", code: "invalid_input", message: `Invalid recipient email: ${malformed}` }, { status: 400 });

  try {
    const result = await sendEmail({ to: recipients, subject: body.subject, html: announcementHtml(body.subject, body.body), text: body.body });
    const providerId = result.data?.id;
    const deliveries = [];
    for (const recipient of recipients) {
      deliveries.push(await recordCommunicationDelivery(supabase, { announcementId: body.announcementId, recipientEmail: recipient, subject: body.subject, status: "sent", provider: "resend", providerMessageId: providerId, metadata: { resend: result.data ?? null } }, { email: context.user.email, role: context.role }));
    }
    return NextResponse.json({ status: "sent", provider: "resend", recipients: recipients.length, deliveries });
  } catch (error) {
    for (const recipient of recipients) {
      await recordCommunicationDelivery(supabase, { announcementId: body.announcementId, recipientEmail: recipient, subject: body.subject, status: "failed", provider: "resend", errorMessage: error instanceof Error ? error.message : "Email failed" }, { email: context.user.email, role: context.role }).catch(() => null);
    }
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to send email" }, { status: 500 });
  }
});
