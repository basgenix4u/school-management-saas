import { NextResponse } from "next/server";
import { configuredOrNull, getReceiptByReference } from "@/lib/supabase/school-data";

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const supabase = configuredOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  try {
    const receipt = await getReceiptByReference(supabase, reference);
    if (!receipt) return NextResponse.json({ status: "not_found", message: "Receipt not found." }, { status: 404 });
    return NextResponse.json({ status: "ok", receipt });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load receipt" }, { status: 500 });
  }
}
