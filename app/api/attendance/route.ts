import { NextRequest, NextResponse } from "next/server";
import { attendanceRegister, getAttendanceSummary } from "@/lib/teacher-workspace";

export function GET() {
  return NextResponse.json({
    status: "ok",
    summary: getAttendanceSummary(),
    register: attendanceRegister,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return NextResponse.json({
    status: "accepted",
    message: "Demo attendance submission received. Connect this endpoint to Prisma for production persistence.",
    received: body,
    submittedAt: new Date().toISOString(),
  });
}
