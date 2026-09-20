import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { filterLinkedRows, listLiveResults, ResultUpsertInput, upsertLiveResult } from "@/lib/supabase/school-data";

export const GET = withAuth("results.view", async (_request: NextRequest, context) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", source: "none", data: [], message: "Connect Supabase environment variables to load results." });

  try {
    const rows = await listLiveResults(supabase);
    const data = await filterLinkedRows(supabase, context.user.email, context.role, rows);
    return NextResponse.json({ status: "ok", source: "supabase", data });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load results" }, { status: 500 });
  }
});

export const POST = withAuth("results.manage", async (request: NextRequest, context) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving results." }, { status: 503 });

  const body = await request.json().catch(() => null) as Partial<ResultUpsertInput> | null;
  if (!body?.admissionNo || !body?.subjectName || !body?.term || !body?.session || typeof body.caScore !== "number" || typeof body.examScore !== "number") {
    return NextResponse.json({ status: "error", message: "admissionNo, subjectName, term, session, caScore and examScore are required." }, { status: 400 });
  }

  try {
    const result = await upsertLiveResult(supabase, body as ResultUpsertInput, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "saved", source: "supabase", data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to save result" }, { status: 500 });
  }
});
