import { NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({
      status: "not_configured",
      message: "Supabase environment variables are not configured in this runtime.",
    });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from("v_command_center_summary").select("*").limit(5);
    if (error) throw error;
    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
