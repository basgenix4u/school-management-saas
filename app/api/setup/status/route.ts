import { NextResponse } from "next/server";
import { configuredOrNull, getSetupReadiness } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", readiness: null, message: "Connect Supabase environment variables to set up your school." });
  try {
    const readiness = await getSetupReadiness(supabase);
    return NextResponse.json({ status: "ok", readiness });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load setup status" }, { status: 500 });
  }
}
