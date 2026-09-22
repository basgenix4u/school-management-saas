import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/server";
import { createCookieSupabaseClient } from "@/lib/auth/session";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "auth-sign-out"), { limit: 60, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ status: "ok", mode: "not_configured", message: "Authentication is not configured in this runtime." });
  }

  const supabase = await createCookieSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.json({ status: "ok" });
}
