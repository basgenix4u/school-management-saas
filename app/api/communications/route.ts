import { NextResponse } from "next/server";
import { communicationInsights, communicationMetrics, communicationTimeline, messageCampaigns, messageTemplates } from "@/lib/communications-data";

export function GET() {
  return NextResponse.json({
    status: "ok",
    metrics: communicationMetrics,
    campaigns: messageCampaigns,
    templates: messageTemplates,
    insights: communicationInsights,
    timeline: communicationTimeline,
  });
}
