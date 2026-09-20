import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Launch-readiness guarantees.
 *
 * The staging runbook is a load-bearing document: a migration applied out of
 * order or an env var the code no longer reads can waste a launch day. These
 * tests keep the runbook, the env template and the verification scripts
 * accurate against the repository itself.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("staging runbook accuracy", () => {
  it("lists every migration in apply order", () => {
    const onDisk = readdirSync(join(root, "supabase", "migrations")).filter((file) => file.endsWith(".sql")).sort();
    const inDoc = [...read("docs/STAGING_LAUNCH.md").matchAll(/`(\d+_.*\.sql)`/g)].map((match) => match[1]);
    expect(inDoc).toEqual(onDisk);
  });

  it("forbids real data before isolation passes", () => {
    const doc = read("docs/STAGING_LAUNCH.md");
    expect(doc).toContain("No real student data enters the system until step 6 passes.");
    expect(doc).toContain("scripts/verify-isolation.mjs");
    expect(doc).toContain("scripts/check-env.mjs");
    expect(doc).toContain("scripts/smoke-test.mjs");
  });
});

describe("environment template accuracy", () => {
  it("documents exactly the variables the app reads", () => {
    const documented = read(".env.example")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split("=")[0]);
    expect([...documented].sort()).toEqual(
      [
        "EMAIL_FROM",
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_SUPABASE_URL",
        "PAYSTACK_SECRET_KEY",
        "RESEND_API_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ].sort(),
    );
  });

  it("carries no retired names", () => {
    const template = read(".env.example");
    for (const stale of ["EduManage", "STRIPE", "AUTH_SECRET", "DATABASE_URL", "DEMO_BOOTSTRAP", "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", "PAYSTACK_WEBHOOK_URL"]) {
      expect(template).not.toContain(stale);
    }
  });
});

describe("environment checker", () => {
  const script = join(root, "scripts", "check-env.mjs");

  it("requires the Supabase trio", () => {
    const source = read("scripts/check-env.mjs");
    for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) {
      expect(source).toContain(name);
    }
  });

  it("fails without variables and passes with them", () => {
    const clean: NodeJS.ProcessEnv = { PATH: process.env.PATH ?? "", NODE_ENV: "test" };
    expect(() => execFileSync("node", [script], { env: clean, stdio: "pipe" })).toThrow();
    const output = execFileSync("node", [script], {
      env: {
        ...clean,
        NEXT_PUBLIC_SUPABASE_URL: "https://staging.example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        SUPABASE_SERVICE_ROLE_KEY: "service",
      },
      encoding: "utf8",
    });
    expect(output).toContain("Environment check passed.");
    expect(output).not.toContain("staging.example");
  });
});

describe("smoke test coverage", () => {
  it("expects refusal on protected APIs and covers live endpoints", () => {
    const smoke = read("scripts/smoke-test.mjs");
    expect(smoke).not.toContain("/api/launch/readiness");
    for (const path of ["/api/audit", "/api/attendance/register", "/api/teachers", "/api/results/roster", "/api/insights", "/api/portal/parent", "/api/portal/student"]) {
      expect(smoke).toContain(path);
    }
    expect(smoke).toContain("expect: [401]");
  });
});

describe("isolation verifier", () => {
  it("documents its inputs and proves disjoint tenancy", () => {
    const verifier = read("scripts/verify-isolation.mjs");
    for (const name of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "TEST_A_EMAIL", "TEST_A_PASSWORD", "TEST_B_EMAIL", "TEST_B_PASSWORD"]) {
      expect(verifier).toContain(name);
    }
    expect(verifier).toContain("signInWithPassword");
    expect(verifier).toContain("tenant isolation is broken");
  });

  it("embeds no credentials", () => {
    const verifier = read("scripts/verify-isolation.mjs");
    expect(verifier).not.toMatch(/sk_(live|test)_/);
    expect(verifier).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}/);
  });
});
