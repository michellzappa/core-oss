"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import UnifiedForm from "@/components/forms/unified/unified-form";
import { formConfigs } from "@/lib/forms/form-configs";
import { LinkedInDataHandler } from "@/components/entities/contacts/linkedin-data-handler";
import {
  createContact,
  updateContact,
  deleteContact,
} from "@/lib/actions/contacts";
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "@/lib/actions/organizations";
import {
  createService,
  updateService,
  deleteService,
} from "@/lib/actions/services";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/actions/projects";
import {
  createOffer,
  updateOffer,
  deleteOffer,
} from "@/lib/actions/offers";

interface UnifiedFormClientProps {
  entityType: keyof typeof formConfigs;
  defaultValues: Record<string, unknown>;
  mode: "create" | "edit";
  title?: string;
  layoutVariant?: "half" | "wide";
}

export default function UnifiedFormClient({
  entityType,
  defaultValues,
  mode,
  title,
  layoutVariant = "wide",
}: UnifiedFormClientProps) {
  const [linkedinData, setLinkedinData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [key, setKey] = useState(0);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  const handleLinkedInData = (data: Record<string, unknown>) => {
    setLinkedinData(data);
    setKey((prev) => prev + 1);
  };

  const enhancedDefaultValues = useMemo(
    () => ({
      ...defaultValues,
      ...(linkedinData &&
      (entityType === "contact" || entityType === "organization")
        ? linkedinData
        : {}),
    }),
    [defaultValues, linkedinData, entityType]
  );

  const getServerActions = () => {
    switch (entityType) {
      case "contact":
        return {
          createAction: createContact,
          updateAction: updateContact,
          deleteAction: deleteContact,
        };
      case "organization":
        return {
          createAction: createOrganization,
          updateAction: updateOrganization,
          deleteAction: deleteOrganization,
        };
      case "service":
        return {
          createAction: createService,
          updateAction: updateService,
          deleteAction: deleteService,
        };
      case "project":
        return {
          createAction: createProject,
          updateAction: updateProject,
          deleteAction: deleteProject,
        };
      case "offer":
        return {
          createAction: createOffer,
          updateAction: updateOffer,
          deleteAction: deleteOffer,
        };
      default:
        return {};
    }
  };

  const serverActions = getServerActions();

  return (
    <>
      {(entityType === "contact" || entityType === "organization") &&
        mode === "create" && (
          <LinkedInDataHandler
            onDataReceived={handleLinkedInData}
            entityType={entityType === "contact" ? "contact" : "organization"}
          />
        )}

      <UnifiedForm
        key={key}
        entityType={entityType}
        defaultValues={enhancedDefaultValues}
        mode={mode}
        title={title}
        layoutVariant={layoutVariant}
        createAction={
          mode === "create" ? serverActions.createAction : undefined
        }
        updateAction={mode === "edit" ? serverActions.updateAction : undefined}
        deleteAction={serverActions.deleteAction}
        onSuccess={handleSuccess}
      />
    </>
  );
}
