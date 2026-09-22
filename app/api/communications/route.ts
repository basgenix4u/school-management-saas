import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { apiError, logApiError } from "@/lib/http";
import { createAnnouncement, getCommunicationSummary, listAnnouncements, listCommunicationDeliveries } from "@/lib/supabase/school-data";
import { announcementSchema, invalidInputResponse } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";


export const GET = withAuth("announcements.manage", async () => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", announcements: [], deliveries: [], summary: null, message: "Connect Supabase environment variables to manage communications." });
  try {
    const [listed, deliveries, summary] = await Promise.all([listAnnouncements(supabase), listCommunicationDeliveries(supabase), getCommunicationSummary(supabase)]);
    return NextResponse.json({ status: "ok", announcements: listed.data, page: listed.page, deliveries, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load communications";
    if (message.includes("Create a school profile")) {
      return NextResponse.json({ status: "setup_required", announcements: [], deliveries: [], summary: null, message });
    }
    logApiError("GET /api/communications", error);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
});

export const POST = withAuth("announcements.manage", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "announcements-create"), { limit: 30, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before creating announcements." }, { status: 503 });
  const parsed = announcementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  try {
    const announcement = await createAnnouncement(supabase, parsed.data, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "created", announcement }, { status: 201 });
  } catch (error) {
    return apiError("POST /api/communications", error);
  }
});
