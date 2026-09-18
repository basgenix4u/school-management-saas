import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { createLiveInvoice, InvoiceCreateInput, listLiveInvoices } from "@/lib/supabase/school-data";

export const GET = withAuth("fees.view", async () => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", source: "none", data: [], message: "Connect Supabase environment variables to load invoices." });

  try {
    const data = await listLiveInvoices(supabase);
    return NextResponse.json({ status: "ok", source: "supabase", data });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load invoices" }, { status: 500 });
  }
});

export const POST = withAuth("fees.manage", async (request: NextRequest) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before creating invoices." }, { status: 503 });

  const body = await request.json().catch(() => null) as Partial<InvoiceCreateInput> | null;
  if (!body?.admissionNo || !body?.invoiceNo || typeof body.amount !== "number") return NextResponse.json({ status: "error", message: "admissionNo, invoiceNo and numeric amount are required." }, { status: 400 });

  try {
    const invoice = await createLiveInvoice(supabase, body as InvoiceCreateInput);
    return NextResponse.json({ status: "created", source: "supabase", data: invoice }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to create invoice" }, { status: 500 });
  }
});
