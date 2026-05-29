import { NextResponse } from "next/server";
import { getInvoiceById } from "@/lib/finance-center";
import { configuredOrNull, getLiveInvoice } from "@/lib/supabase/school-data";

export async function GET(_request: Request, { params }: { params: Promise<{ invoice: string }> }) {
  const { invoice } = await params;
  const supabase = configuredOrNull();
  if (!supabase) {
    const data = getInvoiceById(invoice);
    if (!data) return NextResponse.json({ status: "error", source: "mock", message: "Invoice not found" }, { status: 404 });
    return NextResponse.json({ status: "ok", source: "mock", data });
  }

  try {
    const data = await getLiveInvoice(supabase, invoice.toUpperCase());
    if (!data) return NextResponse.json({ status: "error", source: "supabase", message: "Invoice not found" }, { status: 404 });
    return NextResponse.json({ status: "ok", source: "supabase", data });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load invoice" }, { status: 500 });
  }
}
