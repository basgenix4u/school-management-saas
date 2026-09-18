import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { ClassroomSetupInput, getOrganizationForWrite, upsertClassrooms } from "@/lib/supabase/school-data";

export const POST = withAuth("workspace.manage", async (request: NextRequest) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving classes." }, { status: 503 });
  const body = await request.json().catch(() => null) as { classes?: ClassroomSetupInput[] } | null;
  if (!body?.classes?.length) return NextResponse.json({ status: "error", message: "At least one class is required." }, { status: 400 });
  try {
    const organization = await getOrganizationForWrite(supabase);
    const classes = await upsertClassrooms(supabase, organization.id, body.classes);
    return NextResponse.json({ status: "saved", data: classes });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to save classes" }, { status: 500 });
  }
});
