"use client";

import { Badge } from "@/components/ui/primitives/badge";

interface ContactCharacteristicsProps {
  characteristics: Record<string, boolean> | null;
  maxDisplay?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

export function ContactCharacteristics({
  characteristics,
  maxDisplay = 2,
  size = "md",
  showCount = true,
}: ContactCharacteristicsProps) {
  const getDisplayName = (key: string): string => {
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  if (!characteristics || Object.keys(characteristics).length === 0) {
    return <span className="text-[var(--muted-foreground)]">-</span>;
  }

  const activeCharacteristics = Object.entries(characteristics)
    .filter(([_, value]) => value === true)
    .map(([key, _]) => ({ key, displayName: getDisplayName(key) }));

  if (activeCharacteristics.length === 0) {
    return <span className="text-[var(--muted-foreground)]">-</span>;
  }

  const displayCharacteristics = activeCharacteristics.slice(0, maxDisplay);
  const remainingCount = activeCharacteristics.length - maxDisplay;

  const badgeSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-wrap gap-1">
      {displayCharacteristics.map(({ key, displayName }) => (
        <Badge
          key={key}
          variant="secondary"
          className={`${badgeSize} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}
        >
          {displayName}
        </Badge>
      ))}
      {showCount && remainingCount > 0 && (
        <span className={`${badgeSize} text-[var(--muted-foreground)]`}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
