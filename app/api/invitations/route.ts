import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, createInvitation, getAccessSummary, listInvitations, type InvitationInput } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", invitations: [], summary: null, message: "Connect Supabase environment variables to manage invitations." });
  try {
    const [invitations, summary] = await Promise.all([listInvitations(supabase), getAccessSummary(supabase)]);
    return NextResponse.json({ status: "ok", invitations, summary });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load invitations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before inviting users." }, { status: 503 });
  const body = await request.json().catch(() => null) as Partial<InvitationInput> | null;
  if (!body?.email || !body?.role) return NextResponse.json({ status: "error", message: "Email and role are required." }, { status: 400 });
  try {
    const invitation = await createInvitation(supabase, body as InvitationInput);
    return NextResponse.json({ status: "created", invitation }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to create invitation" }, { status: 500 });
  }
}
