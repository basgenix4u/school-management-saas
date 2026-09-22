import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { createInvitation, getAccessSummary, listInvitations } from "@/lib/supabase/school-data";
import { invalidInputResponse, invitationSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";


export const GET = withAuth("workspace.manage", async () => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", invitations: [], summary: null, message: "Connect Supabase environment variables to manage invitations." });
  try {
    const [listed, summary] = await Promise.all([listInvitations(supabase), getAccessSummary(supabase)]);
    return NextResponse.json({ status: "ok", invitations: listed.data, page: listed.page, summary });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load invitations" }, { status: 500 });
  }
});

export const POST = withAuth("workspace.manage", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "invitations-create"), { limit: 30, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before inviting users." }, { status: 503 });
  const parsed = invitationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  try {
    const invitation = await createInvitation(supabase, parsed.data, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "created", invitation }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to create invitation" }, { status: 500 });
  }
});
