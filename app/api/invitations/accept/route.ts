import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { getAppSession } from "@/lib/auth/session";
import { acceptInvitation, configuredOrNull } from "@/lib/supabase/school-data";
import { invalidInputResponse, invitationAcceptSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "invitations-accept"), { limit: 10, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before accepting invitations." }, { status: 503 });
  const session = await getAppSession();
  if (!session.authenticated || !session.user?.email) return NextResponse.json({ status: "unauthorized", message: "Sign in before accepting invitation." }, { status: 401 });
  const parsed = invitationAcceptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  try {
    const profile = await acceptInvitation(supabase, parsed.data.token, session.user.id, session.user.email);
    return NextResponse.json({ status: "accepted", profile });
  } catch (error) {
    return apiError("POST /api/invitations/accept", error);
  }
}
