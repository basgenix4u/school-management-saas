import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Live-data guarantees for the finance, audit and trust modules.
 *
 * Money and audit trails are where invented figures do the most damage: a
 * bursar acting on a sample invoice, or an owner trusting a sample audit
 * feed. These tests prove the modules read live records and that the sample
 * datasets cannot return.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

function sources(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(join(root, dir))) {
    const rel = join(dir, entry);
    if (entry === "node_modules" || entry === ".next") continue;
    if (/\.(tsx|ts)$/.test(entry)) found.push(rel);
    else if (!entry.includes(".")) sources(rel, found);
  }
  return found;
}

describe("sample datasets stay deleted", () => {
  it("removes the finance, audit and mock datasets", () => {
    for (const file of ["lib/finance-center.ts", "lib/audit-data.ts", "lib/mock-data.ts"]) {
      expect(existsSync(join(root, file))).toBe(false);
    }
    expect(existsSync(join(root, "app", "api", "finance", "route.ts"))).toBe(false);
    expect(existsSync(join(root, "components", "premium", "TrendLine.tsx"))).toBe(false);
  });

  it("imports none of them anywhere", () => {
    const offenders: string[] = [];
    for (const file of [...sources("app"), ...sources("components"), ...sources("lib")]) {
      if (/finance-center|audit-data|mock-data|TrendLine/.test(read(file))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it("shows no invented money, people or audit figures", () => {
    const banned = [
      "₦18.4M", "₦6.4M", "₦2.3M", "₦145,000", "Amina Yusuf", "Fatima Bello",
      "Daniel Okoro", "Mrs. Grace Adams", "AUD-9001", "1,842",
      "collectionForecast", "paymentTimeline", "financeInsights", "auditEvents",
      "securityScores", "trustControls", "12 matched", "17 sent",
    ];
    const offenders: string[] = [];
    for (const file of [...sources("app"), ...sources("components")]) {
      const text = read(file);
      if (banned.some((phrase) => text.includes(phrase))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

describe("audit module reads live events", () => {
  it("serves the trail from the database behind audit.view", () => {
    const route = read("app/api/audit/route.ts");
    expect(route).toContain('withAuth("audit.view"');
    expect(route).toContain("listAuditEvents");
  });

  it("renders the page from live queries", () => {
    const page = read("app/dashboard/audit/page.tsx");
    expect(page).toContain("listAuditEvents");
    expect(page).toContain("getAuditSummary");
    expect(page).not.toContain("premium-metric");
  });
});

describe("trust center states facts", () => {
  it("counts live posture and names implemented controls", () => {
    const page = read("app/dashboard/trust/page.tsx");
    expect(page).toContain("getAuditSummary");
    expect(page).toContain("Controls in force");
    expect(page).not.toContain("RadialScore");
    expect(page).not.toContain("92");
  });
});

describe("finance module reads live invoices", () => {
  it("derives priorities and activity from live records", () => {
    const center = read("components/finance/FinanceCommandCenter.tsx");
    expect(center).toContain("/api/finance/invoices");
    expect(center).toContain("/api/audit?action=");
    expect(center).toContain("Priority follow-ups");
    expect(center).not.toContain("Data Source");
    expect(center).not.toContain("Live Supabase");
  });

  it("sends reminders through the real communications page", () => {
    const center = read("components/finance/FinanceCommandCenter.tsx");
    expect(center).toContain('href="/dashboard/communications"');
  });

  it("renders the invoice register from the database", () => {
    const page = read("app/dashboard/fees/invoices/page.tsx");
    expect(page).toContain("listLiveInvoices");
  });

  it("renders receipts from verified records", () => {
    const page = read("app/dashboard/receipts/[reference]/page.tsx");
    expect(page).toContain("getReceiptByReference");
    expect(page).not.toContain("/api/receipts/");
  });
});
