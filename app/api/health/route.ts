import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "school-management-saas",
    timestamp: new Date().toISOString(),
  });
}
