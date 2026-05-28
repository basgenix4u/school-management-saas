import { NextResponse } from "next/server";
import { getStudentBySlug } from "@/lib/student-360";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = getStudentBySlug(id);
  if (!student) {
    return NextResponse.json({ status: "error", message: "Student not found" }, { status: 404 });
  }
  return NextResponse.json({ status: "ok", data: student });
}
