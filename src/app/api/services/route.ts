import { NextRequest, NextResponse } from 'next/server';
import { getIdempotentResponse, storeIdempotentResponse } from '@/lib/api/idempotency';
import { serviceService } from '@/lib/api/services';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { serviceCreateSchema } from '@/lib/validation/schemas';

// GET /api/services
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const isRecurring = searchParams.get('is_recurring');
    
    // Get services based on filters
    let services;
    if (isRecurring === 'true') {
      services = await serviceService.getRecurringServices();
    } else if (isRecurring === 'false') {
      services = await serviceService.getOneTimeServices();
    } else {
      services = await serviceService.getAll();
    }
    
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error in GET /api/services:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/services
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cachedResponse = await getIdempotentResponse(
      request,
      "crm:services:post",
    );
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate data with Zod schema
    const validationResult = serviceCreateSchema.safeParse(body);
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
    
    // Set recurring_interval to 'yearly' for recurring services
    if (body.is_recurring) {
      body.recurring_interval = 'yearly';
    }
    
    // Create service
    const service = await serviceService.create({
      ...validatedData,
      group_type: validatedData.group_type || null,
      category:
        validatedData.category === undefined ? null : validatedData.category,
      recurring_interval: validatedData.is_recurring ? 'yearly' : null,
      url: null,
      icon: null
    });
    
    await storeIdempotentResponse(request, "crm:services:post", service, 201);
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/services:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 
