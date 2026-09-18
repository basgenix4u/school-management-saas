import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextResponse } from "next/server";
import { getLiveInvoice } from "@/lib/supabase/school-data";

type RouteParams = { params: Promise<{ invoice: string }> };


export const GET = withAuth<RouteParams>("fees.view", async (_request: Request, _context, { params }) => {
  const { invoice } = await params;
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", source: "none", message: "Connect Supabase environment variables to load invoice records." }, { status: 503 });

  try {
    const data = await getLiveInvoice(supabase, invoice.toUpperCase());
    if (!data) return NextResponse.json({ status: "error", source: "supabase", message: "Invoice not found" }, { status: 404 });
    return NextResponse.json({ status: "ok", source: "supabase", data });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load invoice" }, { status: 500 });
  }
});
