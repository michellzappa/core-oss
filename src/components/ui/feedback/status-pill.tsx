import { Badge } from "@/components/ui/primitives/badge";

interface StatusPillProps {
  value: string;
  type:
    | "lead-status"
    | "offer-status"
    | "project-status"
    | "service-group"
    | "service-category"
    | "service-type"
    | "service-public"
    | "task-status"
    | "interaction-type"
    | "token-status"
    | "readiness-score";
  className?: string;
}

export function StatusPill({ value, type, className }: StatusPillProps) {
  const getVariant = (value: string, type: string): string => {
    const normalizedValue = value.toLowerCase().replace(/\s+/g, "-");

    switch (type) {
      case "lead-status":
        // Ensure light, non-white background for leads
        return "lead";

      case "offer-status":
        switch (normalizedValue) {
          case "draft":
            return "draft";
          case "sent":
            return "sent";
          default:
            return "secondary";
        }

      case "project-status":
        switch (normalizedValue) {
          case "planning":
            return "planning";
          case "in-progress":
            return "in-progress";
          case "review":
            return "review";
          case "completed":
            return "completed";
          case "on-hold":
            return "on-hold";
          case "cancelled":
            return "cancelled";
          case "archived":
            return "archived";
          default:
            return "secondary";
        }

      case "service-group":
        switch (normalizedValue) {
          case "base":
            return "base";
          case "research":
            return "research";
          case "optional":
            return "optional";
          case "license":
            return "license";
          default:
            return "secondary";
        }

      case "service-category":
        switch (normalizedValue) {
          case "visualization":
            return "service-category-visualization";
          case "architecture":
            return "service-category-architecture";
          case "signals":
            return "service-category-signals";
          default:
            return "secondary";
        }

      case "service-type":
        switch (normalizedValue) {
          case "recurring":
            return "service-recurring";
          case "one-time":
            return "service-one-time";
          default:
            return "service-one-time";
        }

      case "service-public":
        switch (normalizedValue) {
          case "yes":
            return "service-public";
          case "no":
            return "service-private";
          default:
            return "service-private";
        }

      case "task-status":
        switch (normalizedValue) {
          case "pending":
            return "pending";
          case "in-progress":
            return "in-progress";
          case "completed":
            return "completed";
          case "cancelled":
            return "cancelled";
          default:
            return "secondary";
        }

      case "interaction-type":
        switch (normalizedValue) {
          case "email":
            return "email";
          case "call":
            return "call";
          case "meeting":
            return "meeting";
          case "message":
            return "message";
          case "note":
            return "note";
          case "web":
            return "web";
          default:
            return "secondary";
        }

      case "token-status":
        switch (normalizedValue) {
          case "active":
            return "token-active";
          case "expired":
            return "token-expired";
          default:
            return "secondary";
        }

      case "readiness-score":
        switch (normalizedValue) {
          case "high":
            return "high";
          case "mid":
            return "medium";
          case "low":
            return "low";
          default:
            return "secondary";
        }

      default:
        return "secondary";
    }
  };

  const formatValue = (value: string, type: string): string => {
    // Capitalize for specific types
    if (
      type === "offer-status" ||
      type === "task-status" ||
      type === "interaction-type"
    ) {
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
    if (type === "service-category") {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  };

  return (
    <Badge
      variant={
        getVariant(value, type) as
          | "default"
          | "secondary"
          | "destructive"
          | "outline"
          | "pending"
          | "in-progress"
          | "completed"
          | "cancelled"
          | "draft"
          | "sent"
          | "planning"
          | "review"
          | "on-hold"
          | "archived"
          | "base"
          | "research"
          | "optional"
          | "license"
          | "service-category-visualization"
          | "service-category-architecture"
          | "service-category-signals"
          | "service-recurring"
          | "service-one-time"
          | "service-public"
          | "service-private"
          | "low"
          | "medium"
          | "high"
          | "urgent"
          | "email"
          | "call"
          | "meeting"
          | "message"
          | "note"
          | "web"
          | "token-active"
          | "token-expired"
      }
      className={className}
    >
      {formatValue(value, type)}
    </Badge>
  );
}
