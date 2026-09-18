import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-guard";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { listTeachers } from "@/lib/supabase/school-data";

/** Staff directory for the caller's school. */
export const GET = withAuth("teachers.manage", async () => {
  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", teachers: [], message: "Connect Supabase environment variables to load staff records." });
  }

  try {
    const teachers = await listTeachers(supabase);
    return NextResponse.json({ status: "ok", source: "supabase", teachers });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Failed to load staff records" }, { status: 500 });
  }
});
