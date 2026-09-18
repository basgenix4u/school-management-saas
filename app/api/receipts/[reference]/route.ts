import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextResponse } from "next/server";
import { getReceiptByReference } from "@/lib/supabase/school-data";

type RouteParams = { params: Promise<{ reference: string }> };


export const GET = withAuth<RouteParams>("fees.view", async (_request: Request, _context, { params }) => {
  const { reference } = await params;
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  try {
    const receipt = await getReceiptByReference(supabase, reference);
    if (!receipt) return NextResponse.json({ status: "not_found", message: "Receipt not found." }, { status: 404 });
    return NextResponse.json({ status: "ok", receipt });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load receipt" }, { status: 500 });
  }
});
