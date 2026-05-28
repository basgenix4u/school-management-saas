import { NextResponse } from "next/server";
import { getStudentResult } from "@/lib/results-center";

export async function GET(_request: Request, { params }: { params: Promise<{ student: string }> }) {
  const { student } = await params;
  const result = getStudentResult(student);
  if (!result) return NextResponse.json({ status: "error", message: "Result not found" }, { status: 404 });
  return NextResponse.json({ status: "ok", data: result });
}
