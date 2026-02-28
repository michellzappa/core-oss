import { NextRequest, NextResponse } from "next/server";
import { getIdempotentResponse, storeIdempotentResponse } from "@/lib/api/idempotency";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/organizations
export async function GET() {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all organizations
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('id, name, legal_name, country, profile_image_url')
      .order('name');
    
    if (error) {
      console.error('Error fetching organizations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(organizations || []);
  } catch (error) {
    console.error('Error in GET /api/organizations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/organizations
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cachedResponse = await getIdempotentResponse(
      request,
      "crm:organizations:post",
    );
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Get request body
    const body = await request.json();
    
    // Create organization
    const { data: organization, error } = await supabase
      .from('organizations')
      .insert(body)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating organization:', error);
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      );
    }
    
    await storeIdempotentResponse(
      request,
      "crm:organizations:post",
      organization,
      201,
    );
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/organizations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
