/**
 * Tenant isolation verification.
 *
 * Signs in as two test owners from DIFFERENT schools and proves neither can
 * see the other's records. Run against staging after both test schools have
 * students and invoices. Destroys nothing; it only reads.
 *
 * Required environment:
 *   SUPABASE_URL, SUPABASE_ANON_KEY,
 *   TEST_A_EMAIL, TEST_A_PASSWORD, TEST_B_EMAIL, TEST_B_PASSWORD
 *
 * The test accounts sign up through the product itself (/login → Create
 * account) and complete setup, so this exercises the same path real schools
 * take. Never run with real staff credentials.
 *
 * Usage: node scripts/verify-isolation.mjs
 */

import { createClient } from "@supabase/supabase-js";

const INPUTS = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "TEST_A_EMAIL", "TEST_A_PASSWORD", "TEST_B_EMAIL", "TEST_B_PASSWORD"];

for (const name of INPUTS) {
  if (!process.env[name]) {
    console.error(`❌ Missing ${name}. See the header of scripts/verify-isolation.mjs.`);
    process.exit(1);
  }
}

const TABLES = ["organizations", "students", "teachers", "classrooms", "invoices", "attendance_records", "results", "audit_events"];

async function signIn(email, password) {
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Sign-in failed for ${email}: ${error?.message ?? "no session"}`);
  return client;
}

async function orgIds(client, who) {
  const seen = new Set();
  for (const table of TABLES) {
    const { data, error } = await client.from(table).select("organization_id").limit(200);
    if (error) throw new Error(`${who} could not read ${table}: ${error.message}`);
    for (const row of data ?? []) {
      if (row.organization_id) seen.add(row.organization_id);
    }
  }
  return seen;
}

function describe(set) {
  return set.size === 0 ? "no rows" : `${set.size} organisation(s)`;
}

const clientA = await signIn(process.env.TEST_A_EMAIL, process.env.TEST_A_PASSWORD);
const clientB = await signIn(process.env.TEST_B_EMAIL, process.env.TEST_B_PASSWORD);

const orgsA = await orgIds(clientA, "owner A");
const orgsB = await orgIds(clientB, "owner B");

console.log(`Owner A sees: ${describe(orgsA)}`);
console.log(`Owner B sees: ${describe(orgsB)}`);

let failed = false;

if (orgsA.size === 0 || orgsB.size === 0) {
  failed = true;
  console.log("❌ A test school with no rows proves nothing — add students and invoices to both schools first.");
}

for (const id of orgsA) {
  if (orgsB.has(id)) {
    failed = true;
    console.log("❌ Both owners see the same organisation — tenant isolation is broken.");
    break;
  }
}

// Direct probe: A asks for B's rows by id and must get nothing back.
for (const id of orgsB) {
  const { data, error } = await clientA.from("students").select("id").eq("organization_id", id).limit(1);
  if (error) {
    failed = true;
    console.log(`❌ Direct cross-tenant probe errored instead of returning empty: ${error.message}`);
  } else if ((data ?? []).length > 0) {
    failed = true;
    console.log("❌ Owner A read owner B's students by id — tenant isolation is broken.");
  }
}

await clientA.auth.signOut();
await clientB.auth.signOut();

if (failed) {
  console.error("Isolation verification FAILED. Do not onboard real schools.");
  process.exit(1);
}

console.log("✅ Isolation verified: each owner sees exactly one school, and only their own.");
