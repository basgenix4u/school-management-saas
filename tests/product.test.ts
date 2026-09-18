import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { navForRole, roleHome } from "../lib/nav";
import { can } from "../lib/rbac";
import { RegisterOutbox, createMemoryStore, type RegisterPayload } from "../lib/attendance/outbox";
import { __clearRateLimits, checkRateLimit, clientIp, rateLimitKey } from "../lib/rate-limit";

/**
 * Phase 4 product guarantees: navigation that respects roles, a register that
 * survives dropped connections, throttled endpoints and audit events that
 * name their actor.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("role-scoped navigation", () => {
  it("keeps a teacher's workspace to a handful of destinations", () => {
    const sections = navForRole("TEACHER");
    const labels = sections.flatMap((section) => section.items.map((item) => item.label));
    expect(labels).toContain("Teacher desk");
    expect(labels).toContain("Attendance");
    expect(labels).toContain("Results");
    expect(labels).not.toContain("Fees & receipts");
    expect(labels).not.toContain("School setup");
    expect(labels).not.toContain("Access & invites");
    expect(labels.length).toBeLessThanOrEqual(6);
  });

  it("gives owners the full school without dead ends", () => {
    const labels = navForRole("SCHOOL_OWNER").flatMap((section) => section.items.map((item) => item.label));
    for (const label of ["Overview", "Students", "Attendance", "Results", "Fees & receipts", "School setup", "Access & invites", "Audit trail"]) {
      expect(labels).toContain(label);
    }
  });

  it("shows portal roles only what the dashboard holds for them", () => {
    const parent = navForRole("PARENT").flatMap((section) => section.items.map((item) => item.label));
    expect(parent).toContain("Fees & receipts");
    expect(parent).not.toContain("Students");
    expect(navForRole("STUDENT").flatMap((section) => section.items.map((item) => item.label))).not.toContain("Fees & receipts");
  });

  it("never emits an empty section", () => {
    for (const role of ["SUPER_ADMIN", "SCHOOL_OWNER", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT"] as const) {
      for (const section of navForRole(role)) {
        expect(section.items.length).toBeGreaterThan(0);
      }
    }
  });

  it("routes each role home after sign-in", () => {
    expect(roleHome("TEACHER")).toBe("/dashboard/teacher-desk");
    expect(roleHome("PARENT")).toBe("/portal/parent");
    expect(roleHome("STUDENT")).toBe("/portal/student");
    expect(roleHome("SCHOOL_OWNER")).toBe("/dashboard");
    expect(roleHome("PRINCIPAL")).toBe("/dashboard");
    expect(roleHome("ACCOUNTANT")).toBe("/dashboard");
    expect(roleHome("SUPER_ADMIN")).toBe("/dashboard");
  });
});

describe("owner permissions", () => {
  it("lets owners run registers and results in a small school", () => {
    expect(can("SCHOOL_OWNER", "attendance.mark")).toBe(true);
    expect(can("SCHOOL_OWNER", "results.manage")).toBe(true);
    expect(can("SCHOOL_OWNER", "workspace.manage")).toBe(true);
  });

  it("still keeps staff out of each other's domains", () => {
    expect(can("TEACHER", "fees.view")).toBe(false);
    expect(can("ACCOUNTANT", "results.manage")).toBe(false);
    expect(can("PRINCIPAL", "workspace.manage")).toBe(false);
  });
});

describe("register outbox", () => {
  const payload: RegisterPayload = {
    date: "2026-09-18",
    period: "Morning",
    marks: [{ admissionNo: "STU-001", status: "PRESENT" }],
  };

  it("clears records the server accepts", async () => {
    const outbox = new RegisterOutbox(createMemoryStore(), async () => ({}));
    outbox.enqueue(payload);
    expect(outbox.pending()).toHaveLength(1);
    const result = await outbox.flush();
    expect(result.sent).toBe(1);
    expect(result.failed).toHaveLength(0);
    expect(outbox.pending()).toHaveLength(0);
  });

  it("keeps failed registers with their reason and retry count", async () => {
    const outbox = new RegisterOutbox(createMemoryStore(), async () => {
      throw new Error("connection dropped");
    });
    outbox.enqueue(payload);
    const first = await outbox.flush();
    expect(first.sent).toBe(0);
    expect(first.failed).toHaveLength(1);
    expect(first.failed[0].error).toBe("connection dropped");
    expect(first.failed[0].attempts).toBe(1);
    const second = await outbox.flush();
    expect(second.failed[0].attempts).toBe(2);
    expect(outbox.pending()).toHaveLength(1);
  });

  it("reports admission numbers the server did not recognise", async () => {
    const outbox = new RegisterOutbox(createMemoryStore(), async () => ({ unknown: ["STU-404"] }));
    outbox.enqueue(payload);
    const result = await outbox.flush();
    expect(result.sent).toBe(1);
    expect(result.unknown).toEqual(["STU-404"]);
  });

  it("discards on request", () => {
    const outbox = new RegisterOutbox(createMemoryStore(), async () => ({}));
    const record = outbox.enqueue(payload);
    outbox.discard(record.id);
    expect(outbox.pending()).toHaveLength(0);
  });
});

describe("rate limiting", () => {
  it("allows requests under the limit and blocks past it", () => {
    __clearRateLimits();
    const key = "test-scope:127.0.0.1";
    expect(checkRateLimit(key, { limit: 2, windowMs: 60_000 }, 1000).allowed).toBe(true);
    expect(checkRateLimit(key, { limit: 2, windowMs: 60_000 }, 1000).allowed).toBe(true);
    const blocked = checkRateLimit(key, { limit: 2, windowMs: 60_000 }, 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets when the window passes", () => {
    __clearRateLimits();
    const key = "window-scope:127.0.0.1";
    expect(checkRateLimit(key, { limit: 1, windowMs: 1000 }, 1000).allowed).toBe(true);
    expect(checkRateLimit(key, { limit: 1, windowMs: 1000 }, 1500).allowed).toBe(false);
    expect(checkRateLimit(key, { limit: 1, windowMs: 1000 }, 2001).allowed).toBe(true);
  });

  it("isolates clients and scopes", () => {
    __clearRateLimits();
    expect(checkRateLimit("a:1.1.1.1", { limit: 1, windowMs: 60_000 }, 1000).allowed).toBe(true);
    expect(checkRateLimit("a:2.2.2.2", { limit: 1, windowMs: 60_000 }, 1000).allowed).toBe(true);
    expect(checkRateLimit("b:1.1.1.1", { limit: 1, windowMs: 60_000 }, 1000).allowed).toBe(true);
  });

  it("reads the client address from proxy headers", () => {
    const forwarded = new Request("http://x.test", { headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18" } });
    expect(clientIp(forwarded)).toBe("203.0.113.7");
    expect(rateLimitKey(forwarded, "scope")).toBe("scope:203.0.113.7");
    expect(clientIp(new Request("http://x.test"))).toBe("unknown");
  });
});

describe("dashboard shell honesty", () => {
  it("shows the signed-in user, never a hardcoded persona", () => {
    const shell = read("components/DashboardLayout.tsx");
    for (const phrase of ["Abdulbasit", "Brighton", "Logged out (demo)", "/dashboard/settings", "bg-zinc-50"]) {
      expect(shell).not.toContain(phrase);
    }
    expect(shell).toContain("/api/auth/sign-out");
  });

  it("sends bare dashboard entries to the role home", () => {
    expect(read("app/dashboard/layout.tsx")).toContain("roleHome(session.user.role)");
  });
});

describe("attendance honesty", () => {
  it("removed the sample teacher workspace", () => {
    expect(existsSync(join(root, "lib", "teacher-workspace.ts"))).toBe(false);
    expect(existsSync(join(root, "app", "api", "teachers", "workspace"))).toBe(false);
    expect(read("components/teachers/TeacherDailyWorkspace.tsx")).not.toContain("teacher-workspace");
  });

  it("submits through the durable outbox", () => {
    const workspace = read("components/teachers/TeacherDailyWorkspace.tsx");
    expect(workspace).toContain("RegisterOutbox");
    expect(workspace).toContain("/api/attendance/register");
    expect(workspace).toContain('method: "PUT"');
  });
});

describe("endpoint protections", () => {
  it("throttles abuse-prone endpoints", () => {
    for (const file of [
      "app/api/insights/ask/route.ts",
      "app/api/support/tickets/route.ts",
      "app/api/monitoring/errors/route.ts",
      "app/api/invitations/accept/route.ts",
      "app/api/communications/send/route.ts",
      "app/api/attendance/route.ts",
      "app/api/payments/paystack/initialize/route.ts",
    ]) {
      expect(read(file)).toContain("checkRateLimit");
    }
  });

  it("attributes mutations to their actor", () => {
    for (const file of [
      "app/api/students/route.ts",
      "app/api/attendance/route.ts",
      "app/api/finance/invoices/route.ts",
      "app/api/results/route.ts",
      "app/api/results/publish/route.ts",
      "app/api/invitations/route.ts",
      "app/api/setup/session/route.ts",
    ]) {
      expect(read(file)).toContain("role: context.role");
    }
  });

  it("authorises result publishing", () => {
    expect(read("app/api/results/publish/route.ts")).toContain('withAuth("results.manage"');
  });
});
