import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { configuredOrNull, createSupportTicket, getSupportSummary, listSupportTickets, type SupportTicketInput } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", tickets: [], summary: null });
  try {
    const [tickets, summary] = await Promise.all([listSupportTickets(supabase), getSupportSummary(supabase)]);
    return NextResponse.json({ status: "ok", tickets, summary });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load support tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  const session = await getAppSession();
  const body = await request.json().catch(() => null) as Partial<SupportTicketInput> | null;
  if (!body?.subject || !body?.description) return NextResponse.json({ status: "error", message: "subject and description are required." }, { status: 400 });
  try {
    const ticket = await createSupportTicket(supabase, { ...(body as SupportTicketInput), requesterEmail: body.requesterEmail ?? session.user?.email, requesterName: body.requesterName ?? session.user?.name });
    return NextResponse.json({ status: "created", ticket }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to create support ticket" }, { status: 500 });
  }
}
