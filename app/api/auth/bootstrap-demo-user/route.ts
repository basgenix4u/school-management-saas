import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ status: "not_configured", message: "Supabase env vars are required." }, { status: 503 });
  }

  const secret = request.headers.get("x-bootstrap-secret");
  if (!process.env.DEMO_BOOTSTRAP_SECRET || secret !== process.env.DEMO_BOOTSTRAP_SECRET) {
    return NextResponse.json({ status: "forbidden", message: "Invalid bootstrap secret." }, { status: 403 });
  }

  const supabase = createServerSupabaseClient();
  const body = await request.json().catch(() => ({}));
  const email = body.email ?? "admin@greenfield.test";
  const password = body.password ?? "ChangeMe123!";

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Greenfield Demo Admin" },
  });

  if (error && !error.message.toLowerCase().includes("already")) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    status: "ok",
    message: "Demo user created or already exists. Link app_users.auth_user_id manually if needed.",
    userId: data.user?.id,
    email,
  });
}
