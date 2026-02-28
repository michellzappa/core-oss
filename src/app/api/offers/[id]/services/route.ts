import { NextRequest, NextResponse } from 'next/server';
import { offerService } from '@/lib/api/offers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/offers/[id]/services
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Offer ID is required' }, { status: 400 });
    }

    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get offer with services
    const data = await offerService.getOfferWithServices(id);
    
    if (!data) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in GET /api/offers/[id]/services:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 