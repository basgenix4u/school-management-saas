import { NextResponse } from "next/server";
import { financeInsights, getFinanceSummary } from "@/lib/finance-center";

export function GET() {
  return NextResponse.json({ status: "ok", summary: getFinanceSummary(), insights: financeInsights });
}
