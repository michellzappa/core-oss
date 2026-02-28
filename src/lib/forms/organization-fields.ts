import React from "react";
import { UnifiedFormField } from "@/components/forms/unified/unified-form";
import { industries } from "@/lib/industries";
import { countries } from "@/lib/countries";

const LazySearchAwareNameField = React.lazy(
	() => import("@/components/forms/unified/search-aware-name-field"),
);
const LazyCountryField = React.lazy(
	() => import("@/components/forms/unified/country-field"),
);
const LazyIndustryField = React.lazy(
	() => import("@/components/forms/unified/industry-field"),
);

export const organizationFormFields: UnifiedFormField[] = [
	// Basic Information Section
	{
		name: "basic_info",
		label: "Basic Information",
		type: "section",
	},
	{
		name: "name",
		label: "Organization Name",
		type: "custom",
		required: true,
		placeholder: "Enter organization name",
		section: "basic_info",
		customRenderer: ({ form, isLocked, mode }) => {
			return React.createElement(
				React.Suspense,
				{ fallback: null },
				React.createElement(LazySearchAwareNameField, {
					form,
					fieldName: "name",
					placeholder: "Enter organization name",
					entityType: "organization",
					disabled: isLocked,
					mode,
				}),
			);
		},
	},
	{
		name: "legal_name",
		label: "Legal Name",
		type: "text",
		placeholder: "Legal business name (if different)",
		section: "basic_info",
	},
	{
		name: "entity",
		label: "Entity",
		type: "text",
		placeholder: "Entity (freeform, e.g. division or subsidiary)",
		section: "basic_info",
	},
	{
		name: "country",
		label: "Country",
		type: "custom",
		placeholder: "Select country",
		section: "basic_info",
		customRenderer: ({ form, isLocked }) => {
			return React.createElement(
				React.Suspense,
				{ fallback: null },
				React.createElement(LazyCountryField, { form, disabled: isLocked }),
			);
		},
	},
	{
		name: "industry",
		label: "Industry",
		type: "custom",
		placeholder: "Select industry",
		section: "basic_info",
		customRenderer: ({ form, isLocked }) => {
			return React.createElement(
				React.Suspense,
				{ fallback: null },
				React.createElement(LazyIndustryField, { form, disabled: isLocked }),
			);
		},
	},
	{
		name: "is_agency",
		label: "Is Agency",
		type: "toggle",
		section: "basic_info",
	},

	// Online Presence Section
	{
		name: "online_presence",
		label: "Online Presence",
		type: "section",
	},
	{
		name: "website",
		label: "Website",
		type: "text",
		placeholder: "https://example.com",
		section: "online_presence",
	},
	{
		name: "linkedin_url",
		label: "LinkedIn URL",
		type: "text",
		placeholder: "https://linkedin.com/company/...",
		section: "online_presence",
	},
	{
		name: "profile_image_url",
		label: "Profile Image URL",
		type: "text",
		placeholder: "Enter image URL (e.g., company logo)",
		section: "online_presence",
	},
];
