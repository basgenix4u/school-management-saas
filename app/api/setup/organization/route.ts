import { NextRequest, NextResponse } from "next/server";
import { configuredOrNull, OrganizationSetupInput, upsertOrganization } from "@/lib/supabase/school-data";

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before setting up a school." }, { status: 503 });
  const body = await request.json().catch(() => null) as Partial<OrganizationSetupInput> | null;
  if (!body?.name) return NextResponse.json({ status: "error", message: "School name is required." }, { status: 400 });
  try {
    const organization = await upsertOrganization(supabase, body as OrganizationSetupInput);
    return NextResponse.json({ status: "saved", data: organization });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to save school profile" }, { status: 500 });
  }
}
