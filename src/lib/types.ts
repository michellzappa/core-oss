export interface CorporateEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  legal_name?: string;
  address?: string;
  postcode?: string;
  city?: string;
  country?: string;
  vat_id?: string;
  tax_id?: string;
  logo_url?: string;
  is_default?: boolean;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  default_currency: boolean;
  is_enabled: boolean;
  surcharge_percentage: number;
  created_at: string;
  updated_at: string;
}
