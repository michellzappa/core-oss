import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { corporateEntityService } from "@/lib/services/corporate-entity-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const corporateEntity = await corporateEntityService.getById(id);
    
    if (!corporateEntity) {
      return NextResponse.json({ error: "Corporate entity not found" }, { status: 404 });
    }
    
    return NextResponse.json(corporateEntity);
  } catch (error: unknown) {
    console.error(`Error fetching corporate entity with id ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    
    const corporateEntity = await corporateEntityService.update(id, body);
    return NextResponse.json(corporateEntity);
  } catch (error: unknown) {
    console.error(`Error updating corporate entity with id ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await corporateEntityService.delete(id);
    return NextResponse.json({ message: "Corporate entity deleted successfully" });
  } catch (error: unknown) {
    console.error(`Error deleting corporate entity with id ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 