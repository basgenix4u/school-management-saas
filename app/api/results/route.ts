import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { filterLinkedRows, getResultsSummaryTotals, listLiveResults, upsertLiveResult } from "@/lib/supabase/school-data";
import { invalidInputResponse, readPageParams, resultSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";


function summarizeResults(rows: Array<{ total_score: string | number; status: string }>) {
  const by = (status: string) => rows.filter((row) => row.status === status).length;
  return {
    records: rows.length,
    average: rows.length ? Math.round(rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / rows.length) : 0,
    draft: by("DRAFT"),
    review: by("REVIEW"),
    approved: by("APPROVED"),
    published: by("PUBLISHED"),
  };
}

export const GET = withAuth("results.view", async (request: NextRequest, context) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", source: "none", data: [], message: "Connect Supabase environment variables to load results." });

  try {
    const portal = context.role === "PARENT" || context.role === "STUDENT";
    const result = await listLiveResults(supabase, portal ? { limit: 500 } : readPageParams(request));
    const data = await filterLinkedRows(supabase, context.user.email, context.role, result.data);
    const page = portal ? { total: data.length, limit: 500, offset: 0, hasMore: false } : result.page;
    const summary = portal ? summarizeResults(data) : await getResultsSummaryTotals(supabase);
    return NextResponse.json({ status: "ok", source: "supabase", data, page, summary });
  } catch (error) {
    return apiError("GET /api/results", error);
  }
});

export const POST = withAuth("results.manage", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "results-save"), { limit: 60, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving results." }, { status: 503 });

  const parsed = resultSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);

  try {
    const result = await upsertLiveResult(supabase, parsed.data, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "saved", source: "supabase", data: result }, { status: 201 });
  } catch (error) {
    return apiError("POST /api/results", error);
  }
});
