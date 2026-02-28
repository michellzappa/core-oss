import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-service';
import { getOfferDisplayLabel } from '@/lib/utils';

// GET /api/public/offers/[id]
// Query params: ?email=optional@email.com
// Returns offer data if valid UUID and not expired
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Cast to any to work around Supabase Database type `never` inference on relation selects
  const supabase = createServiceSupabaseClient() as any;

  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email')?.trim() || null;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid offer ID' }, { status: 400 });
    }

    // Get offer data
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select(`
        *,
        organization:organizations(*),
        corporate_entity:corporate_entities(*)
      `)
      .eq('id', id)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Cast to any to avoid Supabase relation-select `never` type inference
    const offerData = offer as any;

    // If payment_terms_text is null/empty but payment_term_id exists, fetch from relationship
    if (!offerData.payment_terms_text && offerData.payment_term_id) {
      try {
        const { data: paymentTerm } = await supabase
          .from('settings_payment_terms')
          .select('description')
          .eq('id', offerData.payment_term_id)
          .maybeSingle();

        if (paymentTerm?.description) {
          offerData.payment_terms_text = paymentTerm.description;
        }
      } catch (e) {
        console.warn('Failed to fetch payment terms from relationship:', e);
      }
    }

    const isExpired = offerData.valid_until && new Date(offerData.valid_until) < new Date();

    // Get offer services
    const { data: services, error: servicesError } = await supabase
      .from('offer_services')
      .select(`
        *,
        services:service_id(
          name,
          description,
          group_type,
          is_recurring,
          url,
          icon
        )
      `)
      .eq('offer_id', id);

    if (servicesError) {
      console.error('Error fetching offer services:', servicesError);
      return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
    }

    // Cast to any[] to avoid Supabase relation-select `never` type inference
    const servicesData = (services || []) as any[];

    // Transform services data
    const transformedServices = servicesData.map(service => ({
      service_id: service.service_id,
      quantity: service.quantity,
      price: service.price,
      discount_percentage: service.discount_percentage || 0,
      service_name: service.is_custom ? service.custom_title : service.services?.name,
      service_description: service.is_custom ? null : service.services?.description,
      custom_description: service.custom_description || undefined,
      group_type: service.services?.group_type || 'Other',
      is_recurring: service.services?.is_recurring || false,
      url: service.services?.url,
      icon: service.services?.icon,
      is_custom: service.is_custom || false,
      custom_title: service.custom_title
    }));

    // Get selected links if any
    let transformedLinks: Array<{ title: string; url: string; icon: string | null }> = [];
    try {
      const { data: selectedLinks, error: linksError } = await supabase
        .from('offer_selected_links')
        .select(`
          id,
          offer_id,
          link_id,
          is_enabled,
          settings_offer_links:link_id(
            id,
            title,
            url,
            icon,
            is_active
          )
        `)
        .eq('offer_id', id)
        .eq('is_enabled', true);

      if (linksError) {
        console.warn('Error fetching selected links:', linksError);
      } else if (selectedLinks && selectedLinks.length > 0) {
        const linksData = selectedLinks as any[];
        transformedLinks = linksData
          .filter(link => link.settings_offer_links && link.settings_offer_links.is_active)
          .map(link => ({
            title: link.settings_offer_links.title,
            url: link.settings_offer_links.url,
            icon: link.settings_offer_links.icon
          }));
      }
    } catch (error) {
      console.warn('Exception fetching selected links:', error);
    }

    // Log access attempt (for analytics)
    if (email) {
      try {
        await supabase
          .from('offer_access_logs')
          .insert({
            offer_id: id,
            accessed_email: email,
            accessed_at: new Date().toISOString(),
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
            user_agent: request.headers.get('user-agent') || null
          });
      } catch (logError) {
        console.warn('Failed to log offer access:', logError);
      }
    }

    // Agreement defaults
    const agreementDate = offerData.agreement_date || offerData.created_at || null;
    const agreementStartDate =
      offerData.agreement_start_date || offerData.created_at || null;
    const agreementEndDate =
      offerData.agreement_end_date || offerData.valid_until || null;
    const agreementNoticeEmail = offerData.agreement_notice_email || null;
    const agreementIncludeAnnex =
      typeof offerData.agreement_include_annex === 'boolean'
        ? offerData.agreement_include_annex
        : true;
    const agreementTermsOverride = offerData.agreement_terms_override || null;

    return NextResponse.json({
      offer: {
        ...offerData,
        selected_links: transformedLinks,
        is_expired: isExpired || false,
        agreement_date: agreementDate,
        agreement_start_date: agreementStartDate,
        agreement_end_date: agreementEndDate,
        agreement_notice_email: agreementNoticeEmail,
        agreement_include_annex: agreementIncludeAnnex,
        agreement_terms_override: agreementTermsOverride,
      },
      services: transformedServices
    });

  } catch (error) {
    console.error('Error in public offer API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
