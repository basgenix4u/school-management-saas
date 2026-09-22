import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-guard";
import { askSchema, invalidInputResponse } from "@/lib/validation";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getInsightContext } from "@/lib/supabase/school-data";
import { answerInsight } from "@/lib/insights/engine";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

/**
 * Answers a plain-language question about the caller's school.
 *
 * The answer is computed deterministically from live rows, never generated:
 * see lib/insights/engine.ts for the reasoning.
 */
export const POST = withAuth("analytics.view", async (request) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "insights-ask"), { limit: 30, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const parsed = askSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);

  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json(
      { status: "not_configured", message: "Connect Supabase environment variables to analyse live school data." },
      { status: 503 },
    );
  }

  try {
    const context = await getInsightContext(supabase);
    const answer = answerInsight(context, parsed.data.question);
    return NextResponse.json({ status: "ok", generatedAt: new Date().toISOString(), ...answer });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unable to analyse school data" },
      { status: 500 },
    );
  }
});
