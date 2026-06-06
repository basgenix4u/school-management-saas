import { NextResponse } from "next/server";
import { clientProductScript, deploymentChecklist, launchReadiness } from "@/lib/launch-readiness";

export function GET() {
  const overall = Math.round(launchReadiness.reduce((sum, item) => sum + item.score, 0) / launchReadiness.length);
  return NextResponse.json({ status: "ok", overall, launchReadiness, deploymentChecklist, clientProductScript });
}
