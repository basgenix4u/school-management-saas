import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { can, permissionsByRole, type UserRole } from "../lib/rbac";
import { permissionForPath } from "../lib/auth/route-permissions";
import { verifyPaystackSignature } from "../lib/payments/paystack";
import { normaliseNigerianPhone, formatNaira, currentSession } from "../lib/format";

/**
 * These tests encode the security rules the product depends on. They exist so a
 * future change that reintroduces an unauthenticated endpoint, or widens a
 * role, fails the build rather than reaching a school.
 */

function routeFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) routeFiles(full, found);
    else if (entry === "route.ts") found.push(full);
  }
  return found;
}

const API_DIR = join(process.cwd(), "app", "api");

/**
 * Endpoints that are legitimately reachable without a session, each for a
 * stated reason. Anything not on this list must authorise.
 */
const PUBLIC_ROUTES: Record<string, string> = {
  "health/route.ts": "Uptime probe. Returns no school data.",
  "auth/session/route.ts": "Reports whether the caller is signed in.",
  "auth/sign-out/route.ts": "Must work even with an expired session.",
  "payments/paystack/webhook/route.ts": "Server-to-server; authenticated by HMAC signature.",
  "payments/paystack/verify/route.ts": "Payment callback verified against the provider.",
  "payments/paystack/initialize/route.ts": "Starts a checkout for an issued invoice.",
  "invitations/accept/route.ts": "Runs before membership exists; the token is the credential.",
  "monitoring/errors/route.ts": "Client error reporting.",
  "support/tickets/route.ts": "Support intake.",
  "portal/parent/route.ts": "Guards internally via getAppSession and portal links.",
  "portal/student/route.ts": "Guards internally via getAppSession and portal links.",
  "setup/organization/route.ts": "First-owner bootstrap before any membership row exists.",
};

describe("API authorization coverage", () => {
  const files = routeFiles(API_DIR);

  it("finds the route handlers", () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it("guards every route that is not explicitly public", () => {
    const unguarded: string[] = [];

    for (const file of files) {
      const rel = file.slice(API_DIR.length + 1);
      if (rel in PUBLIC_ROUTES) continue;

      const source = readFileSync(file, "utf8");
      const guarded =
        source.includes("withAuth(") ||
        source.includes("withAuth<") ||
        source.includes("withSession(") ||
        source.includes("withSession<") ||
        source.includes("getAppSession");

      if (!guarded) unguarded.push(rel);
    }

    // A failure here means a handler serves school data to anonymous callers.
    expect(unguarded).toEqual([]);
  });

  it("keeps user-facing reads off the service role client", () => {
    // The service role bypasses row level security, so tenant isolation would
    // depend entirely on hand-written filters.
    const offenders: string[] = [];
    for (const file of files) {
      const rel = file.slice(API_DIR.length + 1);
      if (rel.startsWith("payments/") || rel === "invitations/accept/route.ts" || rel === "setup/organization/route.ts") {
        continue; // documented service-role paths with no user context
      }
      if (readFileSync(file, "utf8").includes("configuredOrNull(")) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });
});

describe("dashboard route permissions", () => {
  it("requires a permission for every sensitive area", () => {
    expect(permissionForPath("/dashboard/students")).toBe("students.manage");
    expect(permissionForPath("/dashboard/fees")).toBe("fees.view");
    expect(permissionForPath("/dashboard/results/entry")).toBe("results.view");
    expect(permissionForPath("/dashboard/audit")).toBe("audit.view");
    expect(permissionForPath("/dashboard/setup")).toBe("workspace.manage");
  });

  it("does not gate the page that explains a refusal", () => {
    // Gating this would bounce a denied user into a redirect loop.
    expect(permissionForPath("/dashboard/access")).toBeNull();
  });

  it("falls back to the dashboard requirement for unlisted areas", () => {
    expect(permissionForPath("/dashboard/something-new")).toBe("analytics.view");
  });
});

describe("role boundaries", () => {
  it("keeps finance away from teachers and students", () => {
    expect(can("TEACHER", "fees.manage")).toBe(false);
    expect(can("STUDENT", "fees.manage")).toBe(false);
    expect(can("PARENT", "fees.manage")).toBe(false);
  });

  it("lets school owners manage their own workspace, and no one else", () => {
    // The owner is the customer: without this they could not open setup,
    // invite staff or onboard their school. Tenancy still comes from row
    // level security, so this is authority over their school, not the
    // platform. Staff, parents and students stay excluded.
    const allowed = (Object.keys(permissionsByRole) as UserRole[]).filter((role) => can(role, "workspace.manage"));
    expect(allowed).toEqual(["SUPER_ADMIN", "SCHOOL_OWNER"]);
  });

  it("stops students and parents from editing records", () => {
    for (const role of ["STUDENT", "PARENT"] as UserRole[]) {
      expect(can(role, "students.manage")).toBe(false);
      expect(can(role, "results.manage")).toBe(false);
      expect(can(role, "attendance.mark")).toBe(false);
      expect(can(role, "announcements.manage")).toBe(false);
    }
  });

  it("gives students no access to audit history", () => {
    expect(can("STUDENT", "audit.view")).toBe(false);
    expect(can("PARENT", "audit.view")).toBe(false);
  });
});

describe("Paystack webhook verification", () => {
  it("rejects a missing signature", () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_example_key";
    expect(verifyPaystackSignature("{}", null)).toBe(false);
  });

  it("rejects a signature of the wrong length without throwing", () => {
    // timingSafeEqual throws on length mismatch; a forged header must produce a
    // clean rejection rather than a 500.
    process.env.PAYSTACK_SECRET_KEY = "sk_test_example_key";
    expect(() => verifyPaystackSignature("{}", "tooshort")).not.toThrow();
    expect(verifyPaystackSignature("{}", "tooshort")).toBe(false);
  });

  it("rejects a correctly sized but incorrect signature", () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_example_key";
    expect(verifyPaystackSignature("{}", "a".repeat(128))).toBe(false);
  });

  it("refuses to verify when no secret is configured", () => {
    delete process.env.PAYSTACK_SECRET_KEY;
    expect(verifyPaystackSignature("{}", "a".repeat(128))).toBe(false);
  });
});

describe("Nigerian formatting", () => {
  it("accepts the ways a guardian phone number gets typed", () => {
    expect(normaliseNigerianPhone("08031234567")).toBe("+2348031234567");
    expect(normaliseNigerianPhone("+234 803 123 4567")).toBe("+2348031234567");
    expect(normaliseNigerianPhone("234-803-123-4567")).toBe("+2348031234567");
    expect(normaliseNigerianPhone("8031234567")).toBe("+2348031234567");
  });

  it("rejects input that cannot be a Nigerian mobile number", () => {
    expect(normaliseNigerianPhone("12345")).toBeNull();
    expect(normaliseNigerianPhone("")).toBeNull();
    expect(normaliseNigerianPhone(null)).toBeNull();
  });

  it("always shows money with a naira sign and kobo", () => {
    expect(formatNaira(1250000)).toContain("1,250,000.00");
    expect(formatNaira(0)).toContain("0.00");
    expect(formatNaira("not a number")).toContain("0.00");
  });

  it("derives the session from the Nigerian academic calendar", () => {
    // Sessions run September to July and are written 2025/2026.
    expect(currentSession(new Date("2026-10-01"))).toBe("2026/2027");
    expect(currentSession(new Date("2026-03-01"))).toBe("2025/2026");
  });
});
