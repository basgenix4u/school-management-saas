import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextResponse } from "next/server";
import { getSetupReadiness } from "@/lib/supabase/school-data";

export const GET = withAuth("workspace.manage", async () => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", readiness: null, message: "Connect Supabase environment variables to set up your school." });
  try {
    const readiness = await getSetupReadiness(supabase);
    return NextResponse.json({ status: "ok", readiness });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load setup status" }, { status: 500 });
  }
});
