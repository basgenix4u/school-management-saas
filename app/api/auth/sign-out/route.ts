import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/server";
import { createCookieSupabaseClient } from "@/lib/auth/session";

export async function POST() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ status: "ok", mode: "demo", message: "Demo mode has no server session." });
  }

  const supabase = await createCookieSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.json({ status: "ok" });
}
