import { NextRequest, NextResponse } from 'next/server';
import { offerService } from '@/lib/api/offers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// PUT /api/offers/[id]/status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Validate status value
    const validStatuses = ['draft', 'sent'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Update offer status
    const offer = await offerService.updateStatus(id, body.status);
    
    return NextResponse.json(offer);
  } catch (error) {
    console.error(`Error in PUT /api/offers/${(await params).id}/status:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 