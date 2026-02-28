import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/primitives/card";
import { Button } from "@/components/ui/primitives/button";
import { Plus } from "lucide-react";

interface LinkedDataProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onAddNew?: () => void;
  addButtonText?: string;
  isLoading?: boolean;
}

export default function LinkedData({
  title,
  subtitle,
  children,
  onAddNew,
  addButtonText = "Add New",
  isLoading = false,
}: LinkedDataProps) {
  return (
    <Card className="bg-white dark:bg-[var(--card)] minimal-shadow minimal-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {onAddNew && (
          <Button
            onClick={onAddNew}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {addButtonText}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function LinkedDataEmptyState({
  title,
  description,
  actionText,
  onAction,
}: {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-8">
      <div className="text-neutral-400 mb-4">
        <svg
          className="mx-auto h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 mb-4">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}
