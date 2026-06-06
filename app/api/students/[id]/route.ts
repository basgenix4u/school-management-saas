import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, getOrganization, getStudentByAdmission, updateLiveStudent, StudentCreateInput } from "@/lib/supabase/school-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", source: "none", message: "Connect Supabase environment variables to load student records." }, { status: 503 });

  try {
    const organization = await getOrganization(supabase);
    const student = await getStudentByAdmission(supabase, organization.id, id.toUpperCase());
    if (!student) return NextResponse.json({ status: "error", source: "supabase", message: "Student not found" }, { status: 404 });
    return NextResponse.json({ status: "ok", source: "supabase", data: student });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load student" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before updating students." }, { status: 503 });

  const body = await request.json().catch(() => null) as Partial<StudentCreateInput> | null;
  if (!body) return NextResponse.json({ status: "error", message: "Invalid JSON body." }, { status: 400 });

  try {
    const student = await updateLiveStudent(supabase, id.toUpperCase(), body);
    return NextResponse.json({ status: "updated", source: "supabase", data: student });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to update student" }, { status: 500 });
  }
}
