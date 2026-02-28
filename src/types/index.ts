export interface CorporateEntity {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  legal_name: string | null;
  address: string | null;
  postcode: string | null;
  city: string | null;
  country: string | null;
  vat_id: string | null;
  tax_id: string | null;
  logo_url: string | null;
  is_default: boolean;
}
