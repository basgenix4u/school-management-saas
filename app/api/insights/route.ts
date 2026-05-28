import { NextResponse } from "next/server";
import { executiveMetrics, intelligenceSignals } from "@/lib/intelligence-data";

export function GET() {
  return NextResponse.json({
    status: "ok",
    generatedAt: new Date().toISOString(),
    summary: "EduManage intelligence layer is ready for database-backed insights.",
    metrics: executiveMetrics,
    signals: intelligenceSignals,
  });
}
