import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Portal guarantees: parents and students open receipts and download
 * results — but only their own.
 *
 * Portal accounts authenticate like staff, so tenant row level security
 * admits them to their school's tables. The link checks below are the
 * second half of that boundary: without them, one family could pull
 * another's results by guessing an admission number.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("portal link enforcement", () => {
  it("provides link helpers in the data layer", () => {
    const data = read("lib/supabase/school-data.ts");
    expect(data).toContain("linkedAdmissionNumbers");
    expect(data).toContain("hasPortalLink");
    expect(data).toContain("filterLinkedRows");
  });

  it("link-checks single-record reads", () => {
    for (const file of [
      "app/api/results/[student]/route.ts",
      "app/api/results/[student]/pdf/route.ts",
      "app/api/receipts/[reference]/route.ts",
    ]) {
      expect(read(file)).toContain("hasPortalLink");
    }
  });

  it("narrows list reads to linked students for portal roles", () => {
    for (const file of [
      "app/api/finance/invoices/route.ts",
      "app/api/results/route.ts",
      "app/api/attendance/route.ts",
    ]) {
      expect(read(file)).toContain("filterLinkedRows");
    }
  });

  it("opens receipts to linked students, not just fee viewers", () => {
    const route = read("app/api/receipts/[reference]/route.ts");
    expect(route).toContain("withSession");
    expect(route).not.toContain('withAuth("fees.view"');
  });

  it("ships receipts in the portal bundle", () => {
    expect(read("lib/supabase/school-data.ts")).toContain("payment_receipts");
    expect(read("components/portal/ParentPortal.tsx")).toContain("receipts");
    expect(read("components/portal/StudentPortal.tsx")).toContain("receipts");
  });
});

describe("portal receipt viewing", () => {
  it("shares one receipt card between desk and portal", () => {
    expect(existsSync(join(root, "components", "receipts", "ReceiptCard.tsx"))).toBe(true);
    expect(read("app/dashboard/receipts/[reference]/page.tsx")).toContain("ReceiptCard");
    expect(read("components/portal/PortalReceipt.tsx")).toContain("ReceiptCard");
  });

  it("serves a portal receipt page with a way back", () => {
    expect(existsSync(join(root, "app", "portal", "receipts", "[reference]", "page.tsx"))).toBe(true);
    expect(read("components/portal/PortalReceipt.tsx")).toContain('from === "student"');
  });

  it("links every receipt from both portals", () => {
    expect(read("components/portal/ParentPortal.tsx")).toContain("/portal/receipts/");
    expect(read("components/portal/StudentPortal.tsx")).toContain("/portal/receipts/");
  });
});

describe("portal result downloads", () => {
  it("offers report viewing and PDF download per child", () => {
    const parent = read("components/portal/ParentPortal.tsx");
    expect(parent).toContain("/dashboard/results/report-card/");
    expect(parent).toContain("/api/results/");
    expect(parent).toContain("/pdf");
  });

  it("offers students their own report card and PDF", () => {
    const student = read("components/portal/StudentPortal.tsx");
    expect(student).toContain("/dashboard/results/report-card/");
    expect(student).toContain("Download PDF");
  });
});
