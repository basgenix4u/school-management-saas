import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { getOrganizationForWrite, TeacherSetupInput, upsertTeachers } from "@/lib/supabase/school-data";

export const POST = withAuth("teachers.manage", async (request: NextRequest, context) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving staff." }, { status: 503 });
  const body = await request.json().catch(() => null) as { teachers?: TeacherSetupInput[] } | null;
  if (!body?.teachers?.length) return NextResponse.json({ status: "error", message: "At least one staff member is required." }, { status: 400 });
  try {
    const organization = await getOrganizationForWrite(supabase);
    const teachers = await upsertTeachers(supabase, organization.id, body.teachers, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "saved", data: teachers });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to save staff" }, { status: 500 });
  }
});
