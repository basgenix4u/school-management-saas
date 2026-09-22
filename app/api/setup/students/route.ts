import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { createLiveStudentsBulk } from "@/lib/supabase/school-data";
import { invalidInputResponse, studentsBulkSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

export const POST = withAuth("students.manage", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "setup-students"), { limit: 30, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving students." }, { status: 503 });
  const parsed = studentsBulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  try {
    const result = await createLiveStudentsBulk(supabase, parsed.data.students, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "saved", data: result.students, linked: result.linked });
  } catch (error) {
    return apiError("POST /api/setup/students", error);
  }
});
