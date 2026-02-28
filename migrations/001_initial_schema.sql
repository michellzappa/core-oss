-- Core OSS CRM Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  legal_name text,
  address text,
  postcode text,
  city text,
  country text,
  vat_id text,
  tax_id text,
  website text,
  industry text,
  size text,
  founded text,
  hq_location text,
  company_type text,
  linkedin_url text,
  logo_image_url text,
  profile_image_url text,
  is_agency boolean default false not null
);

-- Contacts
create table if not exists contacts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  email text,
  organization_id uuid references organizations(id) on delete set null,
  linkedin_url text,
  company_role text,
  headline text,
  location text,
  country text,
  corporate_email text,
  profile_image_url text
);

-- Projects
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  title text not null,
  description text,
  url text,
  organization_id uuid references organizations(id) on delete set null,
  start_date date,
  end_date date,
  status text default 'Active' not null check (status in ('Active', 'Paused', 'Archived'))
);

-- Services (catalog)
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  name text not null,
  summary text not null default '',
  description text not null default '',
  price numeric not null default 0,
  is_recurring boolean default false not null,
  recurring_interval text,
  url text,
  icon text,
  group_type text default 'Optional' check (group_type in ('Base', 'Research', 'Optional', 'License')),
  category text,
  is_public boolean default false not null,
  allow_multiple boolean default false not null,
  is_default boolean default false not null
);

-- Corporate Entities (your invoicing entities)
create table if not exists corporate_entities (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  legal_name text,
  address text,
  postcode text,
  city text,
  country text,
  vat_id text,
  tax_id text,
  logo_url text,
  is_default boolean default false not null
);

-- Settings: Payment Terms
create table if not exists settings_payment_terms (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  title text not null,
  description text not null default '',
  is_active boolean default true not null,
  is_default boolean default false not null
);

-- Settings: Delivery Conditions
create table if not exists settings_delivery_conditions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  title text not null,
  description text not null default '',
  is_active boolean default true not null,
  is_default boolean default false not null
);

-- Settings: Offer Links (preset resource links)
create table if not exists settings_offer_links (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  title text not null,
  url text not null,
  icon text,
  is_active boolean default true not null,
  is_default boolean default false not null
);

-- Offers
create table if not exists offers (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  title text,
  organization_id uuid references organizations(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  corporate_entity_id uuid references corporate_entities(id) on delete set null,
  valid_until date,
  status text default 'draft' not null check (status in ('draft', 'sent')),
  is_accepted boolean default false not null,
  total_amount numeric default 0 not null,
  currency text default 'EUR' not null,
  global_discount_percentage numeric default 0 not null,
  discount_reason text,
  tax_percentage numeric default 0,
  tax_reason text,
  comments text,
  payment_term_id uuid references settings_payment_terms(id) on delete set null,
  delivery_condition_id uuid references settings_delivery_conditions(id) on delete set null,
  payment_terms_text text,
  delivery_conditions_text text,
  is_self_submitted boolean default false not null,
  accepted_at timestamptz,
  accepted_by_name text,
  accepted_by_email text,
  accepted_ip text,
  accepted_user_agent text,
  accepted_metadata jsonb,
  discount_type text default 'per_service',
  agreement_date date,
  agreement_start_date date,
  agreement_end_date date,
  agreement_notice_email text,
  agreement_include_annex boolean default true,
  agreement_terms_override text,
  billing_contact_email text,
  billing_po_number text,
  billing_vat_id text,
  service_inputs jsonb
);

-- Offer Access Logs (analytics)
create table if not exists offer_access_logs (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  offer_id uuid references offers(id) on delete cascade not null,
  accessed_email text,
  accessed_at timestamptz default now(),
  ip_address text,
  user_agent text
);

-- Offer Services (line items)
create table if not exists offer_services (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  offer_id uuid references offers(id) on delete cascade not null,
  service_id uuid references services(id) on delete set null,
  quantity integer default 1 not null,
  price numeric default 0 not null,
  discount_percentage numeric default 0 not null,
  custom_title text,
  is_custom boolean default false not null,
  custom_description text
);

-- Offer Selected Links (junction table)
create table if not exists offer_selected_links (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  offer_id uuid references offers(id) on delete cascade not null,
  link_id uuid references settings_offer_links(id) on delete cascade not null,
  is_enabled boolean default true not null
);

-- Indexes
create index if not exists idx_contacts_organization_id on contacts(organization_id);
create index if not exists idx_contacts_email on contacts(email);
create index if not exists idx_projects_organization_id on projects(organization_id);
create index if not exists idx_projects_status on projects(status);
create index if not exists idx_offers_organization_id on offers(organization_id);
create index if not exists idx_offers_status on offers(status);
create index if not exists idx_offers_created_at on offers(created_at);
create index if not exists idx_offer_services_offer_id on offer_services(offer_id);
create index if not exists idx_offer_services_service_id on offer_services(service_id);
create index if not exists idx_offer_selected_links_offer_id on offer_selected_links(offer_id);
create index if not exists idx_offer_access_logs_offer_id on offer_access_logs(offer_id);

-- RLS: Enable on all tables, allow full CRUD for authenticated users
alter table organizations enable row level security;
alter table contacts enable row level security;
alter table projects enable row level security;
alter table services enable row level security;
alter table corporate_entities enable row level security;
alter table settings_payment_terms enable row level security;
alter table settings_delivery_conditions enable row level security;
alter table settings_offer_links enable row level security;
alter table offers enable row level security;
alter table offer_services enable row level security;
alter table offer_selected_links enable row level security;

-- Policies: authenticated users get full access
create policy "Authenticated users can do anything" on organizations for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on contacts for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on projects for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on services for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on corporate_entities for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on settings_payment_terms for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on settings_delivery_conditions for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on settings_offer_links for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on offers for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on offer_services for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything" on offer_selected_links for all using (auth.role() = 'authenticated');

-- Public read access for offers (for public offer view page)
create policy "Public can read offers" on offers for select using (true);
create policy "Public can read offer_services" on offer_services for select using (true);
create policy "Public can read offer_selected_links" on offer_selected_links for select using (true);
create policy "Public can read services" on services for select using (true);
create policy "Public can read corporate_entities" on corporate_entities for select using (true);
create policy "Public can read organizations" on organizations for select using (true);
create policy "Public can read settings_payment_terms" on settings_payment_terms for select using (true);
create policy "Public can read settings_delivery_conditions" on settings_delivery_conditions for select using (true);
create policy "Public can read settings_offer_links" on settings_offer_links for select using (true);

-- Updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_updated_at before update on organizations for each row execute function update_updated_at_column();
create trigger set_updated_at before update on contacts for each row execute function update_updated_at_column();
create trigger set_updated_at before update on projects for each row execute function update_updated_at_column();
create trigger set_updated_at before update on corporate_entities for each row execute function update_updated_at_column();
create trigger set_updated_at before update on settings_payment_terms for each row execute function update_updated_at_column();
create trigger set_updated_at before update on settings_delivery_conditions for each row execute function update_updated_at_column();
create trigger set_updated_at before update on settings_offer_links for each row execute function update_updated_at_column();
create trigger set_updated_at before update on offers for each row execute function update_updated_at_column();
