import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { publishOrUnlockResults } from "@/lib/supabase/school-data";
import { invalidInputResponse, resultPublishSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";


export const POST = withAuth("results.manage", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "results-publish"), { limit: 30, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  const parsed = resultPublishSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  try {
    const result = await publishOrUnlockResults(
      supabase,
      { ...parsed.data, actorEmail: context.user.email },
      { email: context.user.email, role: context.role },
    );
    return NextResponse.json({ status: "ok", result });
  } catch (error) {
    return apiError("POST /api/results/publish", error);
  }
});
