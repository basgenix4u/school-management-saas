import { NextResponse, type NextRequest } from "next/server";
import { withAuth, type AuthedContext } from "@/lib/auth/api-guard";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getStudentByAdmission, updateLiveStudent } from "@/lib/supabase/school-data";
import { invalidInputResponse, studentUpdateSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

const NOT_CONFIGURED = "Connect Supabase environment variables to load student records.";

export const GET = withAuth<RouteParams>("students.manage", async (_request, context: AuthedContext, { params }) => {
  const { id } = await params;
  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", source: "none", message: NOT_CONFIGURED }, { status: 503 });
  }

  try {
    // Scoped to the caller's school. A record belonging to another school is
    // reported as not found rather than forbidden, so the response cannot be
    // used to test whether an admission number exists elsewhere.
    const student = await getStudentByAdmission(supabase, context.organizationId, id.toUpperCase());
    if (!student) {
      return NextResponse.json({ status: "error", source: "supabase", message: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ status: "ok", source: "supabase", data: student });
  } catch (error) {
    return NextResponse.json(
      { status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load student" },
      { status: 500 },
    );
  }
});

export const PATCH = withAuth<RouteParams>("students.manage", async (request: NextRequest, context: AuthedContext, { params }) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "students-update"), { limit: 60, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }

  const { id } = await params;
  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: NOT_CONFIGURED }, { status: 503 });
  }

  const parsed = studentUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);
  const body = parsed.data;

  const admissionNo = id.toUpperCase();

  try {
    // Confirm the record belongs to the caller's school before writing.
    const existing = await getStudentByAdmission(supabase, context.organizationId, admissionNo);
    if (!existing) {
      return NextResponse.json({ status: "error", source: "supabase", message: "Student not found" }, { status: 404 });
    }

    const student = await updateLiveStudent(supabase, admissionNo, body, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "updated", source: "supabase", data: student });
  } catch (error) {
    return NextResponse.json(
      { status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to update student" },
      { status: 500 },
    );
  }
});
