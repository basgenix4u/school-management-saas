import { NextRequest, NextResponse } from "next/server";
import { attendanceRegister, getAttendanceSummary } from "@/lib/teacher-workspace";
import { AttendanceCreateInput, configuredOrNull, createLiveAttendance, listLiveAttendance } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "ok", source: "mock", summary: getAttendanceSummary(), register: attendanceRegister });
  }

  try {
    const register = await listLiveAttendance(supabase);
    return NextResponse.json({ status: "ok", source: "supabase", register });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: "Supabase env vars are required for attendance persistence." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as Partial<AttendanceCreateInput> | null;
  if (!body?.admissionNo || !body?.status) {
    return NextResponse.json({ status: "error", message: "admissionNo and status are required." }, { status: 400 });
  }

  try {
    const record = await createLiveAttendance(supabase, body as AttendanceCreateInput);
    return NextResponse.json({ status: "saved", source: "supabase", data: record, submittedAt: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to save attendance" }, { status: 500 });
  }
}
