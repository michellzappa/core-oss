import { ApiService } from '../api-service';
import { createServerSupabaseClient } from '../supabase-server';

export interface Offer {
  id: string;
  created_at: string;
  updated_at: string;
  title?: string;
  organization_id?: string;
  contact_id?: string;
  corporate_entity_id?: string;
  valid_until?: string;
  status: 'draft' | 'sent';
  is_accepted?: boolean;
  total_amount: number;
  currency: string;
  global_discount_percentage?: number;
  discount_reason?: string | null;
  tax_percentage?: number | null;
  tax_reason?: string | null;
  comments?: string;
  payment_term_id?: string | null;
  delivery_condition_id?: string | null;
  is_self_submitted?: boolean;
  accepted_at?: string;
  accepted_by_name?: string;
  accepted_by_email?: string;
  organization?: {
    id: string;
    name: string;
    country?: string;
  };
  [key: string]: unknown;
}

export interface OfferService {
  id?: string;
  created_at?: string;
  offer_id: string;
  service_id?: string;
  quantity: number;
  price: number;
  discount_percentage?: number;
  custom_title?: string;
  is_custom?: boolean;
  custom_description?: string;
}

export interface OfferSelectedLink {
  id: string;
  offer_id: string;
  link_id: string;
  is_enabled: boolean;
  created_at: string;
}

export class OfferApiService extends ApiService<Offer> {
  constructor() {
    super('offers');
  }

  async getAll() {
    // Cast to any to work around Supabase Database type `never` inference
    const supabase = await createServerSupabaseClient() as any;

    try {
      const { data: offers, error } = await supabase
        .from('offers')
        .select(`
          *,
          organization:organizations(
            id,
            name,
            country
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offers:', error);
        throw error;
      }

      return (offers as any[]) || [];
    } catch (error) {
      console.error('Error in getAll method:', error);
      const { data: basicOffers } = await supabase
        .from('offers')
        .select('id, title, status, total_amount, created_at, updated_at, organization_id')
        .order('created_at', { ascending: false });

      return (basicOffers as any[]) || [];
    }
  }

  async getByOrganizationId(organizationId: string) {
    const supabase = await createServerSupabaseClient() as any;

    const { data: offers, error } = await supabase
      .from('offers')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          country
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers by organization:', error);
      throw error;
    }

    return (offers as any[]) || [];
  }

  async getOfferWithServices(offerId: string): Promise<{ offer: Offer; services: OfferService[] } | null> {
    const supabase = await createServerSupabaseClient() as any;

    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single();

    if (offerError) {
      if (offerError.code === 'PGRST116') {
        return null;
      }
      throw offerError;
    }

    const { data: offerServices, error: servicesError } = await supabase
      .from('offer_services')
      .select(`
        *,
        services:service_id (
          name
        )
      `)
      .eq('offer_id', offerId);

    if (servicesError) {
      throw servicesError;
    }

    const offerServicesData = (offerServices || []) as any[];
    const servicesWithNames = offerServicesData.map(service => ({
      ...service,
      service_name: service.is_custom ? service.custom_title : service.services?.name
    }));

    return {
      offer: offer as Offer,
      services: servicesWithNames
    };
  }

  async createOfferWithServices(
    offer: Omit<Offer, 'id' | 'created_at' | 'updated_at'>,
    services: Omit<OfferService, 'id' | 'created_at' | 'offer_id'>[]
  ): Promise<{ offer: Offer; services: OfferService[] }> {
    const supabase = await createServerSupabaseClient() as any;

    const { data: newOffer, error: offerError } = await supabase
      .from('offers')
      .insert({
        ...offer,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (offerError) {
      console.error('Error creating offer:', offerError);
      throw offerError;
    }

    // Cast to any to avoid Supabase relation-select `never` type inference
    const newOfferData = newOffer as any;

    // Snapshot payment/delivery text if provided
    try {
      let paymentText: string | null = null;
      if (newOfferData?.payment_term_id) {
        const { data: pt } = await supabase
          .from('settings_payment_terms')
          .select('description')
          .eq('id', newOfferData.payment_term_id as string)
          .maybeSingle();
        paymentText = pt?.description ?? null;
      }
      let deliveryText: string | null = null;
      if (newOfferData?.delivery_condition_id) {
        const { data: dc } = await supabase
          .from('settings_delivery_conditions')
          .select('description')
          .eq('id', newOfferData.delivery_condition_id as string)
          .maybeSingle();
        deliveryText = dc?.description ?? null;
      }
      if (paymentText !== null || deliveryText !== null) {
        await supabase
          .from('offers')
          .update({
            payment_terms_text: paymentText ?? undefined,
            delivery_conditions_text: deliveryText ?? undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', newOfferData.id);
      }
    } catch (e) {
      console.warn('Failed to snapshot terms text:', e);
    }

    const servicesWithOfferId = services.map(service => ({
      service_id: service.service_id || null,
      quantity: service.quantity,
      price: service.price,
      discount_percentage: service.discount_percentage || 0,
      offer_id: newOfferData.id,
      custom_title: service.custom_title || null,
      is_custom: service.is_custom || false,
      custom_description: service.custom_description || null
    }));

    const { data: newServices, error: servicesError } = await supabase
      .from('offer_services')
      .insert(servicesWithOfferId)
      .select();

    if (servicesError) {
      await supabase.from('offers').delete().eq('id', newOfferData.id);
      console.error('Error creating offer services:', servicesError);
      throw servicesError;
    }

    return {
      offer: newOfferData as Offer,
      services: newServices as OfferService[]
    };
  }

  async updateStatus(offerId: string, status: 'draft' | 'sent'): Promise<Offer> {
    return this.update(offerId, {
      status,
      updated_at: new Date().toISOString()
    });
  }

  async updateOfferWithServices(
    offerId: string,
    offer: Partial<Offer> & { services?: Array<Record<string, unknown>> },
    services: Omit<OfferService, 'id' | 'created_at'>[]
  ): Promise<{ offer: Offer; services: OfferService[] }> {
    const supabase = await createServerSupabaseClient() as any;

    try {
      const offerData = { ...offer };
      delete (offerData as Record<string, unknown>).services;
      delete (offerData as Record<string, unknown>).offer_services;

      const { data: existingOffer } = await supabase
        .from('offers')
        .select('global_discount_percentage, status, currency, valid_until, total_amount, organization_id')
        .eq('id', offerId)
        .single();

      if (!existingOffer) {
        throw new Error(`Offer with ID ${offerId} not found`);
      }

      // Cast to any to avoid Supabase `never` type inference
      const existingOfferData = existingOffer as any;

      if (!('global_discount_percentage' in offerData) && existingOfferData.global_discount_percentage) {
        offerData.global_discount_percentage = existingOfferData.global_discount_percentage;
      }

      if (!offerData.currency && existingOfferData.currency) {
        offerData.currency = existingOfferData.currency;
      }

      if (!offerData.valid_until && existingOfferData.valid_until) {
        offerData.valid_until = existingOfferData.valid_until;
      }

      if (!offerData.total_amount && existingOfferData.total_amount) {
        offerData.total_amount = existingOfferData.total_amount;
      }

      if (!offerData.organization_id && existingOfferData.organization_id) {
        offerData.organization_id = existingOfferData.organization_id;
      }

      const { data: updatedOffer, error: offerError } = await supabase
        .from('offers')
        .update({
          ...offerData,
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select()
        .single();

      // Refresh snapshot of terms
      try {
        let paymentText: string | undefined;
        if (offerData.payment_term_id) {
          const { data: pt } = await supabase
            .from('settings_payment_terms')
            .select('description')
            .eq('id', offerData.payment_term_id as string)
            .maybeSingle();
          paymentText = pt?.description ?? undefined;
        }
        let deliveryText: string | undefined;
        if (offerData.delivery_condition_id) {
          const { data: dc } = await supabase
            .from('settings_delivery_conditions')
            .select('description')
            .eq('id', offerData.delivery_condition_id as string)
            .maybeSingle();
          deliveryText = dc?.description ?? undefined;
        }
        if (paymentText !== undefined || deliveryText !== undefined) {
          await supabase
            .from('offers')
            .update({
              payment_terms_text: paymentText,
              delivery_conditions_text: deliveryText,
              updated_at: new Date().toISOString(),
            })
            .eq('id', offerId);
        }
      } catch (e) {
        console.warn('Failed to update terms snapshot:', e);
      }

      if (offerError) {
        console.error('Error updating offer:', offerError);
        throw offerError;
      }

      const { error: deleteError } = await supabase
        .from('offer_services')
        .delete()
        .eq('offer_id', offerId);

      if (deleteError) {
        console.error('Error deleting existing services:', deleteError);
        throw deleteError;
      }

      let newServices: OfferService[] = [];
      if (services && services.length > 0) {
        const servicesWithOfferId = services.map(service => ({
          service_id: service.service_id || null,
          quantity: service.quantity,
          price: service.price,
          discount_percentage: service.discount_percentage || 0,
          offer_id: offerId,
          custom_title: service.custom_title || null,
          is_custom: service.is_custom || false,
          custom_description: service.custom_description || null
        }));

        const { data: insertedServices, error: servicesError } = await supabase
          .from('offer_services')
          .insert(servicesWithOfferId)
          .select();

        if (servicesError) {
          console.error('Error inserting new services:', servicesError);
          throw servicesError;
        }

        newServices = insertedServices as OfferService[];
      }

      // Recalculate total
      try {
        let calcServices: Array<{ price: number; quantity: number }>;
        if (Array.isArray(newServices) && newServices.length > 0) {
          calcServices = newServices.map((s) => ({
            price: Number(s.price || 0),
            quantity: Number(s.quantity || 0),
          }));
        } else {
          const { data: existingServices } = await supabase
            .from('offer_services')
            .select('price, quantity')
            .eq('offer_id', offerId);
          calcServices = (existingServices || []).map((s: any) => ({
            price: Number(s.price || 0),
            quantity: Number(s.quantity || 0),
          }));
        }

        const subtotal = calcServices.reduce(
          (sum, s) => sum + s.price * s.quantity,
          0
        );
        const pct = (offer as any)?.global_discount_percentage ?? existingOfferData.global_discount_percentage ?? 0;
        const discounted = subtotal * (1 - (Number(pct) > 0 ? Number(pct) / 100 : 0));

        await supabase
          .from('offers')
          .update({ total_amount: Math.max(0, Math.round(discounted)), updated_at: new Date().toISOString() })
          .eq('id', offerId);
      } catch (e) {
        console.warn('Failed to recalculate total_amount:', e);
      }

      return {
        offer: updatedOffer as Offer,
        services: newServices
      };
    } catch (error) {
      console.error('Error in updateOfferWithServices:', error);
      throw error;
    }
  }

  async setSelectedLinks(offerId: string, linkIds: string[]): Promise<void> {
    const supabase = await createServerSupabaseClient() as any;
    await supabase.from('offer_selected_links').delete().eq('offer_id', offerId);
    if (linkIds.length === 0) return;
    const rows = linkIds.map((linkId) => ({ offer_id: offerId, link_id: linkId, is_enabled: true }));
    const { error } = await supabase.from('offer_selected_links').insert(rows);
    if (error) throw error;
  }

  async createPublicLink(offerId: string): Promise<string> {
    const supabase = await createServerSupabaseClient() as any;

    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('id')
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      throw new Error(`Offer with ID ${offerId} not found`);
    }

    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}/offers/view/${offerId}`;
  }
}

export const offerService = new OfferApiService();
