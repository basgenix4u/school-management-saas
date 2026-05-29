import { NextRequest, NextResponse } from "next/server";
import { getResultSummary, resultInsights, resultStudents } from "@/lib/results-center";
import { configuredOrNull, listLiveResults, ResultUpsertInput, upsertLiveResult } from "@/lib/supabase/school-data";

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "ok", source: "mock", summary: getResultSummary(), insights: resultInsights, data: resultStudents });
  }

  try {
    const data = await listLiveResults(supabase);
    return NextResponse.json({ status: "ok", source: "supabase", data });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load results" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = configuredOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: "Supabase env vars are required for result persistence." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as Partial<ResultUpsertInput> | null;
  if (!body?.admissionNo || !body?.subjectName || !body?.term || !body?.session || typeof body.caScore !== "number" || typeof body.examScore !== "number") {
    return NextResponse.json({ status: "error", message: "admissionNo, subjectName, term, session, caScore and examScore are required." }, { status: 400 });
  }

  try {
    const result = await upsertLiveResult(supabase, body as ResultUpsertInput);
    return NextResponse.json({ status: "saved", source: "supabase", data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to save result" }, { status: 500 });
  }
}
