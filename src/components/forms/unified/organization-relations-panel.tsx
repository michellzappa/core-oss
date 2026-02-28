"use client";

import LinkedItems, {
  type LinkedItem,
} from "@/components/ui/composite/linked-items";
import { useLinkedData, type UnlinkResult } from "@/hooks/use-linked-data";
import { Users, NotebookTabs, FileText } from "lucide-react";
import { toast } from "sonner";

interface OrganizationRelationsPanelProps {
  organizationId: string;
}

export default function OrganizationRelationsPanel({
  organizationId,
}: OrganizationRelationsPanelProps) {
  const {
    linkedContacts,
    linkedProjects,
    linkedOffers,
    isLoading,
    unlinkContactFromOrganization,
    unlinkProjectFromOrganization,
  } = useLinkedData({ organizationId });

  const unlinkItem = async (
    item: LinkedItem,
    action?: (id: string) => Promise<UnlinkResult>,
    successMessage?: string,
  ) => {
    if (!action) {
      return;
    }

    try {
      const result = await action(item.id);
      if (!result.success) {
        toast.error(result.error || "Unable to unlink item", {
          description: item.name,
        });
        return;
      }
      toast.success(successMessage || "Item unlinked", {
        description: item.name,
      });
    } catch (error) {
      console.error("Unexpected unlink error:", error);
      toast.error("Unable to unlink item", {
        description: item.name,
      });
    }
  };

  return (
    <div className="space-y-4">
      <LinkedItems
        config={{
          title: "Contacts",
          items: linkedContacts,
          createNewHref: `/dashboard/contacts/new?organization_id=${organizationId}`,
          createNewLabel: "Add Contact",
          emptyMessage: "No contacts",
          isLoading,
          icon: Users,
          onRemove: (item) =>
            unlinkItem(
              item,
              unlinkContactFromOrganization,
              "Contact removed from organization",
            ),
          getRemoveConfirmation: (item) =>
            `Remove ${item.name || "this contact"} from the organization?`,
        }}
      />

      <LinkedItems
        config={{
          title: "Projects",
          items: linkedProjects,
          createNewHref: `/dashboard/projects/new?organization_id=${organizationId}`,
          createNewLabel: "Add Project",
          emptyMessage: "No projects",
          isLoading,
          icon: NotebookTabs,
          onRemove: (item) =>
            unlinkItem(
              item,
              unlinkProjectFromOrganization,
              "Project removed from organization",
            ),
          getRemoveConfirmation: (item) =>
            `Remove ${item.name || "this project"} from the organization?`,
        }}
      />

      <LinkedItems
        config={{
          title: "Offers",
          items: linkedOffers,
          createNewHref: `/dashboard/offers/new?organization_id=${organizationId}`,
          createNewLabel: "Add Offer",
          emptyMessage: "No offers",
          isLoading,
          icon: FileText,
        }}
      />
    </div>
  );
}
