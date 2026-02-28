"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Plus, Check, Minus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { Service } from "@/lib/api/services";

import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { Card, CardContent } from "@/components/ui/primitives/card";
import useSWR from "swr";
import { fetcher } from "@/lib/fetchers";

interface OfferServicesFormProps {
  initialData: Record<string, unknown>;
  isFinalized: boolean;
  mode?: "create" | "edit";
  onSelectedServicesChange?: (services: Array<Record<string, unknown>>) => void;
}

interface SelectedService {
  line_id: string;
  service_id: string;
  quantity: number;
  price: number;
  discount_percentage?: number;
  custom_description?: string;
}

function isCustomPricedServiceName(name?: string) {
  return name === "Custom Development" || name === "Custom License";
}

const OfferServicesForm = forwardRef<
  { getSelectedServices: () => Array<Record<string, unknown>> },
  OfferServicesFormProps
>(function OfferServicesForm(
  { initialData, isFinalized, mode = "edit", onSelectedServicesChange },
  ref,
) {
  const { data: servicesData } = useSWR<Service[]>("/api/services", fetcher);
  const services = servicesData || [];
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    [],
  );
  const [isInitialized, setIsInitialized] = useState(false);
  // State for custom descriptions and prices (keyed by service_id)
  const [customDescriptions, setCustomDescriptions] = useState<
    Record<string, string>
  >({});
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  function createLineId(serviceId: string) {
    return `${serviceId}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }

  // Expose selected services to parent component
  useImperativeHandle(ref, () => ({
    getSelectedServices: () =>
      selectedServices.map((serviceLine) => {
        const serviceData = services.find(
          (s) => s.id === serviceLine.service_id,
        );
        const serviceName = serviceData?.name;
        const isCustomPriced = isCustomPricedServiceName(serviceName);
        const finalPrice =
          isCustomPriced &&
          customPrices[serviceLine.line_id] !== undefined
            ? customPrices[serviceLine.line_id]
            : serviceLine.price;
        const finalDescription =
          isCustomPriced && customDescriptions[serviceLine.line_id]
            ? customDescriptions[serviceLine.line_id]
            : serviceLine.custom_description;

        return {
          service_id: serviceLine.service_id,
          quantity: serviceLine.quantity,
          price: finalPrice,
          discount_percentage: serviceLine.discount_percentage || 0,
          is_custom: false,
          custom_description: finalDescription || undefined,
        };
      }) as Array<Record<string, unknown>>,
  }));

  // Load initial services once when fetched
  useEffect(() => {
    const incoming =
      initialData?.services &&
      Array.isArray(initialData.services) &&
      (initialData.services as Array<unknown>).length > 0;

    // Wait for services to be loaded before initializing
    if (isInitialized || !incoming || services.length === 0) return;

    const regularServices: SelectedService[] = [];
    const initialServices = initialData.services as Array<
      Record<string, unknown>
    >;
    const initialCustomDescriptions: Record<string, string> = {};
    const initialCustomPrices: Record<string, number> = {};
    let lineIndex = 0;

    initialServices.forEach((s: Record<string, unknown>) => {
      if (!s.is_custom) {
        const serviceId = s.service_id as string;
        const loadedPrice = s.price as number;
        const lineId = `${serviceId}-${lineIndex++}`;
        regularServices.push({
          line_id: lineId,
          service_id: serviceId,
          quantity: (s.quantity as number) || 1,
          price: loadedPrice,
          custom_description: s.custom_description as string | undefined,
        });

        // Load custom description if it exists
        if (s.custom_description) {
          initialCustomDescriptions[lineId] = s.custom_description as string;
        }

        // Initialize custom prices from the loaded services
        // We need to check if the price differs from the base service price
        // For Custom Development or Custom License, we'll always track the price as custom
        const baseService = services.find((svc) => svc.id === serviceId);
        if (baseService) {
          // For Custom Development or Custom License, always track custom price
          // For other services, only track if price differs from base
          if (
            isCustomPricedServiceName(baseService.name) ||
            loadedPrice !== baseService.price
          ) {
            initialCustomPrices[lineId] = loadedPrice;
          }
        }
      }
    });

    setCustomDescriptions(initialCustomDescriptions);
    setCustomPrices(initialCustomPrices);
    setSelectedServices(regularServices);
    setIsInitialized(true);
  }, [initialData, isInitialized, services]);

  // Removed default preselected services for create mode

  // Notify parent when services change
  useEffect(() => {
    if (!onSelectedServicesChange) return;
    const combined = selectedServices.map((serviceLine) => {
      const serviceData = services.find(
        (s) => s.id === serviceLine.service_id,
      );
      const serviceName = serviceData?.name;
      const isCustomPriced = isCustomPricedServiceName(serviceName);
      const finalPrice =
        isCustomPriced &&
        customPrices[serviceLine.line_id] !== undefined
          ? customPrices[serviceLine.line_id]
          : serviceLine.price;
      const finalDescription =
        isCustomPriced && customDescriptions[serviceLine.line_id]
          ? customDescriptions[serviceLine.line_id]
          : serviceLine.custom_description;

      return {
        service_id: serviceLine.service_id,
        quantity: serviceLine.quantity,
        price: finalPrice,
        discount_percentage: serviceLine.discount_percentage || 0,
        is_custom: false,
        custom_description: finalDescription || undefined,
      };
    });
    onSelectedServicesChange(combined as Array<Record<string, unknown>>);
  }, [
    selectedServices,
    customDescriptions,
    customPrices,
    services,
    onSelectedServicesChange,
  ]);

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.some(
      (s) => s.service_id === service.id,
    );

    if (isSelected) {
      // Remove service completely when clicking on a selected service
      const newSelectedServices = selectedServices.filter(
        (s) => s.service_id !== service.id,
      );
      setSelectedServices(newSelectedServices);

      // Clean up custom description and price for removed lines
      const remainingLineIds = newSelectedServices.map((s) => s.line_id);
      const newCustomDescriptions: Record<string, string> = {};
      const newCustomPrices: Record<string, number> = {};

      Object.entries(customDescriptions).forEach(([lineId, value]) => {
        if (remainingLineIds.includes(lineId)) {
          newCustomDescriptions[lineId] = value;
        }
      });

      Object.entries(customPrices).forEach(([lineId, value]) => {
        if (remainingLineIds.includes(lineId)) {
          newCustomPrices[lineId] = value;
        }
      });

      setCustomDescriptions(newCustomDescriptions);
      setCustomPrices(newCustomPrices);
    } else {
      // Add new service
      const isCustomDevelopment = service.name === "Custom Development";
      const isCustomLicense = service.name === "Custom License";
      const defaultPrice = isCustomDevelopment ? 10000 : service.price;
      const lineId = createLineId(service.id);

      const newSelectedServices = [
        ...selectedServices,
        {
          line_id: lineId,
          service_id: service.id,
          quantity: 1,
          price: defaultPrice,
          discount_percentage: 0,
        },
      ];
      setSelectedServices(newSelectedServices);

      // Initialize custom price for Custom Development or Custom License
      if (isCustomDevelopment || isCustomLicense) {
        setCustomPrices({
          ...customPrices,
          [lineId]: defaultPrice,
        });
      }
    }
  };

  const handleQuantityChange = (serviceId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove service if quantity is 0 or negative
      const newSelectedServices = selectedServices.filter(
        (s) => s.service_id !== serviceId,
      );
      setSelectedServices(newSelectedServices);
    } else {
      // Update quantity
      const newSelectedServices = selectedServices.map((s) =>
        s.service_id === serviceId ? { ...s, quantity: newQuantity } : s,
      );
      setSelectedServices(newSelectedServices);
    }
  };

  const calculateTotal = () => {
    const regularServicesTotal = selectedServices.reduce(
      (total, serviceLine) => {
        const serviceData = services.find(
          (s) => s.id === serviceLine.service_id,
        );
        const quantity = serviceData?.allow_multiple ? serviceLine.quantity : 1;
        // Use custom price if available, otherwise use service price
        const serviceName = serviceData?.name;
        const isCustomPriced = isCustomPricedServiceName(serviceName);
        const effectivePrice =
          isCustomPriced &&
          customPrices[serviceLine.line_id] !== undefined
            ? customPrices[serviceLine.line_id]
            : serviceLine.price;
        const basePrice = effectivePrice * quantity;
        const discountPercentage =
          (initialData.global_discount_percentage as number) || 0;
        return total + basePrice * (1 - discountPercentage / 100);
      },
      0,
    );

    return regularServicesTotal;
  };

  const handleCustomDescriptionChange = (lineId: string, value: string) => {
    setCustomDescriptions({
      ...customDescriptions,
      [lineId]: value,
    });
  };

  const handleCustomPriceChange = (lineId: string, value: number) => {
    setCustomPrices({
      ...customPrices,
      [lineId]: value,
    });
    // Also update the selected service price
    setSelectedServices(
      selectedServices.map((s) =>
        s.line_id === lineId ? { ...s, price: value } : s,
      ),
    );
  };

  const handleAddCustomDevelopmentLine = (service: Service) => {
    const lineId = createLineId(service.id);
    const defaultPrice =
      service.name === "Custom Development" ? 10000 : service.price;

    const newSelectedServices: SelectedService[] = [
      ...selectedServices,
      {
        line_id: lineId,
        service_id: service.id,
        quantity: 1,
        price: defaultPrice,
        discount_percentage: 0,
      },
    ];

    setSelectedServices(newSelectedServices);

    if (service.name === "Custom Development") {
      setCustomPrices({
        ...customPrices,
        [lineId]: defaultPrice,
      });
    }
  };

  const handleRemoveCustomDevelopmentLine = (lineId: string) => {
    const newSelectedServices = selectedServices.filter(
      (s) => s.line_id !== lineId,
    );
    setSelectedServices(newSelectedServices);

    const newCustomDescriptions = { ...customDescriptions };
    const newCustomPrices = { ...customPrices };
    delete newCustomDescriptions[lineId];
    delete newCustomPrices[lineId];
    setCustomDescriptions(newCustomDescriptions);
    setCustomPrices(newCustomPrices);
  };

  const getServiceIcon = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service || !service.icon) return null;

    const IconComponent = (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string }>
      >
    )[service.icon];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  const groupServicesByCategory = (services: Service[]) => {
    const groups: Record<string, Service[]> = {};
    services.forEach((service) => {
      const group = service.group_type || "Other";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(service);
    });
    return groups;
  };

  const sortServiceGroups = (groups: Record<string, Service[]>) => {
    const groupOrder = ["Base", "Research", "Optional", "License"];
    return Object.entries(groups).sort(([a], [b]) => {
      const aIndex = groupOrder.indexOf(a);
      const bIndex = groupOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const groupedServices = groupServicesByCategory(services);
  const sortedGroupEntries = sortServiceGroups(groupedServices);

  const total = calculateTotal();
  const taxPct = Number(initialData.tax_percentage as number) || 0;
  const taxReason = (initialData.tax_reason as string) || "";
  const taxAmount = taxPct > 0 ? Math.round(total * (taxPct / 100)) : 0;
  const grandTotal = total + taxAmount;

  return (
    <div className="space-y-6">
      {/* Service Categories */}
      <div className="space-y-6">
        {sortedGroupEntries.map(([group, groupServices]) => {
          // Sort services within each category:
          // 1) Custom License
          // 2) Custom Development
          // 3) Others alphabetically
          const sortedServices = [...groupServices].sort((a, b) => {
            const orderMap: Record<string, number> = {
              "Custom License": 0,
              "Custom Development": 1,
            };
            const aOrder = orderMap[a.name] ?? 99;
            const bOrder = orderMap[b.name] ?? 99;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return a.name.localeCompare(b.name);
          });

          return (
            <div key={group} className="space-y-2">
              <h3 className="text-md font-medium">{group}</h3>
              <div className="grid grid-cols-1 gap-2">
                {sortedServices.map((service) => {
                  const isSelected = selectedServices.some(
                    (s) => s.service_id === service.id,
                  );
                  const selectedService = selectedServices.find(
                    (s) => s.service_id === service.id,
                  );
                  const isCustomDevelopment =
                    service.name === "Custom Development";
                  const isCustomLicense = service.name === "Custom License";
                  const customDevelopmentLines = selectedServices.filter(
                    (s) => s.service_id === service.id,
                  );

                  const customDevelopmentTotalPrice =
                    isCustomDevelopment
                      ? customDevelopmentLines.reduce((sum, line) => {
                          const effectivePrice =
                            customPrices[line.line_id] ?? line.price ?? 0;
                          return sum + effectivePrice;
                        }, 0)
                      : 0;

                  const customLicensePrice =
                    isCustomLicense && selectedService
                      ? customPrices[selectedService.line_id] ??
                        selectedService.price ??
                        service.price
                      : undefined;

                  return (
                    <div
                      key={service.id}
                      className={`p-3 rounded-lg transition-colors duration-200 ${
                        isSelected
                          ? "bg-white dark:bg-[var(--card)] shadow-sm border border-[var(--accent-color)]"
                          : "bg-transparent dark:bg-transparent shadow-sm hover:bg-white/10 dark:hover:bg-[var(--card)]/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => handleServiceToggle(service)}
                            disabled={isFinalized}
                            className={`p-1.5 rounded transition-colors duration-200 ${
                              isSelected
                                ? "bg-[var(--accent-color)] text-[var(--foreground)]"
                                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                            }`}
                          >
                            {isSelected ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex items-center space-x-2">
                            <div className={!isSelected ? "opacity-50" : ""}>
                              {getServiceIcon(service.id)}
                            </div>
                            <span
                              className={`font-medium ${
                                !isSelected
                                  ? "text-[var(--muted-foreground)]"
                                  : ""
                              }`}
                            >
                              {service.name}
                            </span>
                            {/* Recurring/Multiple pills removed as requested */}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-medium ${
                              !isSelected
                                ? "text-[var(--muted-foreground)]"
                                : ""
                            }`}
                          >
                            {isCustomDevelopment && isSelected
                              ? `€${Math.round(
                                  customDevelopmentTotalPrice || service.price,
                                ).toLocaleString()}`
                              : isCustomLicense && isSelected
                                ? `€${Math.round(
                                    customLicensePrice ?? service.price,
                                  ).toLocaleString()}`
                                : `€${Math.round(
                                    service.price,
                                  ).toLocaleString()}`}
                          </div>
                          {service.is_recurring && (
                            <div
                              className={`text-xs text-neutral-500 ${
                                !isSelected ? "opacity-50" : ""
                              }`}
                            >
                              per year
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <>
                          {service.allow_multiple && selectedService && (
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <span className="text-xs text-neutral-500">
                                Quantity:
                              </span>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      service.id,
                                      selectedService.quantity - 1,
                                    )
                                  }
                                  disabled={
                                    isFinalized || selectedService.quantity <= 1
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium min-w-[20px] text-center">
                                  {selectedService.quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      service.id,
                                      selectedService.quantity + 1,
                                    )
                                  }
                                  disabled={isFinalized}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Custom Development: Editable description and price (multiple lines) */}
                          {isCustomDevelopment && (
                            <div className="mt-3 space-y-4 pt-3 border-t">
                              {customDevelopmentLines.map((line, index) => (
                                <div
                                  key={line.line_id}
                                  className="space-y-3 rounded-md border border-dashed border-[var(--border)] p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                      Custom development line {index + 1}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      disabled={isFinalized}
                                      onClick={() =>
                                        handleRemoveCustomDevelopmentLine(
                                          line.line_id,
                                        )
                                      }
                                      className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    <label
                                      htmlFor={`custom-description-${line.line_id}`}
                                      className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                                    >
                                      Service Description
                                    </label>
                                    <Textarea
                                      id={`custom-description-${line.line_id}`}
                                      value={
                                        customDescriptions[line.line_id] || ""
                                      }
                                      onChange={(e) =>
                                        handleCustomDescriptionChange(
                                          line.line_id,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Enter custom service description for this offer..."
                                      disabled={isFinalized}
                                      className="min-h-[100px] text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label
                                      htmlFor={`custom-price-${line.line_id}`}
                                      className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                                    >
                                      Price (€)
                                    </label>
                                    <Input
                                      id={`custom-price-${line.line_id}`}
                                      type="number"
                                      value={
                                        customPrices[line.line_id] !==
                                        undefined
                                          ? customPrices[line.line_id]
                                          : line.price || 10000
                                      }
                                      onChange={(e) => {
                                        const newPrice =
                                          parseFloat(e.target.value) || 0;
                                        handleCustomPriceChange(
                                          line.line_id,
                                          newPrice,
                                        );
                                      }}
                                      disabled={isFinalized}
                                      className="text-sm"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                </div>
                              ))}

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isFinalized}
                                onClick={() =>
                                  handleAddCustomDevelopmentLine(service)
                                }
                                className="h-8 text-xs"
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Add another Custom Development line
                              </Button>
                            </div>
                          )}

                          {/* Custom License: single editable description and price */}
                          {isCustomLicense && selectedService && (
                            <div className="mt-3 space-y-4 pt-3 border-t">
                              <div className="space-y-2">
                                <label
                                  htmlFor={`custom-license-description-${selectedService.line_id}`}
                                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                                >
                                  License Description
                                </label>
                                <Textarea
                                  id={`custom-license-description-${selectedService.line_id}`}
                                  value={
                                    customDescriptions[selectedService.line_id] ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleCustomDescriptionChange(
                                      selectedService.line_id,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Enter custom license description for this offer..."
                                  disabled={isFinalized}
                                  className="min-h-[80px] text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <label
                                  htmlFor={`custom-license-price-${selectedService.line_id}`}
                                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                                >
                                  Recurring price (€ / year)
                                </label>
                                <Input
                                  id={`custom-license-price-${selectedService.line_id}`}
                                  type="number"
                                  value={
                                    customPrices[selectedService.line_id] !==
                                    undefined
                                      ? customPrices[selectedService.line_id]
                                      : selectedService.price || service.price
                                  }
                                  onChange={(e) => {
                                    const newPrice =
                                      parseFloat(e.target.value) || 0;
                                    handleCustomPriceChange(
                                      selectedService.line_id,
                                      newPrice,
                                    );
                                  }}
                                  disabled={isFinalized}
                                  className="text-sm"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          )}

                          {/* Service description rendered as Markdown (hide for Custom Development and Custom License) */}
                          {service.description &&
                            !isCustomPricedServiceName(service.name) && (
                              <div className="mt-2 text-[0.68rem] leading-tight text-neutral-700 dark:text-neutral-300">
                                <pre className="whitespace-pre-wrap font-sans text-inherit">
                                    {String(service.description)}
                                </pre>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      {selectedServices.length > 0 && (
        <Card className="border-[var(--border)] bg-white dark:bg-[var(--card)]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total</span>
              <div className="text-right">
                <div className="text-xl font-bold">
                  €{Math.round(total).toLocaleString()}
                </div>
                {Number(initialData.global_discount_percentage) > 0 && (
                  <div className="text-xs text-[var(--muted-foreground)]">
                    Includes global discount{" "}
                    {String(initialData.global_discount_percentage)}%
                  </div>
                )}
              </div>
            </div>
            {/* Display-only tax and grand total */}
            {taxPct > 0 && (
              <div className="mt-3">
                <div className="flex justify-between items-center text-sm text-[var(--muted-foreground)]">
                  <span>
                    Tax ({taxPct}%)
                    {taxReason ? ` • ${taxReason}` : ""}
                  </span>
                  <span>€{Math.round(taxAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t font-semibold">
                  <span>Grand total</span>
                  <span>€{Math.round(grandTotal).toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default OfferServicesForm;
