import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  attendanceBulkSchema,
  attendanceSingleSchema,
  classesBulkSchema,
  feesBulkSchema,
  invitationSchema,
  invoiceSchema,
  organizationSchema,
  resultPublishSchema,
  resultSchema,
  sendEmailSchema,
  sessionSchema,
  studentSchema,
  studentsBulkSchema,
  supportTicketSchema,
  teachersBulkSchema,
} from "../lib/validation";
import { pageParams } from "../lib/supabase/school-data";

/**
 * Production-blocker guarantees.
 *
 * Validation, pagination, write policies and failure screens are what stand
 * between a demo and a product real schools can depend on. These tests pin
 * the contracts: every mutation validates, every list pages, every table
 * the app writes carries a role-aware policy, and failures render help.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("request validation", () => {
  it("accepts well-formed payloads", () => {
    expect(studentSchema.safeParse({ firstName: "A", lastName: "B", admissionNo: "STU-1" }).success).toBe(true);
    expect(invoiceSchema.safeParse({ admissionNo: "STU-1", invoiceNo: "INV-1", amount: 5000 }).success).toBe(true);
    expect(resultSchema.safeParse({ admissionNo: "STU-1", subjectName: "Maths", term: "First Term", session: "2026/2027", caScore: 30, examScore: 50 }).success).toBe(true);
    expect(invitationSchema.safeParse({ email: "a@example.com", role: "TEACHER" }).success).toBe(true);
    expect(resultPublishSchema.safeParse({ admissionNo: "STU-1", term: "First Term", session: "2026/2027", action: "publish" }).success).toBe(true);
    expect(organizationSchema.safeParse({ name: "School" }).success).toBe(true);
    expect(sessionSchema.safeParse({ name: "2026/2027", currentTerm: "First Term" }).success).toBe(true);
    expect(sendEmailSchema.safeParse({ subject: "Hi", body: "Hello", recipients: "a@example.com" }).success).toBe(true);
    expect(supportTicketSchema.safeParse({ subject: "Help", description: "Broken" }).success).toBe(true);
    expect(attendanceSingleSchema.safeParse({ admissionNo: "STU-1", status: "PRESENT" }).success).toBe(true);
    expect(attendanceBulkSchema.safeParse({ marks: [{ admissionNo: "STU-1", status: "LATE" }] }).success).toBe(true);
  });

  it("rejects malformed payloads with a reason", () => {
    expect(studentSchema.safeParse({ firstName: "A" }).success).toBe(false);
    expect(invoiceSchema.safeParse({ admissionNo: "STU-1", invoiceNo: "INV-1", amount: -5 }).success).toBe(false);
    expect(resultSchema.safeParse({ admissionNo: "STU-1", subjectName: "M", term: "T", session: "S", caScore: 99, examScore: 1 }).success).toBe(false);
    expect(invitationSchema.safeParse({ email: "not-an-email", role: "TEACHER" }).success).toBe(false);
    expect(resultPublishSchema.safeParse({ admissionNo: "STU-1", term: "T", session: "S", action: "delete" }).success).toBe(false);
    const bad = studentSchema.safeParse({ firstName: "", lastName: "B", admissionNo: "STU-1" });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].message.length).toBeGreaterThan(0);
  });

  it("caps bulk imports", () => {
    const row = { firstName: "A", lastName: "B", admissionNo: "STU-1" };
    expect(studentsBulkSchema.safeParse({ students: [] }).success).toBe(false);
    expect(studentsBulkSchema.safeParse({ students: Array.from({ length: 501 }, () => row) }).success).toBe(false);
    expect(studentsBulkSchema.safeParse({ students: [row] }).success).toBe(true);
    expect(classesBulkSchema.safeParse({ classes: [] }).success).toBe(false);
    expect(teachersBulkSchema.safeParse({ teachers: [{ staffNo: "T-1", name: "N" }] }).success).toBe(true);
    expect(feesBulkSchema.safeParse({ fees: [{ name: "Tuition", amount: 1000 }] }).success).toBe(true);
  });

  it("validates every mutation route through the shared module", () => {
    const files = [
      "app/api/students/route.ts",
      "app/api/students/[id]/route.ts",
      "app/api/setup/students/route.ts",
      "app/api/setup/teachers/route.ts",
      "app/api/setup/classes/route.ts",
      "app/api/setup/fees/route.ts",
      "app/api/setup/session/route.ts",
      "app/api/setup/organization/route.ts",
      "app/api/finance/invoices/route.ts",
      "app/api/results/route.ts",
      "app/api/results/publish/route.ts",
      "app/api/invitations/route.ts",
      "app/api/invitations/accept/route.ts",
      "app/api/communications/route.ts",
      "app/api/communications/send/route.ts",
      "app/api/support/tickets/route.ts",
      "app/api/monitoring/errors/route.ts",
      "app/api/attendance/route.ts",
      "app/api/insights/ask/route.ts",
      "app/api/payments/paystack/initialize/route.ts",
    ];
    for (const file of files) {
      const source = read(file);
      expect(source).toContain("@/lib/validation");
      expect(source).toContain("invalidInputResponse");
    }
  });
});

describe("pagination", () => {
  it("clamps page parameters", () => {
    expect(pageParams(undefined)).toEqual({ limit: 200, offset: 0 });
    expect(pageParams({ limit: 10000, offset: -5 })).toEqual({ limit: 500, offset: 0 });
    expect(pageParams({ limit: 0, offset: 40 })).toEqual({ limit: 1, offset: 40 });
  });

  it("pages every unbounded list endpoint", () => {
    for (const file of [
      "app/api/students/route.ts",
      "app/api/finance/invoices/route.ts",
      "app/api/results/route.ts",
    ]) {
      expect(read(file)).toContain("readPageParams");
    }
  });

  it("offers continuation in list interfaces", () => {
    expect(read("components/students/StudentDirectory.tsx")).toContain("Load more");
    expect(read("components/results/ResultsCommandCenter.tsx")).toContain("Load more");
    expect(read("app/dashboard/fees/invoices/page.tsx")).toContain("offset=");
  });
});

describe("write policies migration", () => {
  const migration = read("supabase/migrations/202609220001_write_policies.sql");

  it("covers every table the app mutates", () => {
    for (const table of [
      "students", "user_student_links", "teachers", "classrooms", "academic_sessions",
      "fee_categories", "attendance_records", "results", "subjects",
      "result_publication_events", "invoices", "announcements",
      "communication_deliveries", "user_invitations", "audit_events",
      "support_tickets", "app_error_events",
    ]) {
      expect(migration).toContain(`on public.${table} for insert`);
    }
  });

  it("grants no deletes and no service-table writes", () => {
    expect(migration).not.toMatch(/for delete/i);
    expect(migration).not.toContain("on public.organizations for insert");
    expect(migration).not.toContain("on public.app_users for insert");
    expect(migration).not.toContain("on public.payments for insert");
    expect(migration).not.toContain("on public.payment_receipts for insert");
  });

  it("uses only real roles", () => {
    const roles = [...migration.matchAll(/'([A-Z_]+)'/g)].map((match) => match[1]);
    const valid = ["SUPER_ADMIN", "SCHOOL_OWNER", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT"];
    expect(roles.length).toBeGreaterThan(0);
    for (const role of roles) expect(valid).toContain(role);
  });

  it("lets teachers announce and owners invite, exactly like the app", () => {
    expect(migration).toContain("owners_manage_announcements");
    const announcements = migration.slice(migration.indexOf("staff_insert_announcements"), migration.indexOf("staff_insert_deliveries"));
    expect(announcements).toContain("TEACHER");
    const invitations = migration.slice(migration.indexOf("owners_insert_invitations"));
    expect(invitations).not.toContain("PRINCIPAL");
    expect(invitations).toContain("SCHOOL_OWNER");
  });
});

describe("finance constraints migration", () => {
  it("scopes invoice numbers per school and indexes hot paths", () => {
    const migration = read("supabase/migrations/202609220002_finance_constraints.sql");
    expect(migration).toContain("invoices_invoice_no_key");
    expect(migration).toContain("unique (organization_id, invoice_no)");
    expect(migration).toContain("idx_invoices_org_status");
    expect(migration).toContain("idx_results_org");
  });

  it("resolves payments by exact id with number fallback", () => {
    const data = read("lib/supabase/school-data.ts");
    expect(data).toContain("getLiveInvoiceById");
    expect(data).not.toContain("listLiveInvoicesByNo");
    expect(data).toContain("invoice_no: input.invoiceNo.trim().toUpperCase()");
    expect(read("app/api/payments/paystack/webhook/route.ts")).toContain("invoiceId");
    expect(read("app/api/payments/paystack/verify/route.ts")).toContain("invoiceId");
  });

  it("initializes checkout inside the payer's school", () => {
    // Per-school numbers make cross-school lookup by number unsafe, so
    // checkout requires a session and resolves through the payer's rows.
    const route = read("app/api/payments/paystack/initialize/route.ts");
    expect(route).toContain("withSession");
    expect(route).toContain("requestClientOrNull");
    expect(route).toContain("/portal/receipts/");
  });
});

describe("bulk import and upload guards", () => {
  it("batches student imports instead of looping", () => {
    expect(read("lib/supabase/school-data.ts")).toContain("createLiveStudentsBulk");
    expect(read("app/api/setup/students/route.ts")).toContain("createLiveStudentsBulk");
  });

  it("caps CSV uploads", () => {
    expect(read("components/setup/SetupWizard.tsx")).toContain("MAX_CSV_BYTES");
  });

  it("stores phone numbers canonically", () => {
    const data = read("lib/supabase/school-data.ts");
    expect(data).toContain("canonicalPhone");
    expect(data).toContain("normaliseNigerianPhone");
  });
});

describe("failure screens and dead code", () => {
  it("renders help on crashes and unknown addresses", () => {
    for (const file of ["app/error.tsx", "app/global-error.tsx", "app/not-found.tsx"]) {
      expect(existsSync(join(root, file))).toBe(true);
    }
    expect(read("app/error.tsx")).toContain("/api/monitoring/errors");
  });

  it("removed the placeholder organization lookup", () => {
    for (const file of readdirSync(join(root, "lib"))) {
      if (file.endsWith(".ts")) expect(read(join("lib", file))).not.toContain("DEFAULT_ORG_SLUG");
    }
    expect(read("lib/supabase/school-data.ts")).not.toContain("your-school");
  });
});
