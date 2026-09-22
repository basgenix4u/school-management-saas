import { withAuth } from "@/lib/auth/api-guard";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";

export const GET = withAuth("workspace.manage", async () => {
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
    return apiError("GET /api/database/command-center", error);
  }
});
