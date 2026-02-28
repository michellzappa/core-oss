import { NextRequest, NextResponse } from 'next/server';
import { offerService } from '@/lib/api/offers';
import type { Offer } from '@/lib/api/offers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/offers/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the offer
    const { data: offer, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching offer:', error);
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error in GET /api/offers/:id:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/offers/[id]
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
    
    // Validate the request body
    if (!body.offer) {
      return NextResponse.json({ error: 'Offer data is required' }, { status: 400 });
    }
    
    // Get the existing offer
    const { data: existingOffer } = await supabase
      .from('offers')
      .select('organization_id, status')
      .eq('id', id)
      .single() as { data: { organization_id: string | null; status: string } | null };
    
    // Always recalculate total from services if provided (global discount only)
    if (body.services && body.services.length > 0) {
      const subtotal = body.services.reduce((sum: number, raw: any) => {
        const price = Number(raw.price) || 0;
        const qty = Number(raw.quantity) || 0;
        return sum + price * qty;
      }, 0);
      const pct = Number(body.offer.global_discount_percentage) || 0;
      body.offer.total_amount = subtotal * (1 - (pct > 0 ? pct / 100 : 0));
    } else if (body.offer.global_discount_percentage && Number(body.offer.global_discount_percentage) > 0) {
      // Apply global discount to existing total_amount if no services provided
      const originalAmount = Number(body.offer.total_amount) || 0;
      body.offer.total_amount = originalAmount * (1 - Number(body.offer.global_discount_percentage) / 100);
    }
    
    // Remove services and helper-only fields from offer data to prevent schema errors
    const offerData: Partial<Offer> = { ...body.offer };
    delete (offerData as Record<string, unknown>).services;
    delete (offerData as Record<string, unknown>).offer_selected_link_ids;
    // Validate status against DB constraint. If missing AND existing is invalid, coerce to 'draft'
    const validOfferStatuses: Array<Offer['status']> = [
      'draft',
      'sent',
    ];
    const hasStatus = Object.prototype.hasOwnProperty.call(offerData, 'status');
    if (hasStatus) {
      const incomingStatus = offerData.status as Offer['status'] | undefined;
      if (!incomingStatus || !validOfferStatuses.includes(incomingStatus)) {
        const existingStatus = (existingOffer?.status as Offer['status'] | undefined) || 'draft';
        offerData.status = validOfferStatuses.includes(existingStatus)
          ? existingStatus
          : 'draft';
      }
    } else {
      const existingStatus = (existingOffer?.status as Offer['status'] | undefined) || 'draft';
      if (!validOfferStatuses.includes(existingStatus)) {
        offerData.status = 'draft';
      }
    }
    
    // Log incoming update body for diagnostics
    console.log(`[PUT /api/offers/${id}] incoming body:`, JSON.stringify(body));
    // Update offer with services
    const result = await offerService.updateOfferWithServices(id, offerData, body.services || []);

    // Persist selected links if provided
    try {
      const raw = body?.offer?.offer_selected_link_ids as unknown;
      const linkIds: string[] = Array.isArray(raw) ? (raw as string[]) : [];
      console.log(`[PUT /api/offers/${id}] persisting links:`, linkIds);
      await offerService.setSelectedLinks(id, linkIds);
    } catch (e) {
      console.warn('Failed to persist selected offer links:', e);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error in PUT /api/offers/${(await params).id}:`, error);
    
    // Provide more detailed error message
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      // Log the detailed error for debugging
      console.error('Detailed error:', error.message);
      
      // Handle specific database errors
      if (error.message.includes('violates check constraint "offers_discount_type_check"')) {
        errorMessage = 'Invalid discount type. Must be one of: none, global, or per_item';
        statusCode = 400;
      } else if (error.message.includes('violates foreign key constraint')) {
        errorMessage = 'Invalid reference: One of the referenced IDs does not exist';
        statusCode = 400;
      } else if (error.message.includes('violates not-null constraint')) {
        errorMessage = 'Missing required field: A required field is missing';
        statusCode = 400;
      } else if (error.message.includes('duplicate key value violates unique constraint')) {
        errorMessage = 'Duplicate entry: This record already exists';
        statusCode = 400;
      } else {
        // Use the original error message for other cases
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// DELETE /api/offers/[id]
export async function DELETE(
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
    
    // Delete offer
    await offerService.delete(id);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`Error in DELETE /api/offers/${(await params).id}:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 