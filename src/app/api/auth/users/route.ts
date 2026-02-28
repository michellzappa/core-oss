import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase-service-role";

export async function GET() {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error listing users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = (data?.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
      phone: u.phone,
      user_metadata: u.user_metadata || {},
      app_metadata: u.app_metadata || {},
      display_name:
        (u.user_metadata as Record<string, unknown>)?.display_name ||
        (u.user_metadata as Record<string, unknown>)?.full_name ||
        u.email?.split("@")[0] ||
        "User",
    }));

    return NextResponse.json(users);
  } catch (err) {
    console.error("Error in GET /api/auth/users:", err);
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body?.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
    });
  } catch (err) {
    console.error("Error in POST /api/auth/users:", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
