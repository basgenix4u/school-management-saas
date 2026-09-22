import { NextResponse } from "next/server";

/**
 * Uniform server-failure responses.
 *
 * The full error is logged for operators (Vercel captures stdout), while
 * callers receive either the operational message or a generic fallback.
 * Database-flavored text — table names, constraints, RLS internals — never
 * reaches the client, where it would leak schema details and confuse users.
 */
const LEAKY = /relation |column |constraint |violates row-level|syntax error|permission denied|jwt|token|database|postgres|supabase|duplicate key|foreign key/i;

export function logApiError(route: string, error: unknown) {
  const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(`[api:${route}]`, detail);
}

export function apiError(route: string, error: unknown, fallback = "Something went wrong. Please try again.") {
  logApiError(route, error);
  const raw = error instanceof Error ? error.message : "";
  const message = raw && !LEAKY.test(raw) ? raw : fallback;
  return NextResponse.json({ status: "error", message }, { status: 500 });
}
