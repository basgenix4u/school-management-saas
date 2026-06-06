import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { configuredOrNull, getStudentPortalBundle } from "@/lib/supabase/school-data";

export async function GET() {
  const session = await getAppSession();
  if (!session.authenticated || !session.user?.email) return NextResponse.json({ status: "unauthorized", message: "Sign in as a student to view portal data." }, { status: 401 });
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", profile: null, students: [], invoices: [], results: [], attendance: [], message: "Connect Supabase environment variables to load student portal data." });
  try {
    const data = await getStudentPortalBundle(supabase, session.user.email, "STUDENT");
    return NextResponse.json({ status: "ok", source: "supabase", ...data });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load student portal" }, { status: 500 });
  }
}
