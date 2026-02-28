import { NextRequest, NextResponse } from "next/server";
import { getIdempotentResponse, storeIdempotentResponse } from "@/lib/api/idempotency";
import { projectService } from "@/lib/api/projects";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { projectCreateSchema } from "@/lib/validation/schemas";

// GET /api/projects
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await projectService.getAll();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error in GET /api/projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cachedResponse = await getIdempotentResponse(
      request,
      "crm:projects:post",
    );
    if (cachedResponse) {
      return cachedResponse;
    }

    const data = await request.json();
    console.log('Received project data:', data);

    // Validate data with Zod schema
    const validationResult = projectCreateSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Create project
    const project = await projectService.create({
      ...validatedData,
      description: validatedData.description || null,
      url: validatedData.url || null,
      organization_id: validatedData.organization_id || null,
      start_date: validatedData.start_date || null,
      end_date: validatedData.end_date || null,
    });

    console.log('Project created:', project);
    await storeIdempotentResponse(request, "crm:projects:post", project, 200);
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error in POST /api/projects:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { error: "Invalid organization or lead reference" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Removed unused function 
