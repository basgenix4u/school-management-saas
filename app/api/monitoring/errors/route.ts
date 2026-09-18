import { requestClientOrNull } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";
import { listAppErrors, recordAppError, type ErrorEventInput } from "@/lib/supabase/school-data";
import { getAppSession } from "@/lib/auth/session";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

export async function GET() {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", errors: [] });
  try {
    const errors = await listAppErrors(supabase);
    return NextResponse.json({ status: "ok", errors });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load errors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "monitoring-errors"), { limit: 30, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured" }, { status: 503 });
  const session = await getAppSession();
  const body = await request.json().catch(() => null) as Partial<ErrorEventInput> | null;
  if (!body?.message) return NextResponse.json({ status: "error", message: "message is required" }, { status: 400 });
  try {
    const event = await recordAppError(supabase, { ...(body as ErrorEventInput), userEmail: body.userEmail ?? session.user?.email, userAgent: request.headers.get("user-agent") ?? undefined });
    return NextResponse.json({ status: "recorded", event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to record error" }, { status: 500 });
  }
}
