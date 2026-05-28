import { NextResponse } from "next/server";
import { parentAnnouncements, parentInvoices, parentMessages, parentProfile } from "@/lib/portal-data";

export function GET() {
  return NextResponse.json({
    status: "ok",
    profile: parentProfile,
    invoices: parentInvoices,
    messages: parentMessages,
    announcements: parentAnnouncements,
  });
}
