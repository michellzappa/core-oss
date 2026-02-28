export interface Service {
  service_id: string;
  quantity: number;
  price: number;
  discount_percentage: number;
  name: string;
  group_type: string | null;
  is_recurring: boolean;
  allow_multiple: boolean;
  custom_title?: string;
  is_custom?: boolean;
  custom_description?: string;
}

export interface Offer {
  id: string;
  title?: string;
  description?: string;
  organization_id?: string;
  status: string;
  total_amount: number;
  currency: string;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;
  contact_id?: string;
  global_discount_percentage?: number;
  discount_reason?: string | null;
  is_accepted?: boolean;
  services?: Service[];
}

export interface OfferService {
  id?: string;
  offer_id: string;
  service_id?: string;
  quantity: number;
  price: number;
  discount_percentage?: number;
  custom_title?: string;
  is_custom?: boolean;
  custom_description?: string;
}

export interface OfferFormData {
  services: Service[];
  valid_until?: string;
  global_discount_percentage?: number;
}
