import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { apiError } from "../lib/http";

/**
 * API hardening guarantees: uniform failure handling, throttled mutations,
 * and keyboard access to content.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

function routeFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(join(root, dir))) {
    const rel = join(dir, entry);
    if (entry === "node_modules" || entry === ".next") continue;
    if (entry === "route.ts") found.push(rel);
    else if (!entry.includes(".")) routeFiles(rel, found);
  }
  return found;
}

describe("failure responses", () => {
  it("logs fully but answers safely", async () => {
    const errors: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    try {
      const leaky = await apiError("POST /api/test", new Error('duplicate key value violates unique constraint "x"')).json();
      expect(leaky).toEqual({ status: "error", message: "Something went wrong. Please try again." });
      const operational = await apiError("POST /api/test", new Error("Student STU-1 not found")).json();
      expect(operational).toEqual({ status: "error", message: "Student STU-1 not found" });
      expect(errors.length).toBe(2);
      expect(String(errors[0][1])).toContain("duplicate key");
    } finally {
      console.error = original;
    }
  });

  it("routes every 500 through the shared handler", () => {
    const offenders: string[] = [];
    for (const file of routeFiles(join("app", "api"))) {
      const source = read(file);
      if (source.includes("{ status: 500 }") && !source.includes("@/lib/http")) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("removed the unwired insights endpoint", () => {
    expect(existsSync(join(root, "app", "api", "insights", "route.ts"))).toBe(false);
  });
});

describe("mutation throttling", () => {
  it("throttles every state-changing handler except provider callbacks", () => {
    const exempt = [join("app", "api", "payments", "paystack", "webhook", "route.ts"), join("app", "api", "payments", "paystack", "verify", "route.ts")];
    const offenders: string[] = [];
    for (const file of routeFiles(join("app", "api"))) {
      if (exempt.includes(file)) continue;
      const lines = read(file).split("\n");
      let handler: string | null = null;
      let throttled = true;
      lines.forEach((line, index) => {
        const match = line.match(/export (?:const|async function) (GET|POST|PUT|PATCH)\b/);
        if (match) {
          if (handler && ["POST", "PUT", "PATCH"].includes(handler) && !throttled) {
            offenders.push(`${file}:${index} ${handler}`);
          }
          handler = match[1];
          throttled = false;
        }
        if (line.includes("checkRateLimit(")) throttled = true;
      });
      if (handler && ["POST", "PUT", "PATCH"].includes(handler) && !throttled) {
        offenders.push(`${file}:EOF ${handler}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("skip links", () => {
  it("styles an accessible skip link", () => {
    expect(read("app/components.css")).toContain(".skip-link");
  });

  it("anchors shell and portals for keyboard users", () => {
    expect(read("components/DashboardLayout.tsx")).toContain('href="#main-content"');
    expect(read("components/DashboardLayout.tsx")).toContain('id="main-content"');
    for (const file of [
      "components/portal/ParentPortal.tsx",
      "components/portal/StudentPortal.tsx",
      "components/portal/PortalReceipt.tsx",
    ]) {
      expect(read(file)).toContain('href="#portal-content"');
      expect(read(file)).toContain('id="portal-content"');
    }
  });
});
