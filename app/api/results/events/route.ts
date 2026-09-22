import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { getResultPublicationEvents } from "@/lib/supabase/school-data";

export const GET = withAuth("results.view", async () => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", events: [] }, { status: 503 });
  try {
    const events = await getResultPublicationEvents(supabase);
    return NextResponse.json({ status: "ok", events });
  } catch (error) {
    return apiError("GET /api/results/events", error);
  }
});
