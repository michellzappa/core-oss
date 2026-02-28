import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase-service-role";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const incomingName: unknown =
      body?.display_name ?? body?.name ?? body?.full_name;
    const name = typeof incomingName === "string" ? incomingName.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { full_name: name, name },
    });

    if (error) {
      console.error("Failed to update user metadata:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    const email: string = data.user?.email ?? "";
    const display_name =
      name || (email.includes("@") ? email.split("@")[0] : email);

    return NextResponse.json({
      id,
      email,
      display_name,
      user_metadata: data.user?.user_metadata ?? {},
    });
  } catch (err) {
    console.error("Error in PATCH /api/auth/users/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
