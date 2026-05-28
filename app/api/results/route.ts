import { NextResponse } from "next/server";
import { getResultSummary, resultInsights, resultStudents } from "@/lib/results-center";

export function GET() {
  return NextResponse.json({ status: "ok", summary: getResultSummary(), insights: resultInsights, data: resultStudents });
}
