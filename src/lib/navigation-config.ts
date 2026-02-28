import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  NotebookTabs,
  Package,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export function getDashboardNavigation(): NavigationItem[] {
  return [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Organizations",
      href: "/dashboard/organizations",
      icon: Building2,
    },
    {
      name: "Contacts",
      href: "/dashboard/contacts",
      icon: Users,
    },
    {
      name: "Projects",
      href: "/dashboard/projects",
      icon: NotebookTabs,
    },
    {
      name: "Offers",
      href: "/dashboard/offers",
      icon: FileText,
    },
    {
      name: "Services",
      href: "/dashboard/services",
      icon: Package,
    },
  ];
}
