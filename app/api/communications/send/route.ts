import { NextRequest, NextResponse } from "next/server";
import { announcementHtml, hasResendConfig, sendEmail } from "@/lib/email/resend";
import { configuredOrNull, recordCommunicationDelivery } from "@/lib/supabase/school-data";

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  if (!hasResendConfig()) return NextResponse.json({ status: "not_configured", message: "Email delivery is not configured. Add RESEND_API_KEY and EMAIL_FROM to Vercel environment variables." }, { status: 503 });

  const body = await request.json().catch(() => null) as { announcementId?: string; subject?: string; body?: string; recipients?: string } | null;
  if (!body?.subject || !body?.body || !body?.recipients) return NextResponse.json({ status: "error", message: "subject, body and recipients are required." }, { status: 400 });
  const recipients = body.recipients.split(/[\n,;]/).map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!recipients.length) return NextResponse.json({ status: "error", message: "At least one recipient email is required." }, { status: 400 });

  try {
    const result = await sendEmail({ to: recipients, subject: body.subject, html: announcementHtml(body.subject, body.body), text: body.body });
    const providerId = result.data?.id;
    const deliveries = [];
    for (const recipient of recipients) {
      deliveries.push(await recordCommunicationDelivery(supabase, { announcementId: body.announcementId, recipientEmail: recipient, subject: body.subject, status: "sent", provider: "resend", providerMessageId: providerId, metadata: { resend: result.data ?? null } }));
    }
    return NextResponse.json({ status: "sent", provider: "resend", recipients: recipients.length, deliveries });
  } catch (error) {
    for (const recipient of recipients) {
      await recordCommunicationDelivery(supabase, { announcementId: body.announcementId, recipientEmail: recipient, subject: body.subject, status: "failed", provider: "resend", errorMessage: error instanceof Error ? error.message : "Email failed" }).catch(() => null);
    }
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to send email" }, { status: 500 });
  }
}
