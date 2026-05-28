import { NextResponse } from "next/server";
import { teacherClasses, teacherInsights, teacherProfile } from "@/lib/teacher-workspace";

export function GET() {
  return NextResponse.json({
    status: "ok",
    teacher: teacherProfile,
    classes: teacherClasses,
    insights: teacherInsights,
  });
}
