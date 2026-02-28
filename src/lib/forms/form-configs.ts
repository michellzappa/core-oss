import React from "react";
import type { UnifiedFormField } from "@/components/forms/unified/unified-form";
import {
  contactCreateSchema,
  organizationCreateSchema,
  serviceCreateSchema,
  projectCreateSchema,
  offerCreateSchema,
} from '@/lib/validation/schemas';
import { organizationFormFields } from './organization-fields';

import {
  createService,
  updateService,
  deleteService,
} from '@/lib/actions/services';
import {
  createOffer,
  updateOffer,
  deleteOffer,
} from '@/lib/actions/offers';
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/lib/actions/organizations';
import {
  createContact,
  updateContact,
  deleteContact,
} from '@/lib/actions/contacts';
import {
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/actions/projects';
import type { ActionResponse } from '@/lib/actions/utils';
import type { z } from 'zod';

// Type definition for form configuration entries
export interface FormConfigEntry {
  schema: z.ZodSchema<Record<string, unknown>>;
  fields: UnifiedFormField[];
  entityName: string;
  apiEndpoint: string;
  backLink: string;
  createAction: (
    prevState: ActionResponse<unknown> | null,
    formData: FormData
  ) => Promise<ActionResponse<unknown>>;
  updateAction: (
    prevState: ActionResponse<unknown> | null,
    formData: FormData
  ) => Promise<ActionResponse<unknown>>;
  deleteAction: (
    prevState: ActionResponse<unknown> | null,
    formData: FormData
  ) => Promise<ActionResponse<unknown>>;
}

// Hoisted lazy components to ensure stable identities
const LazyOrganizationField = React.lazy(
  () => import('@/components/forms/unified/organization-field')
);
const LazyCurrencyField = React.lazy(
  () => import('@/components/forms/unified/currency-field')
);
const LazyCorporateEntityField = React.lazy(
  () => import('@/components/forms/unified/corporate-entity-field')
);
const LazyPaymentTermsField = React.lazy(
  () => import('@/components/forms/unified/payment-terms-field')
);
const LazyDeliveryConditionsField = React.lazy(
  () => import('@/components/forms/unified/delivery-conditions-field')
);
const LazyOfferLinksField = React.lazy(
  () => import('@/components/forms/unified/offer-links-field')
);
const LazyCountryField = React.lazy(
  () => import('@/components/forms/unified/country-field')
);

// Contact form configuration
export const contactFormFields: UnifiedFormField[] = [
  {
    name: 'basic_info',
    label: 'Basic Information',
    type: 'section',
  },
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'Enter contact name',
    section: 'basic_info',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email address',
    section: 'basic_info',
  },
  {
    name: 'organization_id',
    label: 'Organization',
    type: 'custom',
    placeholder: 'Select organization',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyOrganizationField, { form, disabled: isLocked })
      );
    },
    section: 'basic_info',
  },
  {
    name: 'country',
    label: 'Country',
    type: 'custom',
    placeholder: 'Select country',
    section: 'basic_info',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyCountryField, { form, disabled: isLocked })
      );
    },
  },

  // Professional Information Section
  {
    name: 'professional_info',
    label: 'Professional Information',
    type: 'section',
  },
  {
    name: 'corporate_email',
    label: 'Work Email',
    type: 'email',
    placeholder: 'Work email address',
    section: 'professional_info',
  },
  {
    name: 'company_role',
    label: 'Role at Company',
    type: 'text',
    placeholder: 'Enter job title or role',
    section: 'professional_info',
  },
  {
    name: 'headline',
    label: 'Headline',
    type: 'text',
    placeholder: 'Professional headline',
    section: 'professional_info',
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'City, Country',
    section: 'professional_info',
  },

  // Online Presence Section
  {
    name: 'online_presence',
    label: 'Online Presence',
    type: 'section',
  },
  {
    name: 'linkedin_url',
    label: 'LinkedIn URL',
    type: 'text',
    placeholder: 'https://linkedin.com/in/...',
    section: 'online_presence',
  },
  {
    name: 'profile_image_url',
    label: 'Profile Image URL',
    type: 'text',
    placeholder: 'Enter image URL',
    section: 'online_presence',
  },
];

// Service form configuration
export const serviceFormFields: UnifiedFormField[] = [
  {
    name: 'basic_info',
    label: 'Basic Information',
    type: 'section',
  },
  {
    name: 'name',
    label: 'Service Name',
    type: 'text',
    required: true,
    placeholder: 'Enter service name',
    section: 'basic_info',
  },
  {
    name: 'summary',
    label: 'Summary',
    type: 'text',
    required: true,
    placeholder: 'Brief summary of the service',
    section: 'basic_info',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 10,
    placeholder: 'Detailed description of the service',
    section: 'basic_info',
  },
  {
    name: 'group_type',
    label: 'Service Group',
    type: 'select',
    options: [
      { value: 'Base', label: 'Base' },
      { value: 'Research', label: 'Research' },
      { value: 'Optional', label: 'Optional' },
      { value: 'License', label: 'License' },
    ],
    section: 'basic_info',
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    placeholder: 'Select category',
    options: [
      { value: 'none', label: 'No category' },
      { value: 'visualization', label: 'Visualization' },
      { value: 'architecture', label: 'Architecture' },
      { value: 'signals', label: 'Signals' },
    ],
    hidden: true,
    section: 'basic_info',
  },
  {
    name: 'icon',
    label: 'Icon',
    type: 'text',
    placeholder: 'e.g. Package, Briefcase',
    section: 'basic_info',
  },

  // Service Details Section
  {
    name: 'service_details',
    label: 'Service Details',
    type: 'section',
  },
  {
    name: 'price',
    label: 'Price',
    type: 'number',
    required: true,
    placeholder: '0',
    section: 'service_details',
  },
  {
    name: 'is_recurring',
    label: 'Billing Type',
    type: 'select',
    required: true,
    options: [
      { value: 'false', label: 'One-time' },
      { value: 'true', label: 'Recurring (Yearly)' },
    ],
    section: 'service_details',
  },
  {
    name: 'allow_multiple',
    label: 'Multiple Selection',
    type: 'select',
    required: true,
    options: [
      { value: 'false', label: 'Single selection only' },
      { value: 'true', label: 'Allow multiple selections' },
    ],
    section: 'service_details',
  },

  // Additional Information Section
  {
    name: 'additional_info',
    label: 'Additional Information',
    type: 'section',
  },
  {
    name: 'url',
    label: 'Service URL',
    type: 'text',
    placeholder: 'https://example.com/service',
    section: 'additional_info',
  },
];

// Project form configuration
export const projectFormFields: UnifiedFormField[] = [
  {
    name: 'basic_info',
    label: 'Basic Information',
    type: 'section',
  },
  {
    name: 'title',
    label: 'Project Title',
    type: 'text',
    required: true,
    placeholder: 'Enter project title',
    section: 'basic_info',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 4,
    placeholder: 'Project description',
    section: 'basic_info',
  },
  {
    name: 'url',
    label: 'Project URL',
    type: 'text',
    placeholder: 'https://example.com/project',
    section: 'basic_info',
  },

  // Project Details Section
  {
    name: 'project_details',
    label: 'Project Details',
    type: 'section',
  },
  {
    name: 'organization_id',
    label: 'Organization',
    type: 'custom',
    required: false,
    placeholder: 'Select organization',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyOrganizationField, { form, disabled: isLocked })
      );
    },
    section: 'project_details',
  },

  // Timeline Section
  {
    name: 'timeline',
    label: 'Timeline',
    type: 'section',
  },
  {
    name: 'start_date',
    label: 'Start Date',
    type: 'date',
    placeholder: 'Select start date',
    section: 'timeline',
  },
  {
    name: 'end_date',
    label: 'End Date',
    type: 'date',
    placeholder: 'Select end date',
    section: 'timeline',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'Paused', label: 'Paused' },
      { value: 'Archived', label: 'Archived' },
    ],
    section: 'timeline',
  },
];

// Offer form configuration
export const offerFormFields: UnifiedFormField[] = [
  {
    name: 'basic_info',
    label: 'Basic Information',
    type: 'section',
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'Offer title (e.g. project or deal name)',
    hidden: true,
    section: 'basic_info',
    required: false,
  },
  {
    name: 'corporate_entity_id',
    label: 'Corporate Entity',
    type: 'custom',
    placeholder: 'Select corporate entity',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyCorporateEntityField, { form, disabled: isLocked })
      );
    },
    colSpan: 1,
    section: 'basic_info',
  },
  {
    name: 'organization_id',
    label: 'Organization',
    type: 'custom',
    placeholder: 'Select organization',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyOrganizationField, { form, disabled: isLocked })
      );
    },
    colSpan: 1,
    section: 'basic_info',
  },
  { name: 'pricing', label: 'Pricing', type: 'section' },
  {
    name: 'currency',
    label: 'Currency',
    type: 'custom',
    colSpan: 1,
    section: 'pricing',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyCurrencyField, { form, disabled: isLocked })
      );
    },
  },
  {
    name: 'global_discount_percentage',
    label: 'Global Discount %',
    type: 'number',
    placeholder: 'Enter discount percentage',
    colSpan: 1,
    section: 'pricing',
  },
  {
    name: 'discount_reason',
    label: 'Discount Reason',
    type: 'text',
    placeholder: 'Enter reason for discount (optional)',
    colSpan: 1,
    section: 'pricing',
    required: false,
  },
  { name: 'pricing_tax', label: 'Tax', type: 'section' },
  {
    name: 'tax_percentage',
    label: 'Tax %',
    type: 'number',
    placeholder: '0',
    section: 'pricing_tax',
    required: false,
  },
  {
    name: 'tax_reason',
    label: 'Tax explanation (optional)',
    type: 'text',
    placeholder: 'e.g., VAT, local tax, etc.',
    section: 'pricing_tax',
    required: false,
  },
  { name: 'offer_status', label: 'Offer Status', type: 'section' },
  {
    name: 'created_at',
    label: 'Created On',
    type: 'date',
    placeholder: 'Select created date',
    section: 'offer_status',
  },
  {
    name: 'valid_until',
    label: 'Valid Until',
    type: 'date',
    required: true,
    placeholder: 'Select validity date',
    section: 'offer_status',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
    ],
    hidden: true,
    section: 'offer_status',
  },
  {
    name: 'is_accepted',
    label: 'Offer Accepted',
    type: 'toggle',
    section: 'offer_status',
  },
  { name: 'terms', label: 'Terms', type: 'section' },
  {
    name: 'payment_term_id',
    label: 'Payment Terms',
    type: 'custom',
    section: 'terms',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyPaymentTermsField, { form, disabled: isLocked })
      );
    },
  },
  {
    name: 'delivery_condition_id',
    label: 'Delivery Conditions',
    type: 'custom',
    section: 'terms',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyDeliveryConditionsField, { form, disabled: isLocked })
      );
    },
  },
  {
    name: 'offer_links_section',
    label: 'Offer Links',
    type: 'section',
    hidden: true,
  },
  {
    name: 'offer_selected_link_ids',
    label: 'Links',
    type: 'custom',
    colSpan: 2,
    hidden: true,
    section: 'offer_links_section',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyOfferLinksField, { form, disabled: isLocked })
      );
    },
  },
];

// Form configurations for easy use
export const formConfigs = {
  organization: {
    schema: organizationCreateSchema,
    fields: organizationFormFields,
    entityName: 'Organization',
    apiEndpoint: '/api/organizations',
    backLink: '/dashboard/organizations',
    createAction: createOrganization,
    updateAction: updateOrganization,
    deleteAction: deleteOrganization,
  },
  service: {
    schema: serviceCreateSchema,
    fields: serviceFormFields,
    entityName: 'Service',
    apiEndpoint: '/api/services',
    backLink: '/dashboard/services',
    createAction: createService,
    updateAction: updateService,
    deleteAction: deleteService,
  },
  project: {
    schema: projectCreateSchema,
    fields: projectFormFields,
    entityName: 'Project',
    apiEndpoint: '/api/projects',
    backLink: '/dashboard/projects',
    createAction: createProject,
    updateAction: updateProject,
    deleteAction: deleteProject,
  },
  offer: {
    schema: offerCreateSchema,
    fields: offerFormFields,
    entityName: 'Offer',
    apiEndpoint: '/api/offers',
    backLink: '/dashboard/offers',
    createAction: createOffer,
    updateAction: updateOffer,
    deleteAction: deleteOffer,
  },
  contact: {
    schema: contactCreateSchema,
    fields: contactFormFields,
    entityName: 'Contact',
    apiEndpoint: '/api/contacts',
    backLink: '/dashboard/contacts',
    createAction: createContact,
    updateAction: updateContact,
    deleteAction: deleteContact,
  },
};
