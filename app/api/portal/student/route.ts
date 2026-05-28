import { NextResponse } from "next/server";
import { studentProfile, studentSubjects, studentTasks, studentTimeline } from "@/lib/portal-data";

export function GET() {
  return NextResponse.json({
    status: "ok",
    profile: studentProfile,
    subjects: studentSubjects,
    tasks: studentTasks,
    timeline: studentTimeline,
  });
}
