import { NextResponse } from "next/server";
import { configuredOrNull, getResultPublicationEvents } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", events: [] }, { status: 503 });
  try {
    const events = await getResultPublicationEvents(supabase);
    return NextResponse.json({ status: "ok", events });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load events" }, { status: 500 });
  }
}
