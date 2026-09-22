import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { createLiveInvoice, filterLinkedRows, getFinanceSummaryTotals, listLiveInvoices } from "@/lib/supabase/school-data";
import { invalidInputResponse, invoiceSchema, readPageParams } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";


function summarizeInvoices(rows: Array<{ amount: string | number; amount_paid: string | number; status: string }>) {
  const total = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const paid = rows.reduce((sum, row) => sum + Number(row.amount_paid ?? 0), 0);
  const overdueRows = rows.filter((row) => row.status === "OVERDUE");
  return {
    total,
    paid,
    outstanding: Math.max(0, total - paid),
    overdue: overdueRows.reduce((sum, row) => sum + Math.max(0, Number(row.amount ?? 0) - Number(row.amount_paid ?? 0)), 0),
    overdueCount: overdueRows.length,
    invoiceCount: rows.length,
    collectionRate: total > 0 ? Math.round((paid / total) * 100) : 0,
  };
}

export const GET = withAuth("fees.view", async (request: NextRequest, context) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", source: "none", data: [], message: "Connect Supabase environment variables to load invoices." });

  try {
    // Portal roles hold few enough rows to scope exactly; staff paginate.
    // Totals always describe the caller's own rows: the summary view for
    // staff, the filtered rows for portal roles — never the other way round.
    const portal = context.role === "PARENT" || context.role === "STUDENT";
    const result = await listLiveInvoices(supabase, portal ? { limit: 500 } : readPageParams(request));
    const data = await filterLinkedRows(supabase, context.user.email, context.role, result.data);
    const page = portal ? { total: data.length, limit: 500, offset: 0, hasMore: false } : result.page;
    const summary = portal ? summarizeInvoices(data) : await getFinanceSummaryTotals(supabase);
    return NextResponse.json({ status: "ok", source: "supabase", data, page, summary });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load invoices" }, { status: 500 });
  }
});

export const POST = withAuth("fees.manage", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "invoices-create"), { limit: 60, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before creating invoices." }, { status: 503 });

  const parsed = invoiceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);

  try {
    const invoice = await createLiveInvoice(supabase, parsed.data, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "created", source: "supabase", data: invoice }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to create invoice" }, { status: 500 });
  }
});
