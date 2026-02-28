import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-service';

// POST /api/public/offers/[id]/accept
// Body: { name: string; email?: string; email_for_access?: string; metadata?: Record<string, unknown> }
// Captures simple e-signature acceptance for finalized/sent offers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Cast to any to work around Supabase Database type `never` inference on relation selects
  const supabase = createServiceSupabaseClient() as any;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      email_for_access?: string;
      metadata?: Record<string, unknown>;
    };

    const signerName = String(body?.name || '').trim();
    if (!signerName) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    const emailForAccess = (body?.email_for_access || body?.email || '').trim();
    if (!emailForAccess) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    // Validate that the offer exists
    const { data: existingOffer, error: offerError } = await supabase
      .from('offers')
      .select('id, status')
      .eq('id', id)
      .single();

    if (offerError || !existingOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Gather lightweight metadata
    const ip =
      (request.headers.get('x-forwarded-for') || '')
        .split(',')[0]
        ?.trim() ||
      request.headers.get('x-real-ip') ||
      '';
    const userAgent = request.headers.get('user-agent') || '';
    const metadata = {
      ...(body?.metadata || {}),
      ip,
      userAgent,
      accepted_source: 'public',
    } as Record<string, unknown>;

    const acceptedAt = new Date().toISOString();
    const acceptedByEmail = body?.email || emailForAccess;

    // Update offer acceptance fields and status
    const { data: updated, error: updateError } = await supabase
      .from('offers')
      .update({
        is_accepted: true,
        accepted_at: acceptedAt,
        accepted_by_name: signerName,
        accepted_by_email: acceptedByEmail,
        accepted_ip: ip,
        accepted_user_agent: userAgent,
        accepted_metadata: metadata,
        updated_at: acceptedAt,
      })
      .eq('id', id)
      .select(`
        id,
        title,
        currency,
        total_amount,
        valid_until,
        created_at,
        organization:organizations(id, name, legal_name),
        corporate_entity:corporate_entities(id, name, legal_name)
      `)
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to accept offer' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, offer: updated as any });
  } catch (e) {
    console.error('public accept offer error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
