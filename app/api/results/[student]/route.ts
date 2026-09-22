import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { getLiveResultByStudent, hasPortalLink } from "@/lib/supabase/school-data";

type RouteParams = { params: Promise<{ student: string }> };


export const GET = withAuth<RouteParams>("results.view", async (_request: Request, context, { params }) => {
  const { student } = await params;
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", source: "none", message: "Connect Supabase environment variables to load result records." }, { status: 503 });

  // Staff read school-wide; portal accounts open only linked students, so one
  // guardian cannot pull another family's results by guessing an admission no.
  if (!await hasPortalLink(supabase, context.user.email, context.role, student)) {
    return NextResponse.json({ status: "error", code: "forbidden", message: "This record is not linked to your account." }, { status: 403 });
  }

  try {
    const result = await getLiveResultByStudent(supabase, student.toUpperCase());
    if (!result) return NextResponse.json({ status: "error", source: "supabase", message: "Result not found" }, { status: 404 });
    return NextResponse.json({ status: "ok", source: "supabase", data: result });
  } catch (error) {
    return apiError("GET /api/results/[student]", error);
  }
});
