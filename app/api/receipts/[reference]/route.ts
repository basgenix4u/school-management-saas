import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withSession } from "@/lib/auth/api-guard";
import { can } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { getReceiptByReference, hasPortalLink } from "@/lib/supabase/school-data";

type RouteParams = { params: Promise<{ reference: string }> };


/**
 * One verified receipt.
 *
 * Staff arrive through fee permission; parents and students arrive through
 * their link to the receipt's student. Students hold no fee permission at
 * all, so a plain permission guard would lock them out of their own
 * receipts — hence the session guard with an explicit branch below.
 */
export const GET = withSession<RouteParams>(async (_request: Request, context, { params }) => {
  const { reference } = await params;
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  try {
    const receipt = await getReceiptByReference(supabase, reference);
    if (!receipt) return NextResponse.json({ status: "not_found", message: "Receipt not found." }, { status: 404 });

    const role = context.role;
    if (role === "PARENT" || role === "STUDENT") {
      if (!await hasPortalLink(supabase, context.user.email, role, String(receipt.admission_no ?? ""))) {
        return NextResponse.json({ status: "error", code: "forbidden", message: "This receipt is not linked to your account." }, { status: 403 });
      }
    } else if (!can(role, "fees.view")) {
      return NextResponse.json({ status: "error", code: "forbidden", message: "Your role does not allow this action." }, { status: 403 });
    }

    return NextResponse.json({ status: "ok", receipt });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load receipt" }, { status: 500 });
  }
});
