export interface Industry {
  id: string;
  name: string;
  category: string;
}

export const industries: Industry[] = [
  // Enterprise
  { id: "ent_manufacturing", name: "Manufacturing", category: "enterprise" },
  { id: "ent_technology", name: "Technology", category: "enterprise" },
  { id: "ent_finance", name: "Finance", category: "enterprise" },
  { id: "ent_healthcare", name: "Healthcare", category: "enterprise" },
  { id: "ent_retail", name: "Retail", category: "enterprise" },
  { id: "ent_energy", name: "Energy", category: "enterprise" },
  { id: "ent_telecom", name: "Telecommunications", category: "enterprise" },

  // Education
  { id: "edu_university", name: "University", category: "education" },
  { id: "edu_research", name: "Research Institution", category: "education" },
  { id: "edu_school", name: "School", category: "education" },
  { id: "edu_training", name: "Training Center", category: "education" },

  // Government
  { id: "gov_agency", name: "Government Agency", category: "government" },
  { id: "gov_ministry", name: "Ministry", category: "government" },
  { id: "gov_local", name: "Local Government", category: "government" },

  // Research & Innovation
  { id: "res_innovation", name: "Innovation Center", category: "research" },
  { id: "res_lab", name: "Research Lab", category: "research" },
  { id: "res_incubator", name: "Incubator/Accelerator", category: "research" },

  // Other
  { id: "other_association", name: "Association", category: "other" },
  { id: "other_ngo", name: "NGO", category: "other" },
  { id: "other_foundation", name: "Foundation", category: "other" },

  // Technology
  { id: "software", name: "Software Development", category: "technology" },
  { id: "hardware", name: "Hardware Manufacturing", category: "technology" },
  { id: "it_services", name: "IT Services", category: "technology" },
  { id: "telecom", name: "Telecommunications", category: "technology" },
  { id: "cybersecurity", name: "Cybersecurity", category: "technology" },
  { id: "cloud", name: "Cloud Computing", category: "technology" },
  { id: "ai_ml", name: "AI & Machine Learning", category: "technology" },

  // Finance
  { id: "banking", name: "Banking", category: "finance" },
  { id: "insurance", name: "Insurance", category: "finance" },
  { id: "investment", name: "Investment Services", category: "finance" },
  { id: "fintech", name: "Financial Technology", category: "finance" },
  { id: "accounting", name: "Accounting", category: "finance" },

  // Healthcare
  { id: "healthcare_services", name: "Healthcare Services", category: "healthcare" },
  { id: "pharmaceuticals", name: "Pharmaceuticals", category: "healthcare" },
  { id: "medical_devices", name: "Medical Devices", category: "healthcare" },
  { id: "biotech", name: "Biotechnology", category: "healthcare" },
  { id: "health_tech", name: "Health Technology", category: "healthcare" },

  // Manufacturing
  { id: "automotive", name: "Automotive", category: "manufacturing" },
  { id: "aerospace", name: "Aerospace", category: "manufacturing" },
  { id: "electronics", name: "Electronics", category: "manufacturing" },
  { id: "chemicals", name: "Chemicals", category: "manufacturing" },
  { id: "industrial", name: "Industrial Manufacturing", category: "manufacturing" },

  // Retail & Consumer
  { id: "retail", name: "Retail", category: "retail" },
  { id: "ecommerce", name: "E-commerce", category: "retail" },
  { id: "consumer_goods", name: "Consumer Goods", category: "retail" },
  { id: "luxury", name: "Luxury Goods", category: "retail" },
  { id: "fashion", name: "Fashion & Apparel", category: "retail" },

  // Services
  { id: "consulting", name: "Consulting", category: "services" },
  { id: "legal", name: "Legal Services", category: "services" },
  { id: "marketing", name: "Marketing & Advertising", category: "services" },
  { id: "real_estate", name: "Real Estate", category: "services" },
  { id: "hospitality", name: "Hospitality", category: "services" },

  // Energy & Utilities
  { id: "energy", name: "Energy", category: "energy" },
  { id: "utilities", name: "Utilities", category: "energy" },
  { id: "renewable", name: "Renewable Energy", category: "energy" },
  { id: "oil_gas", name: "Oil & Gas", category: "energy" },
  { id: "mining", name: "Mining", category: "energy" },

  // Media & Entertainment
  { id: "media", name: "Media", category: "media" },
  { id: "entertainment", name: "Entertainment", category: "media" },
  { id: "gaming", name: "Gaming", category: "media" },
  { id: "sports", name: "Sports", category: "media" },
  { id: "publishing", name: "Publishing", category: "media" },
];

export function getIndustryName(id: string | null): string {
  if (!id) return "Not specified";
  const industry = industries.find((i) => i.id === id);
  return industry ? industry.name : id;
}

export const industryOptions = industries.map((industry) => ({
  value: industry.id,
  label: industry.name,
})); 