"use client";

import UnifiedForm from "@/components/forms/unified/unified-form";
import { formConfigs } from "@/lib/forms/form-configs";
import {
  createService,
  updateService,
  deleteService,
} from "@/lib/actions/services";

interface ServiceFormClientProps {
  defaultValues: Record<string, unknown>;
  mode: "create" | "edit";
  title?: string;
}

export default function ServiceFormClient({
  defaultValues,
  mode,
  title,
}: ServiceFormClientProps) {
  const config = formConfigs.service;

  return (
    <UnifiedForm
      entityType="service"
      schema={config.schema}
      fields={config.fields}
      defaultValues={defaultValues}
      entityName={config.entityName}
      apiEndpoint={config.apiEndpoint}
      backLink={config.backLink}
      mode={mode}
      title={title}
      createAction={createService}
      updateAction={updateService}
      deleteAction={deleteService}
    />
  );
}
