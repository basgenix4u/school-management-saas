/**
 * Deployment smoke test.
 *
 * Public pages must render (200), dashboard pages must bounce to login, and
 * data APIs must refuse anonymous callers with 401 — a 200 there would mean
 * an authorization guard went missing. Portal pages render their shell (200)
 * but load nothing: their data endpoints answer 401 below.
 *
 * Usage: BASE_URL=https://staging.example.com node scripts/smoke-test.mjs
 */

const baseUrl = process.env.BASE_URL || process.argv[2] || "http://localhost:3000";

const checks = [
  { path: "/", expect: [200] },
  { path: "/login", expect: [200] },
  { path: "/pricing", expect: [200] },
  { path: "/dashboard", expect: [307, 308] },
  { path: "/dashboard/students", expect: [307, 308] },
  { path: "/dashboard/fees", expect: [307, 308] },
  { path: "/dashboard/results", expect: [307, 308] },
  { path: "/portal/parent", expect: [200] },
  { path: "/portal/student", expect: [200] },
  { path: "/api/health", expect: [200] },
  { path: "/api/portal/parent", expect: [401] },
  { path: "/api/portal/student", expect: [401] },
  { path: "/api/students", expect: [401] },
  { path: "/api/teachers", expect: [401] },
  { path: "/api/attendance", expect: [401] },
  { path: "/api/attendance/register", expect: [401] },
  { path: "/api/finance/invoices", expect: [401] },
  { path: "/api/results", expect: [401] },
  { path: "/api/results/roster", expect: [401] },
  { path: "/api/insights/ask", expect: [405] },
  { path: "/api/audit", expect: [401] },
  { path: "/api/communications", expect: [401] },
  { path: "/api/invitations", expect: [401] },
  { path: "/api/setup/status", expect: [401] },
  { path: "/api/database/status", expect: [401] },
];

let failures = 0;

console.log(`Smoke testing ${baseUrl}`);

for (const check of checks) {
  const url = new URL(check.path, baseUrl).toString();
  try {
    const response = await fetch(url, { redirect: "manual" });
    const ok = check.expect.includes(response.status);
    if (!ok) failures += 1;
    console.log(`${ok ? "✅" : "❌"} ${response.status} ${check.path} (expected ${check.expect.join("/")})`);
  } catch (error) {
    failures += 1;
    console.log(`❌ ERROR ${check.path}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

if (failures > 0) {
  console.error(`Smoke test failed with ${failures} failure(s).`);
  process.exit(1);
}

console.log("Smoke test passed.");
