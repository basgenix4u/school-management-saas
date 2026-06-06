import { NextRequest, NextResponse } from "next/server";
import { AcademicSessionInput, configuredOrNull, getOrganizationForWrite, upsertAcademicSession } from "@/lib/supabase/school-data";

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving academic sessions." }, { status: 503 });
  const body = await request.json().catch(() => null) as Partial<AcademicSessionInput> | null;
  if (!body?.name || !body?.currentTerm) return NextResponse.json({ status: "error", message: "Session name and current term are required." }, { status: 400 });
  try {
    const organization = await getOrganizationForWrite(supabase);
    const session = await upsertAcademicSession(supabase, organization.id, body as AcademicSessionInput);
    return NextResponse.json({ status: "saved", data: session });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to save academic session" }, { status: 500 });
  }
}
