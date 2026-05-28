import { NextResponse } from "next/server";
import { getFinanceSummary, invoices } from "@/lib/finance-center";

export function GET() {
  return NextResponse.json({ status: "ok", summary: getFinanceSummary(), data: invoices });
}
