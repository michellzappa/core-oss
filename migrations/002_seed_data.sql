-- Seed Data for Core OSS CRM
-- Run this after 001_initial_schema.sql

-- Default corporate entity
insert into corporate_entities (name, legal_name, city, country, is_default) values
  ('My Company', 'My Company LLC', 'San Francisco', 'US', true);

-- Default payment terms
insert into settings_payment_terms (title, description, is_active, is_default) values
  ('Net 30', 'Payment is due within 30 days of invoice date.', true, true),
  ('Net 15', 'Payment is due within 15 days of invoice date.', true, false),
  ('Due on Receipt', 'Payment is due immediately upon receipt of invoice.', true, false);

-- Default delivery conditions
insert into settings_delivery_conditions (title, description, is_active, is_default) values
  ('Remote', 'All deliverables will be provided digitally via agreed-upon channels.', true, true),
  ('On-Site', 'Deliverables include on-site presence as specified in the scope.', true, false);

-- Sample services
insert into services (name, summary, description, price, is_recurring, group_type, is_public, is_default) values
  ('Consulting', 'Strategic consulting session', 'One-on-one strategic consulting session to discuss your business needs and identify opportunities for growth.', 2500, false, 'Base', true, true),
  ('Workshop', 'Half-day workshop', 'Interactive half-day workshop tailored to your team, covering key topics and generating actionable outcomes.', 5000, false, 'Base', true, false),
  ('Research', 'Custom research report', 'In-depth research and analysis report on a specific topic relevant to your industry or domain.', 7500, false, 'Research', true, false),
  ('Retainer', 'Monthly advisory retainer', 'Ongoing monthly advisory engagement with regular check-ins and priority access to expertise.', 3000, true, 'License', true, false);
