import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";

export const GET = withAuth("analytics.view", async () => {
  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables to load command center data." }, { status: 503 });
  }

  try {
    const { data, error } = await supabase.from("v_command_center_summary").select("*").limit(10);
    if (error) throw error;
    return NextResponse.json({ status: "ok", source: "supabase-view", data });
  } catch (error) {
    return apiError("GET /api/live/command-center", error);
  }
});
