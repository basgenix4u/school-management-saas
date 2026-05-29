import { NextResponse } from "next/server";
import { getStudentResult } from "@/lib/results-center";
import { configuredOrNull, getLiveResultByStudent } from "@/lib/supabase/school-data";

export async function GET(_request: Request, { params }: { params: Promise<{ student: string }> }) {
  const { student } = await params;
  const supabase = configuredOrNull();

  if (!supabase) {
    const result = getStudentResult(student);
    if (!result) return NextResponse.json({ status: "error", source: "mock", message: "Result not found" }, { status: 404 });
    return NextResponse.json({ status: "ok", source: "mock", data: result });
  }

  try {
    const result = await getLiveResultByStudent(supabase, student.toUpperCase());
    if (!result) return NextResponse.json({ status: "error", source: "supabase", message: "Result not found" }, { status: 404 });
    return NextResponse.json({ status: "ok", source: "supabase", data: result });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load result" }, { status: 500 });
  }
}
