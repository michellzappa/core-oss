"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryStates, parseAsString } from "nuqs";
import { getPrefillKeys } from "@/lib/forms/prefill-allowlist";
import { useFormStatus } from "react-dom";

import { toast } from "sonner";
import type { ActionResponse } from "@/lib/actions/utils";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Textarea } from "@/components/ui/primitives/textarea";
import { DateTimePicker } from "@/components/ui/primitives/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import { Trash2 } from "lucide-react";
import { formConfigs } from "@/lib/forms/form-configs";
import { Alert, AlertDescription } from "@/components/ui/primitives/alert";
import type { UseFormReturn, FieldErrors } from "react-hook-form";
import { useOptionalEditPageLock } from "@/components/layouts/pages/edit-page-layout";
import {
  getInputClasses,
  getSelectTriggerClasses,
  getTextareaClasses,
} from "@/lib/utils/input-styles";
import { ConfirmDialog } from "@/components/ui/navigation";

// Form field definition
export interface UnifiedFormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "textarea"
    | "select"
    | "number"
    | "date"
    | "datetime-local"
    | "toggle"
    | "section"
    | "custom";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  section?: string;
  hidden?:
    | boolean
    | ((form: UseFormReturn<Record<string, unknown>>) => boolean);
  customRenderer?: (props: CustomFieldProps) => React.ReactNode;
  // Specialized support for offers: services-builder field emits services array
  // When provided, this renderer receives a callback to set services into the form
  servicesRenderer?: (
    props: CustomFieldProps & {
      onChangeServices: (services: Array<Record<string, unknown>>) => void;
    },
  ) => React.ReactNode;
  onChange?: (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => void;
  // Optional grid span within the current section grid
  // Example: in a 2-column section, set colSpan=2 for full-width
  colSpan?: number;
  maxLength?: number;
}

export interface CustomFieldProps {
  field: UnifiedFormField;
  form: UseFormReturn<Record<string, unknown>>;
  error?: string;
  isLocked?: boolean;
  mode?: "create" | "edit";
}

interface UnifiedFormProps {
  entityType?: keyof typeof formConfigs;
  schema?: z.ZodSchema<Record<string, unknown>>;
  fields?: UnifiedFormField[];
  defaultValues: Record<string, unknown>;
  entityName?: string;
  apiEndpoint?: string;
  backLink?: string;
  mode: "create" | "edit";
  title?: string;
  layoutVariant?: "half" | "wide";
  transformSubmit?: (data: Record<string, unknown>) => Record<string, unknown>;
  onDelete?: () => Promise<void>;
  onFieldChange?: (fieldName: string, value: unknown) => void;
  onSuccess?: () => void; // Callback for successful form submission
  // Server Action support
  createAction?: (
    prevState: ActionResponse<unknown> | null,
    formData: FormData,
  ) => Promise<ActionResponse<unknown>>;
  updateAction?: (
    prevState: ActionResponse<unknown> | null,
    formData: FormData,
  ) => Promise<ActionResponse<unknown>>;
  deleteAction?: (
    prevState: ActionResponse<unknown> | null,
    formData: FormData,
  ) => Promise<ActionResponse<unknown>>;
  // Type-ahead search support
  enableTypeAhead?: boolean;
  typeAheadFields?: string[];
}

export default function UnifiedForm({
  entityType,
  schema,
  fields,
  defaultValues,
  entityName,
  apiEndpoint,
  backLink,
  mode,
  layoutVariant = "wide",
  transformSubmit,
  onDelete,
  onFieldChange,
  onSuccess,
  // Server Action props
  createAction,
  updateAction,
  deleteAction,
}: // Type-ahead props - will be used in future implementation
// enableTypeAhead = false,
// typeAheadFields = [],
UnifiedFormProps) {
  const unsavedChangesMessage =
    "You have unsaved changes. Are you sure you want to leave this page?";
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatLocalDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get lock state from context in edit pages; create pages render without a provider
  const lockContext = useOptionalEditPageLock();
  const isLocked = mode === "edit" ? (lockContext?.isLocked ?? false) : false;
  const router = useRouter();
  const prefillKeys = useMemo(
    () => (entityType ? getPrefillKeys(entityType) : []),
    [entityType],
  );
  const parserConfig = useMemo((): Record<
    string,
    ReturnType<typeof parseAsString.withDefault>
  > => {
    const cfg: Record<
      string,
      ReturnType<typeof parseAsString.withDefault>
    > = {};
    for (const k of prefillKeys) {
      cfg[k] = parseAsString.withDefault("");
    }
    return cfg;
  }, [prefillKeys]);
  const [prefill] = useQueryStates(parserConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pending } = useFormStatus();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const suppressNextPopStateRef = useRef(false);

  // Handle URL parameters for pre-filling fields (allowlisted only)
  const urlParams = useMemo(() => {
    const entries = Object.entries(prefill as Record<string, string>);
    const allowed = entries.filter(
      ([, v]) => typeof v === "string" && v !== "",
    );
    return Object.fromEntries(allowed) as Record<string, unknown>;
  }, [prefill]);

  // Get config from entityType if provided
  const config = entityType ? formConfigs[entityType] : null;
  const finalSchema = schema || config?.schema;
  const finalFields = fields || config?.fields;
  const finalEntityName = entityName || config?.entityName;
  const finalApiEndpoint = apiEndpoint || config?.apiEndpoint;
  const finalBackLink = backLink || config?.backLink;

  // Convert boolean values to strings for select fields and format dates for date fields
  const enhancedDefaultValues = useMemo(() => {
    const processedDefaultValues = { ...defaultValues };
    if (finalFields) {
      finalFields.forEach((field) => {
        // Ensure toggle fields remain as booleans
        if (field.type === "toggle") {
          if (
            processedDefaultValues[field.name] === null ||
            processedDefaultValues[field.name] === undefined
          ) {
            processedDefaultValues[field.name] = false;
          } else {
            processedDefaultValues[field.name] = Boolean(
              processedDefaultValues[field.name],
            );
          }
        }
        // Convert boolean values to strings for select fields only
        else if (
          field.type === "select" &&
          typeof processedDefaultValues[field.name] === "boolean"
        ) {
          processedDefaultValues[field.name] = String(
            processedDefaultValues[field.name],
          );
        }
        // Format date fields to YYYY-MM-DD for date pickers
        else if (field.type === "date" && processedDefaultValues[field.name]) {
          const dateValue = processedDefaultValues[field.name];
          if (typeof dateValue === "string") {
            try {
              // Convert timestamptz or any date string to YYYY-MM-DD format
              const date = new Date(dateValue);
              if (!Number.isNaN(date.getTime())) {
                const formattedDate = formatLocalDate(date);
                processedDefaultValues[field.name] = formattedDate;
              }
            } catch (error) {
              console.warn(
                `Failed to format date for field ${field.name}:`,
                error,
              );
            }
          }
        }
        // Format datetime-local fields to YYYY-MM-DDTHH:MM for date-time pickers
        else if (
          field.type === "datetime-local" &&
          processedDefaultValues[field.name]
        ) {
          const dateValue = processedDefaultValues[field.name];
          if (typeof dateValue === "string") {
            try {
              // Convert timestamptz or any date string to YYYY-MM-DDTHH:MM format
              const date = new Date(dateValue);
              if (!Number.isNaN(date.getTime())) {
                // Format to YYYY-MM-DDTHH:MM (remove seconds and timezone)
                const formattedDateTime = formatLocalDateTime(date);
                processedDefaultValues[field.name] = formattedDateTime;
              }
            } catch (error) {
              console.warn(
                `Failed to format datetime-local for field ${field.name}:`,
                error,
              );
            }
          }
        }
        // Ensure array fields are properly initialized
        else if (
          field.name === "contact_ids" &&
          !Array.isArray(processedDefaultValues[field.name])
        ) {
          processedDefaultValues[field.name] = [];
        }
      });
    }

    return { ...processedDefaultValues, ...urlParams };
  }, [defaultValues, finalFields, urlParams]);

  if (
    !finalSchema ||
    !finalFields ||
    !finalEntityName ||
    !finalApiEndpoint ||
    !finalBackLink
  ) {
    throw new Error("Missing required configuration for UnifiedForm");
  }

  // Determine if we should use Server Actions or API routes
  const useServerActions = !!(createAction || updateAction || deleteAction);

  // Server Action form handling
  const getServerAction = () => {
    if (mode === "create" && createAction) {
      return createAction;
    } else if (mode === "edit" && updateAction) {
      return updateAction;
    }
    return undefined;
  };

  const serverAction = getServerAction();
  console.log("🔍 Server Action setup:", {
    mode,
    createAction: !!createAction,
    updateAction: !!updateAction,
    serverAction: !!serverAction,
    serverActionType: typeof serverAction,
  });

  // Use the Server Action directly instead of useActionState
  const serverFormAction = serverAction;

  // React Hook Form for type-ahead or fallback
  const form = useForm({
    resolver: zodResolver(finalSchema),
    defaultValues: enhancedDefaultValues,
  });
  const hasUnsavedChanges = form.formState.isDirty && !isLoading && !pending;

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = unsavedChangesMessage;
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let targetUrl: URL;
      try {
        targetUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const isSameRoute =
        targetUrl.origin === currentUrl.origin &&
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search &&
        targetUrl.hash === currentUrl.hash;
      if (isSameRoute) return;

      const shouldLeave = window.confirm(unsavedChangesMessage);
      if (!shouldLeave) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handlePopState = () => {
      if (suppressNextPopStateRef.current) {
        suppressNextPopStateRef.current = false;
        return;
      }
      const shouldLeave = window.confirm(unsavedChangesMessage);
      if (!shouldLeave) {
        suppressNextPopStateRef.current = true;
        window.history.go(1);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, unsavedChangesMessage]);

  const focusFirstErrorField = (
    errors: FieldErrors<Record<string, unknown>>,
  ) => {
    if (!finalFields || !errors) return;
    const orderedFieldNames = finalFields.map((field) => field.name);
    const firstWithError = orderedFieldNames.find(
      (fieldName) => errors[fieldName],
    );
    if (firstWithError) {
      form.setFocus(String(firstWithError));
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    // Process array fields to ensure they are arrays
    const processedData = { ...data };
    if (finalFields) {
      finalFields.forEach((field) => {
        if (
          field.name === "contact_ids" &&
          !Array.isArray(processedData[field.name])
        ) {
          processedData[field.name] = [];
        }
      });
    }

    // For offers, ensure API expects { offer, services }
    const isOffer = finalEntityName.toLowerCase() === "offer";
    let payloadData: Record<string, unknown> = processedData;
    if (isOffer) {
      // Read mirrored services from hidden input if present
      let services: Array<Record<string, unknown>> = [];
      if (typeof document !== "undefined") {
        const hidden = document.querySelector(
          'input[name="services_hidden"]',
        ) as HTMLInputElement | null;
        if (hidden && hidden.value) {
          try {
            services = JSON.parse(hidden.value);
          } catch {}
        }
        // No hidden inputs; data already in RHF (offer_selected_link_ids)
        const rhfLinks = (data as Record<string, unknown>)
          ?.offer_selected_link_ids as unknown;
        if (Array.isArray(rhfLinks)) {
          console.debug(
            "UnifiedForm submit (RHF): offer_selected_link_ids",
            rhfLinks,
          );
        }
      }
      payloadData = { offer: data, services };
    }
    // If using Server Actions, let the form handle submission
    if (useServerActions) {
      return;
    }

    // Fallback to API route submission
    setIsLoading(true);
    setError(null);

    try {
      const url =
        mode === "edit" && defaultValues.id
          ? `${finalApiEndpoint}/${defaultValues.id}`
          : finalApiEndpoint;

      const method = mode === "edit" ? "PUT" : "POST";

      const payload = transformSubmit
        ? transformSubmit(payloadData)
        : payloadData;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to ${mode} ${finalEntityName}`,
        );
      }

      toast.success(
        `${finalEntityName} ${
          mode === "create" ? "created" : "updated"
        } successfully`,
      );
      router.push(finalBackLink);
      router.refresh();
      onSuccess?.(); // Call onSuccess callback on successful form submission
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for global save hotkey and submit if allowed
  useEffect(() => {
    const onGlobalSave = () => {
      if (isLocked) return;
      const formElement = document.getElementById(
        "unified-form",
      ) as HTMLFormElement | null;
      if (formElement) {
        formElement.requestSubmit();
      }
    };
    document.addEventListener("global-save", onGlobalSave as EventListener);
    return () =>
      document.removeEventListener(
        "global-save",
        onGlobalSave as EventListener,
      );
  }, [isLocked]);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsLoading(true);
    try {
      await onDelete();
      toast.success(`${finalEntityName} deleted successfully`);
      router.push(finalBackLink);
      router.refresh();
    } catch (err: unknown) {
      // Handle foreign key constraint errors specifically
      if (
        (err as Record<string, unknown>)?.code === "FOREIGN_KEY_CONSTRAINT" ||
        String((err as Record<string, unknown>)?.message || "").includes(
          "foreign key constraint",
        )
      ) {
        const errorMessage =
          (err as Record<string, unknown>)?.error ||
          (err as Record<string, unknown>)?.message ||
          "Cannot delete this item because it has related data.";
        toast.error(errorMessage as string);
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getColSpanClass = (span: number | undefined, parentCols: number) => {
    if (!span || parentCols <= 1) return "";
    const s = Math.max(1, Math.min(span, parentCols));
    if (parentCols === 3) {
      if (s === 3) return "md:col-span-3";
      if (s === 2) return "md:col-span-2";
      return "md:col-span-1";
    }
    // parentCols === 2
    if (s === 2) return "md:col-span-2";
    return "md:col-span-1";
  };

  const renderField = (field: UnifiedFormField, parentCols: number) => {
    const fieldError = form.formState.errors[field.name]?.message as string;
    const fieldErrorId = `${field.name}-error`;
    const errorDescribedBy = fieldError ? fieldErrorId : undefined;
    const isFieldInvalid = Boolean(fieldError);

    if (field.type === "section") {
      return (
        <div key={field.name} className="border-t border-neutral-200 pt-6 mt-6">
          <h3 className="text-lg font-medium text-neutral-900">
            {field.label}
          </h3>
        </div>
      );
    }

    // For hidden fields, render as hidden input
    const isHidden =
      typeof field.hidden === "function" ? field.hidden(form) : field.hidden;
    if (isHidden) {
      return (
        <input key={field.name} type="hidden" {...form.register(field.name)} />
      );
    }

    // For type-ahead fields, always use custom renderer
    if (field.type === "custom") {
      // Ensure custom fields re-render when their value changes by subscribing
      // to the specific field via RHF's watch. This keeps hidden inputs in sync.
      const watchedValue = form.watch(field.name);
      // Directly render custom field (avoid hooks in nested function)
      let rendered: React.ReactNode = null;
      if (field.customRenderer) {
        rendered = field.customRenderer({
          field,
          form,
          error: fieldError,
          isLocked,
          mode,
        });
      } else if (field.servicesRenderer) {
        rendered = field.servicesRenderer({
          field,
          form,
          error: fieldError,
          isLocked,
          onChangeServices: (services) => {
            form.setValue("services", services);
          },
        });
      }
      // Ensure value is included in native form submissions (Server Actions)
      // by mirroring the current form state into a hidden input.
      const hiddenValue = watchedValue;
      const serializedValue =
        hiddenValue === undefined || hiddenValue === null
          ? ""
          : typeof hiddenValue === "string" || typeof hiddenValue === "number"
            ? String(hiddenValue)
            : JSON.stringify(hiddenValue);
      return (
        <div
          key={field.name}
          className={`space-y-2 ${getColSpanClass(field.colSpan, parentCols)}`}
        >
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {rendered}
          <input type="hidden" name={field.name} value={serializedValue} />
          {fieldError && (
            <p
              id={fieldErrorId}
              className="text-sm text-red-600 dark:text-red-400"
              aria-live="polite"
            >
              {fieldError}
            </p>
          )}
        </div>
      );
    }

    return (
      <div
        key={field.name}
        className={`space-y-2 ${getColSpanClass(field.colSpan, parentCols)}`}
      >
        {field.type === "toggle" ? (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              {...form.register(field.name)}
              disabled={isLocked}
              aria-invalid={isFieldInvalid}
              aria-describedby={errorDescribedBy}
              className="h-4 w-4 rounded border border-[var(--border)] bg-[var(--background)] accent-[var(--foreground)] text-[var(--foreground)] focus:ring-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Label
              htmlFor={field.name}
              className="text-sm text-[var(--foreground)]"
            >
              {field.label}
            </Label>
          </div>
        ) : (
          <>
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "textarea" ? (
              <>
                {(() => {
                  const fieldValue = form.watch(field.name);
                  const currentLength =
                    typeof fieldValue === "string"
                      ? fieldValue.length
                      : fieldValue
                        ? String(fieldValue).length
                        : 0;
                  return (
                    <>
                      <Textarea
                        id={field.name}
                        {...form.register(field.name)}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                        disabled={isLocked}
                        maxLength={field.maxLength}
                        aria-invalid={isFieldInvalid}
                        aria-describedby={errorDescribedBy}
                        className={getTextareaClasses(isLocked, !!fieldError)}
                      />
                      {field.maxLength ? (
                        <div className="flex justify-end text-xs text-[var(--muted-foreground)]">
                          {currentLength.toLocaleString()} /{" "}
                          {field.maxLength.toLocaleString()}
                        </div>
                      ) : null}
                    </>
                  );
                })()}
              </>
            ) : field.type === "select" ? (
              <>
                <Select
                  value={
                    form.watch(field.name)
                      ? String(form.watch(field.name))
                      : "__placeholder__"
                  }
                  onValueChange={(value) => {
                    if (isLocked) return; // Prevent changes when locked

                    // Convert __placeholder__ to empty string for form data
                    const actualValue =
                      value === "__placeholder__" ? "" : value;
                    form.setValue(field.name, actualValue);

                    // Call the onFieldChange prop if provided
                    onFieldChange?.(field.name, actualValue);

                    // Call the onChange handler if provided
                    if (field.onChange) {
                      const syntheticEvent = {
                        target: { value: actualValue, name: field.name },
                      } as React.ChangeEvent<HTMLSelectElement>;
                      field.onChange(syntheticEvent);
                    }
                  }}
                  disabled={isLocked}
                >
                  <SelectTrigger
                    className={getSelectTriggerClasses(isLocked, !!fieldError)}
                    disabled={isLocked}
                    aria-invalid={isFieldInvalid}
                    aria-describedby={errorDescribedBy}
                  >
                    <SelectValue
                      placeholder={field.placeholder || "Select an option"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options && field.options.length > 0
                      ? field.options
                      : [
                          { value: "EUR", label: "EUR (€)" },
                          { value: "USD", label: "USD ($)" },
                          { value: "GBP", label: "GBP (£)" },
                        ]
                    ).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Mirror selected value into a hidden input so Server Actions receive it */}
                <input
                  type="hidden"
                  name={field.name}
                  value={String(form.watch(field.name) ?? "")}
                />
              </>
            ) : (
              <>
                {field.type === "number" ? (
                  <Input
                    id={field.name}
                    type="number"
                    name={field.name}
                    placeholder={field.placeholder}
                    disabled={isLocked}
                    aria-invalid={isFieldInvalid}
                    aria-describedby={errorDescribedBy}
                    className={getInputClasses(isLocked, !!fieldError)}
                    value={(() => {
                      const val = form.watch(field.name);
                      if (val === null || val === undefined) return "";
                      return String(val);
                    })()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || val === null || val === undefined) {
                        form.setValue(field.name, null);
                      } else {
                        const parsed = Number(val);
                        if (!Number.isNaN(parsed)) {
                          form.setValue(field.name, parsed);
                        }
                      }
                    }}
                  />
                ) : field.type === "date" ? (
                  <>
                    <DateTimePicker
                      id={field.name}
                      mode="date"
                      value={String(form.watch(field.name) ?? "")}
                      onValueChange={(value) =>
                        form.setValue(field.name, value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      placeholder={field.placeholder}
                      disabled={isLocked}
                      aria-invalid={isFieldInvalid}
                      aria-describedby={errorDescribedBy}
                    />
                    <input
                      type="hidden"
                      {...form.register(field.name)}
                      value={String(form.watch(field.name) ?? "")}
                    />
                  </>
                ) : field.type === "datetime-local" ? (
                  <>
                    <DateTimePicker
                      id={field.name}
                      mode="datetime"
                      value={String(form.watch(field.name) ?? "")}
                      onValueChange={(value) =>
                        form.setValue(field.name, value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      placeholder={field.placeholder}
                      disabled={isLocked}
                      aria-invalid={isFieldInvalid}
                      aria-describedby={errorDescribedBy}
                    />
                    <input
                      type="hidden"
                      {...form.register(field.name)}
                      value={String(form.watch(field.name) ?? "")}
                    />
                  </>
                ) : field.type === "email" ? (
                  <Input
                    id={field.name}
                    type="email"
                    name={field.name}
                    placeholder={field.placeholder}
                    disabled={isLocked}
                    aria-invalid={isFieldInvalid}
                    aria-describedby={errorDescribedBy}
                    className={getInputClasses(isLocked, !!fieldError)}
                    value={String(
                      (form.watch(field.name) as string | undefined) ?? "",
                    )}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const match = raw.match(
                        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
                      );
                      const sanitized = match ? match[0] : raw.trim();
                      form.setValue(field.name, sanitized, {
                        shouldValidate: true,
                      });
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData("text");
                      const match = text.match(
                        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
                      );
                      if (match) {
                        e.preventDefault();
                        form.setValue(field.name, match[0], {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                ) : field.type === "text" && field.name === "headline" ? (
                  <Input
                    id={field.name}
                    type="text"
                    name={field.name}
                    placeholder={field.placeholder}
                    disabled={isLocked}
                    aria-invalid={isFieldInvalid}
                    aria-describedby={errorDescribedBy}
                    className={getInputClasses(isLocked, !!fieldError)}
                    maxLength={200}
                    value={String(
                      (form.watch(field.name) as string | undefined) ?? "",
                    )}
                    onChange={(e) => {
                      const next = (e.target.value || "").slice(0, 200);
                      form.setValue(field.name, next, { shouldValidate: true });
                    }}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    {...form.register(field.name)}
                    placeholder={field.placeholder}
                    disabled={isLocked}
                    aria-invalid={isFieldInvalid}
                    aria-describedby={errorDescribedBy}
                    className={getInputClasses(isLocked, !!fieldError)}
                  />
                )}
              </>
            )}
          </>
        )}

        {fieldError && (
          <p
            id={fieldErrorId}
            className="text-sm text-red-600 dark:text-red-400"
            aria-live="polite"
          >
            {fieldError}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form
        id="unified-form"
        data-unified-form
        onSubmit={
          useServerActions
            ? isLocked
              ? (e) => e.preventDefault()
              : undefined
            : isLocked
              ? (e) => e.preventDefault()
              : form.handleSubmit(handleSubmit, (errors) =>
                  focusFirstErrorField(errors),
                )
        }
        action={
          useServerActions && !isLocked
            ? async (formData: FormData) => {
                if (serverFormAction) {
                  try {
                    const result = await serverFormAction(null, formData);
                    if (result.success) {
                      toast.success(
                        `${finalEntityName} ${
                          mode === "create" ? "created" : "updated"
                        } successfully`,
                      );
                      router.push(finalBackLink);
                      router.refresh();
                      onSuccess?.(); // Call onSuccess callback on successful server action
                    } else if (result.error) {
                      toast.error(result.error);
                    }
                  } catch {
                    toast.error("An error occurred while saving");
                  }
                }
              }
            : undefined
        }
        className="space-y-6"
      >
        {(() => {
          // Group fields by section
          const sections: Record<string, UnifiedFormField[]> = {};
          const ungroupedFields: UnifiedFormField[] = [];

          for (const field of finalFields) {
            if (field.type === "section") {
              // Skip creating a visual section for hidden section definitions;
              // their child fields will fall back to the ungrouped grid.
              const isHiddenSection =
                typeof field.hidden === "function"
                  ? field.hidden(form)
                  : field.hidden;
              if (!isHiddenSection) {
                sections[field.name] = [];
              }
              continue;
            }
            if (field.section && sections[field.section]) {
              sections[field.section].push(field);
              continue;
            }
            ungroupedFields.push(field);
          }

          return (
            <>
              {/* Render ungrouped fields first */}
              {ungroupedFields.length > 0 && (
                <div
                  className={
                    layoutVariant === "half"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                      : "grid grid-cols-1 md:grid-cols-2 gap-6"
                  }
                >
                  {ungroupedFields.map((f) =>
                    renderField(f, layoutVariant === "half" ? 2 : 2),
                  )}
                </div>
              )}

              {/* Render sections */}
              {Object.entries(sections).map(([sectionName, sectionFields]) => (
                <div key={sectionName} className="space-y-6">
                  {/* Section header */}
                  <div className="border-t border-[var(--border)] pt-6">
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">
                      {finalFields.find((f) => f.name === sectionName)?.label ||
                        sectionName}
                    </h3>
                  </div>

                  {/* Section fields */}
                  <div
                    className={
                      sectionName === "full_width"
                        ? "space-y-6"
                        : sectionName === "qualification_checklist" ||
                            sectionName === "profile_characteristics"
                          ? "grid grid-cols-1 md:grid-cols-2 gap-6 text-[var(--foreground)]"
                          : sectionName === "pricing"
                            ? "grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
                            : sectionName === "basic_info" && entityType === "offer"
                              ? "grid grid-cols-1 md:grid-cols-2 gap-6 items-end"
                              : "grid grid-cols-1 md:grid-cols-2 gap-6"
                    }
                  >
                    {sectionFields.map((f) =>
                      renderField(
                        f,
                        sectionName === "full_width"
                          ? 1
                          : sectionName === "pricing"
                            ? 3
                            : 2,
                      ),
                    )}
                  </div>
                </div>
              ))}
            </>
          );
        })()}

        {/* Include ID field in edit mode for server actions */}
        {mode === "edit" &&
        defaultValues.id &&
        typeof defaultValues.id === "string" ? (
          <input type="hidden" name="id" value={defaultValues.id} />
        ) : null}

        {/* Only show buttons when not locked (or in create mode) */}
        {(!isLocked || mode === "create") && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-[var(--border)]">
            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isLoading || pending}>
              {isLoading || pending
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
      {mode === "edit" && onDelete && (
        <ConfirmDialog
          open={isDeleteDialogOpen}
          title={`Delete ${finalEntityName}?`}
          description="This will permanently delete this item. This action cannot be undone."
          confirmLabel="Delete"
          isDestructive
          isLoading={isLoading}
          onConfirm={async () => {
            await handleDelete();
            setIsDeleteDialogOpen(false);
          }}
          onOpenChange={(open) => {
            if (!open) {
              setIsDeleteDialogOpen(false);
            }
          }}
        />
      )}
    </>
  );
}
