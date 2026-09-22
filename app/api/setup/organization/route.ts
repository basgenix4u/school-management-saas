import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { configuredOrNull, upsertOrganization } from "@/lib/supabase/school-data";
import { invalidInputResponse, organizationSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";


export async function POST(request: NextRequest) {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "setup-organization"), { limit: 10, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before setting up a school." }, { status: 503 });
  const parsed = organizationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  try {
    const organization = await upsertOrganization(supabase, parsed.data);
    const session = await getAppSession();
    if (session.authenticated && session.user?.email) {
      await supabase.from("app_users").upsert({
        organization_id: organization.id,
        auth_user_id: session.user.id,
        email: session.user.email.toLowerCase(),
        name: session.user.name ?? session.user.email,
        role: "SCHOOL_OWNER",
        active: true,
      }, { onConflict: "email" });
    }
    return NextResponse.json({ status: "saved", data: organization });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to save school profile" }, { status: 500 });
  }
}
