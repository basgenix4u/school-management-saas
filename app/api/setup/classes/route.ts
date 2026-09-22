import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { getOrganizationForWrite, upsertClassrooms } from "@/lib/supabase/school-data";
import { classesBulkSchema, invalidInputResponse } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";


export const POST = withAuth("workspace.manage", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "setup-classes"), { limit: 30, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving classes." }, { status: 503 });
  const parsed = classesBulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  try {
    const organization = await getOrganizationForWrite(supabase);
    const classes = await upsertClassrooms(supabase, organization.id, parsed.data.classes, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "saved", data: classes });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to save classes" }, { status: 500 });
  }
});
