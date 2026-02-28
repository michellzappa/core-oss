-- Sample Data for Core OSS CRM
-- Run this after 001 and 002 to populate with demo data

-- Organizations
insert into organizations (id, name, legal_name, city, country, website, industry, size, linkedin_url) values
  ('a0000000-0000-0000-0000-000000000001', 'Acme Corp', 'Acme Corporation Inc.', 'New York', 'US', 'https://acme.example.com', 'Technology', '51-200', 'https://linkedin.com/company/acme'),
  ('a0000000-0000-0000-0000-000000000002', 'Globex Industries', 'Globex Industries GmbH', 'Berlin', 'DE', 'https://globex.example.com', 'Manufacturing', '201-500', 'https://linkedin.com/company/globex'),
  ('a0000000-0000-0000-0000-000000000003', 'Initech', 'Initech Ltd.', 'London', 'GB', 'https://initech.example.com', 'Financial Services', '11-50', null),
  ('a0000000-0000-0000-0000-000000000004', 'Umbrella Labs', 'Umbrella Laboratories S.A.', 'Zurich', 'CH', 'https://umbrella.example.com', 'Healthcare', '501-1000', 'https://linkedin.com/company/umbrella'),
  ('a0000000-0000-0000-0000-000000000005', 'Stark Solutions', 'Stark Solutions B.V.', 'Amsterdam', 'NL', 'https://stark.example.com', 'Consulting', '1-10', null);

-- Contacts (linked to organizations)
insert into contacts (id, name, email, organization_id, company_role, location, country, linkedin_url) values
  ('b0000000-0000-0000-0000-000000000001', 'Alice Johnson', 'alice@acme.example.com', 'a0000000-0000-0000-0000-000000000001', 'CTO', 'New York', 'US', 'https://linkedin.com/in/alicejohnson'),
  ('b0000000-0000-0000-0000-000000000002', 'Bob Mueller', 'bob@globex.example.com', 'a0000000-0000-0000-0000-000000000002', 'Head of Innovation', 'Berlin', 'DE', 'https://linkedin.com/in/bobmueller'),
  ('b0000000-0000-0000-0000-000000000003', 'Carol Smith', 'carol@initech.example.com', 'a0000000-0000-0000-0000-000000000003', 'VP of Strategy', 'London', 'GB', null),
  ('b0000000-0000-0000-0000-000000000004', 'David Chen', 'david@umbrella.example.com', 'a0000000-0000-0000-0000-000000000004', 'Director of R&D', 'Zurich', 'CH', 'https://linkedin.com/in/davidchen'),
  ('b0000000-0000-0000-0000-000000000005', 'Eva de Vries', 'eva@stark.example.com', 'a0000000-0000-0000-0000-000000000005', 'Founder & CEO', 'Amsterdam', 'NL', null),
  ('b0000000-0000-0000-0000-000000000006', 'Frank Wilson', 'frank@acme.example.com', 'a0000000-0000-0000-0000-000000000001', 'Product Manager', 'San Francisco', 'US', null),
  ('b0000000-0000-0000-0000-000000000007', 'Grace Kim', 'grace@globex.example.com', 'a0000000-0000-0000-0000-000000000002', 'CFO', 'Munich', 'DE', 'https://linkedin.com/in/gracekim');

-- Projects (linked to organizations)
insert into projects (id, title, description, organization_id, start_date, end_date, status) values
  ('c0000000-0000-0000-0000-000000000001', 'Digital Transformation Roadmap', 'Strategic assessment and phased roadmap for digital transformation across all business units.', 'a0000000-0000-0000-0000-000000000001', '2026-01-15', '2026-06-30', 'Active'),
  ('c0000000-0000-0000-0000-000000000002', 'Innovation Lab Setup', 'Design and launch of an internal innovation lab for rapid prototyping and experimentation.', 'a0000000-0000-0000-0000-000000000002', '2026-02-01', '2026-08-31', 'Active'),
  ('c0000000-0000-0000-0000-000000000003', 'Market Entry Analysis', 'Comprehensive market analysis for expansion into the APAC region.', 'a0000000-0000-0000-0000-000000000003', '2025-09-01', '2025-12-15', 'Archived'),
  ('c0000000-0000-0000-0000-000000000004', 'R&D Strategy Review', 'Annual review of R&D portfolio and strategic recommendations for next fiscal year.', 'a0000000-0000-0000-0000-000000000004', '2026-03-01', null, 'Active'),
  ('c0000000-0000-0000-0000-000000000005', 'Brand Refresh', 'Complete brand identity refresh including visual language, tone of voice, and digital presence.', 'a0000000-0000-0000-0000-000000000005', '2026-01-01', '2026-04-30', 'Paused');

-- Get the default corporate entity and payment term IDs for offers
-- (We use subqueries since the seed data IDs are auto-generated)

-- Offers (linked to organizations, contacts, and settings)
insert into offers (id, title, organization_id, contact_id, corporate_entity_id, status, is_accepted, currency, total_amount, valid_until, payment_term_id, delivery_condition_id, created_at) values
  ('d0000000-0000-0000-0000-000000000001', 'Digital Transformation - Phase 1', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
    (select id from corporate_entities where is_default = true limit 1),
    'sent', true, 'EUR', 15000, '2026-03-31',
    (select id from settings_payment_terms where is_default = true limit 1),
    (select id from settings_delivery_conditions where is_default = true limit 1),
    '2026-01-10'),
  ('d0000000-0000-0000-0000-000000000002', 'Innovation Lab - Discovery Workshop', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
    (select id from corporate_entities where is_default = true limit 1),
    'sent', false, 'EUR', 5000, '2026-04-15',
    (select id from settings_payment_terms where is_default = true limit 1),
    (select id from settings_delivery_conditions where is_default = true limit 1),
    '2026-02-01'),
  ('d0000000-0000-0000-0000-000000000003', 'APAC Market Research Report', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
    (select id from corporate_entities where is_default = true limit 1),
    'sent', true, 'EUR', 7500, '2025-10-30',
    (select id from settings_payment_terms where is_default = true limit 1),
    (select id from settings_delivery_conditions where is_default = true limit 1),
    '2025-09-15'),
  ('d0000000-0000-0000-0000-000000000004', 'R&D Advisory Retainer 2026', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004',
    (select id from corporate_entities where is_default = true limit 1),
    'draft', false, 'EUR', 36000, '2026-04-30',
    (select id from settings_payment_terms where is_default = true limit 1),
    (select id from settings_delivery_conditions where is_default = true limit 1),
    '2026-02-20'),
  ('d0000000-0000-0000-0000-000000000005', 'Brand Strategy & Identity', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005',
    (select id from corporate_entities where is_default = true limit 1),
    'sent', false, 'EUR', 12500, '2026-02-28',
    (select id from settings_payment_terms where is_default = true limit 1),
    (select id from settings_delivery_conditions where is_default = true limit 1),
    '2026-01-05');

-- Offer Services (line items linking offers to services from the catalog)
-- Use the seed services by name
insert into offer_services (offer_id, service_id, quantity, price, discount_percentage) values
  -- Offer 1: Consulting + Workshop
  ('d0000000-0000-0000-0000-000000000001', (select id from services where name = 'Consulting' limit 1), 2, 2500, 0),
  ('d0000000-0000-0000-0000-000000000001', (select id from services where name = 'Workshop' limit 1), 1, 5000, 0),
  ('d0000000-0000-0000-0000-000000000001', (select id from services where name = 'Research' limit 1), 1, 5000, 0),
  -- Offer 2: Workshop
  ('d0000000-0000-0000-0000-000000000002', (select id from services where name = 'Workshop' limit 1), 1, 5000, 0),
  -- Offer 3: Research
  ('d0000000-0000-0000-0000-000000000003', (select id from services where name = 'Research' limit 1), 1, 7500, 0),
  -- Offer 4: Retainer (12 months)
  ('d0000000-0000-0000-0000-000000000004', (select id from services where name = 'Retainer' limit 1), 12, 3000, 0),
  -- Offer 5: Consulting + Workshop + Research
  ('d0000000-0000-0000-0000-000000000005', (select id from services where name = 'Consulting' limit 1), 1, 2500, 0),
  ('d0000000-0000-0000-0000-000000000005', (select id from services where name = 'Workshop' limit 1), 1, 5000, 0),
  ('d0000000-0000-0000-0000-000000000005', (select id from services where name = 'Research' limit 1), 1, 5000, 0);
