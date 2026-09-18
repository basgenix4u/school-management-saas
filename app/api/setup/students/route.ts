import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { createLiveStudent, StudentCreateInput } from "@/lib/supabase/school-data";

export const POST = withAuth("students.manage", async (request: NextRequest) => {
  const supabase = await requestClientOrNull();
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
});
