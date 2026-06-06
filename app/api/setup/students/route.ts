import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, createLiveStudent, StudentCreateInput } from "@/lib/supabase/school-data";

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving students." }, { status: 503 });
  const body = await request.json().catch(() => null) as { students?: StudentCreateInput[] } | null;
  if (!body?.students?.length) return NextResponse.json({ status: "error", message: "At least one student is required." }, { status: 400 });
  try {
    const results = [];
    for (const student of body.students) results.push(await createLiveStudent(supabase, student));
    return NextResponse.json({ status: "saved", data: results });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to save students" }, { status: 500 });
  }
}
