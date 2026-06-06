import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { acceptInvitation, configuredOrNull } from "@/lib/supabase/school-data";

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before accepting invitations." }, { status: 503 });
  const session = await getAppSession();
  if (!session.authenticated || !session.user?.email) return NextResponse.json({ status: "unauthorized", message: "Sign in before accepting invitation." }, { status: 401 });
  const body = await request.json().catch(() => null) as { token?: string } | null;
  if (!body?.token) return NextResponse.json({ status: "error", message: "Invitation token is required." }, { status: 400 });
  try {
    const profile = await acceptInvitation(supabase, body.token, session.user.id, session.user.email);
    return NextResponse.json({ status: "accepted", profile });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to accept invitation" }, { status: 500 });
  }
}
