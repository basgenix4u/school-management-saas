const baseUrl = process.env.BASE_URL || process.argv[2] || "http://localhost:3000";

const checks = [
  { path: "/", type: "page" },
  { path: "/login", type: "page" },
  { path: "/dashboard", type: "protected-page" },
  { path: "/dashboard/students", type: "protected-page" },
  { path: "/dashboard/fees", type: "protected-page" },
  { path: "/dashboard/results", type: "protected-page" },
  { path: "/portal/parent", type: "protected-page" },
  { path: "/api/health", type: "api" },
  { path: "/api/demo-auth", type: "api" },
  { path: "/api/launch/readiness", type: "api" },
  { path: "/api/database/status", type: "api" },
  { path: "/api/students", type: "api" },
  { path: "/api/finance/invoices", type: "api" },
  { path: "/api/results", type: "api" },
];

const acceptableStatuses = new Set([200, 201, 302, 303, 307, 308]);
let failures = 0;

console.log(`Smoke testing ${baseUrl}`);

for (const check of checks) {
  const url = new URL(check.path, baseUrl).toString();
  try {
    const response = await fetch(url, { redirect: "manual" });
    const ok = acceptableStatuses.has(response.status);
    if (!ok) failures += 1;
    console.log(`${ok ? "✅" : "❌"} ${response.status} ${check.path} (${check.type})`);
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
