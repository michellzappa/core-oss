import { ApiService } from '../api-service';

export interface SettingsPaymentTerm {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
}

export interface SettingsDeliveryCondition {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
}

export interface SettingsOfferLinkPreset {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  url: string;
  icon?: string | null;
  is_active: boolean;
  is_default: boolean;
}

export const paymentTermService = new ApiService<SettingsPaymentTerm>('settings_payment_terms');
export const deliveryConditionService = new ApiService<SettingsDeliveryCondition>('settings_delivery_conditions');
export const offerLinkPresetService = new ApiService<SettingsOfferLinkPreset>('settings_offer_links');
