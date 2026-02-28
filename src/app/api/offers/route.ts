import { NextRequest, NextResponse } from 'next/server';
import { offerService } from '@/lib/api/offers';
import { getIdempotentResponse, storeIdempotentResponse } from '@/lib/api/idempotency';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/offers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id');

    let offers;
    try {
      if (organizationId) {
        offers = await offerService.getByOrganizationId(organizationId);
      } else {
        offers = await offerService.getAll();
      }
    } catch (error) {
      console.error('Error fetching offers in route handler:', error);

      const { data: fallbackOffers } = await supabase
        .from('offers')
        .select('id, title, status, total_amount, organization_id, created_at, updated_at')
        .order('created_at', { ascending: false });

      offers = fallbackOffers || [];
    }

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Error in GET /api/offers:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/offers
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cachedResponse = await getIdempotentResponse(request, 'crm:offers:post');
    if (cachedResponse) {
      return cachedResponse;
    }

    const body = await request.json();
    if (body?.offer?.contact_id) delete body.offer.contact_id;

    // Extract helper-only field for selected links
    let linkIds: string[] | null = null;
    if (body?.offer?.offer_selected_link_ids) {
      const raw = body.offer.offer_selected_link_ids as unknown;
      if (Array.isArray(raw)) {
        linkIds = raw as string[];
      } else if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) linkIds = parsed as string[];
        } catch {}
      }
      delete body.offer.offer_selected_link_ids;
    }

    // Validate required fields
    if (!body.offer || !body.offer.organization_id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    if (!body.offer.status) {
      body.offer.status = 'draft';
    }

    if (!body.offer.currency) {
      body.offer.currency = 'EUR';
    }

    // Recalculate total from services if provided
    if (body.services && body.services.length > 0) {
      const subtotal = body.services.reduce((sum: number, raw: any) => {
        const price = Number(raw.price) || 0;
        const qty = Number(raw.quantity) || 0;
        return sum + price * qty;
      }, 0);
      const pct = Number(body.offer.global_discount_percentage) || 0;
      body.offer.total_amount = subtotal * (1 - (pct > 0 ? pct / 100 : 0));
    } else if (body.offer.global_discount_percentage && Number(body.offer.global_discount_percentage) > 0) {
      const originalAmount = Number(body.offer.total_amount) || 0;
      body.offer.total_amount = originalAmount * (1 - Number(body.offer.global_discount_percentage) / 100);
    }

    // Create offer with services
    const result = await offerService.createOfferWithServices(body.offer, body.services || []);

    // Persist selected links if provided
    try {
      if (Array.isArray(linkIds) && linkIds.length > 0) {
        await offerService.setSelectedLinks(result.offer.id, linkIds);
      }
    } catch (e) {
      console.warn('Failed to persist selected offer links (create):', e);
    }

    await storeIdempotentResponse(request, 'crm:offers:post', result, 201);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/offers:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
