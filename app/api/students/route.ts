import { NextResponse } from "next/server";
import { getStudentSummary, studentRecords } from "@/lib/student-360";

export function GET() {
  return NextResponse.json({
    status: "ok",
    summary: getStudentSummary(),
    data: studentRecords,
  });
}
