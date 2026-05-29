import { NextResponse } from "next/server";
import { configuredOrNull } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: "Supabase env vars are required for live command center data." }, { status: 503 });
  }

  try {
    const { data, error } = await supabase.rpc("get_school_command_center", { org_slug: "greenfield-school" });
    if (error) throw error;
    return NextResponse.json({ status: "ok", source: "supabase-rpc", data });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase-rpc", message: error instanceof Error ? error.message : "Failed to load live command center" }, { status: 500 });
  }
}
