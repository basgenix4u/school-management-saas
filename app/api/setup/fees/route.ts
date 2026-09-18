import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { FeeCategoryInput, getOrganizationForWrite, upsertFeeCategories } from "@/lib/supabase/school-data";

export const POST = withAuth("workspace.manage", async (request: NextRequest) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving fees." }, { status: 503 });
  const body = await request.json().catch(() => null) as { fees?: FeeCategoryInput[] } | null;
  if (!body?.fees?.length) return NextResponse.json({ status: "error", message: "At least one fee category is required." }, { status: 400 });
  try {
    const organization = await getOrganizationForWrite(supabase);
    const fees = await upsertFeeCategories(supabase, organization.id, body.fees);
    return NextResponse.json({ status: "saved", data: fees });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to save fee categories" }, { status: 500 });
  }
});
