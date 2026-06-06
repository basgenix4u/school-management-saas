import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, getOrganizationForWrite, TeacherSetupInput, upsertTeachers } from "@/lib/supabase/school-data";

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving staff." }, { status: 503 });
  const body = await request.json().catch(() => null) as { teachers?: TeacherSetupInput[] } | null;
  if (!body?.teachers?.length) return NextResponse.json({ status: "error", message: "At least one staff member is required." }, { status: 400 });
  try {
    const organization = await getOrganizationForWrite(supabase);
    const teachers = await upsertTeachers(supabase, organization.id, body.teachers);
    return NextResponse.json({ status: "saved", data: teachers });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to save staff" }, { status: 500 });
  }
}
