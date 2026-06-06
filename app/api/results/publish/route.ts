import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { configuredOrNull, publishOrUnlockResults, type ResultPublishInput } from "@/lib/supabase/school-data";

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  const session = await getAppSession();
  const body = await request.json().catch(() => null) as Partial<ResultPublishInput> | null;
  if (!body?.admissionNo || !body?.term || !body?.session || !body?.action) {
    return NextResponse.json({ status: "error", message: "admissionNo, term, session and action are required." }, { status: 400 });
  }
  try {
    const result = await publishOrUnlockResults(supabase, { ...(body as ResultPublishInput), actorEmail: session.user?.email });
    return NextResponse.json({ status: "ok", result });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to update publishing status" }, { status: 500 });
  }
}
