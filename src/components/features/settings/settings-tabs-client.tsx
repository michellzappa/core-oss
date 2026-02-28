"use client";

import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/primitives/tabs";

interface SettingsTabsClientProps {
  active:
    | "corporate-entities"
    | "users"
    | "payment-terms"
    | "delivery-conditions"
    | "offer-links";
}

export default function SettingsTabsClient({
  active,
}: SettingsTabsClientProps) {
  const router = useRouter();
  const tabs: Array<{ value: SettingsTabsClientProps["active"]; label: string }> =
    [
      { value: "corporate-entities", label: "Corporate Entities" },
      { value: "users", label: "Users" },
      { value: "payment-terms", label: "Payment Terms" },
      { value: "delivery-conditions", label: "Delivery Conditions" },
      { value: "offer-links", label: "Offer Links" },
    ];

  return (
    <div className="border-b border-[var(--border)] pb-3">
      <Tabs
        value={active}
        onValueChange={(value) =>
          router.push(
            `/dashboard/settings?tab=${encodeURIComponent(
              value as SettingsTabsClientProps["active"],
            )}`,
          )
        }
      >
        <TabsList className="h-auto flex w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 text-[var(--text-secondary)]">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-9 shrink-0 rounded-md border border-transparent px-3 py-2 data-[state=active]:border-[var(--border)] data-[state=active]:bg-white data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
