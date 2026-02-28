export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          legal_name: string | null
          address: string | null
          postcode: string | null
          city: string | null
          country: string | null
          vat_id: string | null
          tax_id: string | null
          website: string | null
          industry: string | null
          size: string | null
          founded: string | null
          hq_location: string | null
          company_type: string | null
          linkedin_url: string | null
          logo_image_url: string | null
          profile_image_url: string | null
          is_agency: boolean
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      contacts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string | null
          organization_id: string | null
          linkedin_url: string | null
          company_role: string | null
          headline: string | null
          location: string | null
          country: string | null
          corporate_email: string | null
          profile_image_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          url: string | null
          organization_id: string | null
          start_date: string | null
          end_date: string | null
          status: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      services: {
        Row: {
          id: string
          created_at: string
          name: string
          summary: string
          description: string
          price: number
          is_recurring: boolean
          recurring_interval: string | null
          url: string | null
          icon: string | null
          group_type: string | null
          category: string | null
          is_public: boolean
          allow_multiple: boolean
          is_default: boolean
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      corporate_entities: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          legal_name: string | null
          address: string | null
          postcode: string | null
          city: string | null
          country: string | null
          vat_id: string | null
          tax_id: string | null
          logo_url: string | null
          is_default: boolean
        }
        Insert: Omit<Database['public']['Tables']['corporate_entities']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['corporate_entities']['Insert']>
      }
      settings_payment_terms: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          is_active: boolean
          is_default: boolean
        }
        Insert: Omit<Database['public']['Tables']['settings_payment_terms']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['settings_payment_terms']['Insert']>
      }
      settings_delivery_conditions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          is_active: boolean
          is_default: boolean
        }
        Insert: Omit<Database['public']['Tables']['settings_delivery_conditions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['settings_delivery_conditions']['Insert']>
      }
      settings_offer_links: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          url: string
          icon: string | null
          is_active: boolean
          is_default: boolean
        }
        Insert: Omit<Database['public']['Tables']['settings_offer_links']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['settings_offer_links']['Insert']>
      }
      offers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string | null
          organization_id: string | null
          contact_id: string | null
          corporate_entity_id: string | null
          valid_until: string | null
          status: string
          is_accepted: boolean
          total_amount: number
          currency: string
          global_discount_percentage: number
          discount_reason: string | null
          tax_percentage: number | null
          tax_reason: string | null
          comments: string | null
          payment_term_id: string | null
          delivery_condition_id: string | null
          payment_terms_text: string | null
          delivery_conditions_text: string | null
          is_self_submitted: boolean
          accepted_at: string | null
          accepted_by_name: string | null
          accepted_by_email: string | null
          accepted_ip: string | null
          accepted_user_agent: string | null
          accepted_metadata: Json | null
          discount_type: string | null
          agreement_date: string | null
          agreement_start_date: string | null
          agreement_end_date: string | null
          agreement_notice_email: string | null
          agreement_include_annex: boolean
          agreement_terms_override: string | null
          billing_contact_email: string | null
          billing_po_number: string | null
          billing_vat_id: string | null
          service_inputs: Json | null
        }
        Insert: Omit<Database['public']['Tables']['offers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['offers']['Insert']>
      }
      offer_services: {
        Row: {
          id: string
          created_at: string
          offer_id: string
          service_id: string | null
          quantity: number
          price: number
          discount_percentage: number
          custom_title: string | null
          is_custom: boolean
          custom_description: string | null
        }
        Insert: Omit<Database['public']['Tables']['offer_services']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['offer_services']['Insert']>
      }
      offer_selected_links: {
        Row: {
          id: string
          created_at: string
          offer_id: string
          link_id: string
          is_enabled: boolean
        }
        Insert: Omit<Database['public']['Tables']['offer_selected_links']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['offer_selected_links']['Insert']>
      }
      offer_access_logs: {
        Row: {
          id: string
          created_at: string
          offer_id: string
          accessed_email: string | null
          accessed_at: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: Omit<Database['public']['Tables']['offer_access_logs']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['offer_access_logs']['Insert']>
      }
      idempotency_keys: {
        Row: {
          id: string
          key_hash: string
          response_data: Json | null
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['idempotency_keys']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['idempotency_keys']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
