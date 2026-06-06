import { NextResponse } from "next/server";
import { configuredOrNull } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables to load command center data." }, { status: 503 });
  }

  try {
    const { data, error } = await supabase.from("v_command_center_summary").select("*").limit(10);
    if (error) throw error;
    return NextResponse.json({ status: "ok", source: "supabase-view", data });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase-view", message: error instanceof Error ? error.message : "Failed to load command center" }, { status: 500 });
  }
}
