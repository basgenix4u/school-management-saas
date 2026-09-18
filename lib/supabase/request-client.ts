import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Request-scoped Supabase client.
 *
 * This client carries the caller's session, so every query executes as that
 * user and the row level security policies in
 * supabase/migrations/..._strict_rls_and_audit.sql apply.
 *
 * Prefer this everywhere a request acts on behalf of a signed-in user. The
 * service role client in ./server.ts bypasses RLS by design and is reserved for
 * work that has no user context: webhook processing, scheduled jobs and the
 * first-owner bootstrap that runs before any membership row exists.
 *
 * Using the service role for user traffic would silently disable tenant
 * isolation, because a missing WHERE clause would no longer be caught by the
 * database.
 */
export function hasRequestSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function createRequestSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot mutate cookies; proxy.ts refreshes the session.
        }
      },
    },
  });
}

/** Returns null when Supabase is unconfigured so callers can degrade gracefully. */
export async function requestClientOrNull() {
  if (!hasRequestSupabaseConfig()) return null;
  return createRequestSupabaseClient();
}
