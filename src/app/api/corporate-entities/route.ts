import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { corporateEntityService } from "@/lib/services/corporate-entity-service";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const corporateEntities = await corporateEntityService.getAll();
    return NextResponse.json(corporateEntities);
  } catch (error: unknown) {
    console.error("Error fetching corporate entities:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    
    const corporateEntity = await corporateEntityService.create(body);
    return NextResponse.json(corporateEntity, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating corporate entity:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 