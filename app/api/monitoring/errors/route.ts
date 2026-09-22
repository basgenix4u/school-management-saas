import { requestClientOrNull } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { listAppErrors, recordAppError } from "@/lib/supabase/school-data";
import { errorEventSchema, invalidInputResponse } from "@/lib/validation";
import { getAppSession } from "@/lib/auth/session";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

export async function GET() {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", errors: [] });
  try {
    const errors = await listAppErrors(supabase);
    return NextResponse.json({ status: "ok", errors });
  } catch (error) {
    return apiError("GET /api/monitoring/errors", error);
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
  const parsed = errorEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  try {
    const event = await recordAppError(supabase, { ...parsed.data, userEmail: parsed.data.userEmail ?? session.user?.email, userAgent: request.headers.get("user-agent") ?? undefined });
    return NextResponse.json({ status: "recorded", event }, { status: 201 });
  } catch (error) {
    return apiError("POST /api/monitoring/errors", error);
  }
}
