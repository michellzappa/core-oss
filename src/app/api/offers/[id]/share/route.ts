import { NextRequest, NextResponse } from 'next/server';
// import { offerService } from '@/lib/api/offers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/offers/[id]/share
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const offerId = id;
    
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // const userId = session.user.id;
    
    // Ensure the offer exists
    const { data: offer } = await supabase
      .from('offers')
      .select('id')
      .eq('id', offerId)
      .single();
      
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    
    // Get request body
    // const body = await request.json();
    // const expiresInDays = body.expiresInDays || 30;
    
    try {
      // Create a public link for the offer
      return NextResponse.json({ error: 'Public link creation is disabled. Use /offers/public/id/[id] with email.' }, { status: 400 });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating share link';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(`Error in POST /api/offers/[id]/share:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 