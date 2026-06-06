import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, createAnnouncement, getCommunicationSummary, listAnnouncements, listCommunicationDeliveries, type AnnouncementInput } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", announcements: [], deliveries: [], summary: null, message: "Connect Supabase environment variables to manage communications." });
  try {
    const [announcements, deliveries, summary] = await Promise.all([listAnnouncements(supabase), listCommunicationDeliveries(supabase), getCommunicationSummary(supabase)]);
    return NextResponse.json({ status: "ok", announcements, deliveries, summary });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load communications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before creating announcements." }, { status: 503 });
  const body = await request.json().catch(() => null) as Partial<AnnouncementInput> | null;
  if (!body?.title || !body?.body) return NextResponse.json({ status: "error", message: "Title and body are required." }, { status: 400 });
  try {
    const announcement = await createAnnouncement(supabase, body as AnnouncementInput);
    return NextResponse.json({ status: "created", announcement }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to create announcement" }, { status: 500 });
  }
}
