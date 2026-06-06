import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, createLiveStudent, listLiveStudents, StudentCreateInput } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", source: "none", summary: { total: 0, highRisk: 0, withBalance: 0 }, data: [], message: "Connect Supabase environment variables to load student records." });
  }

  try {
    const result = await listLiveStudents(supabase);
    return NextResponse.json({ status: "ok", source: "supabase", ...result });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load students" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before creating students." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as Partial<StudentCreateInput> | null;
  if (!body?.firstName || !body?.lastName || !body?.admissionNo) {
    return NextResponse.json({ status: "error", message: "firstName, lastName and admissionNo are required." }, { status: 400 });
  }

  try {
    const student = await createLiveStudent(supabase, body as StudentCreateInput);
    return NextResponse.json({ status: "created", source: "supabase", data: student }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to create student" }, { status: 500 });
  }
}
