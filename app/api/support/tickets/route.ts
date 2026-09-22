import { requestClientOrNull } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { getAppSession } from "@/lib/auth/session";
import { createSupportTicket, getSupportSummary, listSupportTickets } from "@/lib/supabase/school-data";
import { invalidInputResponse, supportTicketSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

export async function GET() {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", tickets: [], summary: null });
  try {
    const [tickets, summary] = await Promise.all([listSupportTickets(supabase), getSupportSummary(supabase)]);
    return NextResponse.json({ status: "ok", tickets, summary });
  } catch (error) {
    return apiError("GET /api/support/tickets", error);
  }
}

export async function POST(request: NextRequest) {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "support-tickets"), { limit: 10, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  const session = await getAppSession();
  const parsed = supportTicketSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  try {
    const ticket = await createSupportTicket(supabase, { ...parsed.data, requesterEmail: parsed.data.requesterEmail ?? session.user?.email, requesterName: parsed.data.requesterName ?? session.user?.name });
    return NextResponse.json({ status: "created", ticket }, { status: 201 });
  } catch (error) {
    return apiError("POST /api/support/tickets", error);
  }
}
