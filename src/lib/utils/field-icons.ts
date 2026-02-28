import {
  Building2,
  Users,
  FileText,
  Briefcase,
  Package,
  User,
  Calendar,
  Hash,
  Globe,
  Phone,
  Mail,
  MapPin,
  Euro,
  Percent,
  Clock,
  Building,
} from "lucide-react";

// Map field names to their corresponding Lucide icons
export const FIELD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  // Organization-related fields
  organization_id: Building2,
  organization: Building2,
  org: Building2,
  
  // Corporate entity fields
  corporate_entity_id: Building,
  corporate_entity: Building,
  
  // Contact-related fields
  contact_id: Users,
  contact: Users,
  owner_id: Users,
  created_by: Users,
  
  // Offer-related fields
  offer_id: FileText,
  offer: FileText,
  
  // Project-related fields
  project_id: FileText,
  project: FileText,
  
  // Service-related fields
  service_id: Briefcase,
  service: Briefcase,
  
  // Token-related fields
  token_id: Package,
  token: Package,
  
  // Common fields
  name: User,
  title: FileText,
  status: Hash,
  date: Calendar,
  start_date: Calendar,
  end_date: Calendar,
  created_at: Clock,
  updated_at: Clock,
  
  // Contact fields
  email: Mail,
  phone: Phone,
  address: MapPin,
  country: Globe,
  
  // Financial fields
  amount: Euro,
  price: Euro,
  cost: Euro,
  rate: Percent,
  
  // Default fallback
  default: Hash,
};

export function getFieldIcon(fieldName: string) {
  // Try exact match first
  if (FIELD_ICONS[fieldName]) {
    return FIELD_ICONS[fieldName];
  }
  
  // Try partial matches (e.g., "organization_id" matches "organization")
  for (const [key, icon] of Object.entries(FIELD_ICONS)) {
    if (fieldName.includes(key) && key !== 'default') {
      return icon;
    }
  }
  
  // Return default icon if no match found
  return FIELD_ICONS.default;
} 