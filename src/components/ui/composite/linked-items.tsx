import { useState } from "react";
import type { ComponentType } from "react";
import { Link2, Link2Off, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/primitives/card";
import { Badge } from "@/components/ui/primitives/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/navigation";

export interface LinkedItem {
  id: string;
  name: string;
  href: string;
  status?: string; // deprecated in UI rendering; prefer `tag`
  subtitle?: string;
  tag?: string;
}

export interface LinkedItemsConfig {
  title: string;
  items: LinkedItem[];
  createNewHref: string;
  createNewLabel: string;
  emptyMessage: string;
  isLoading?: boolean;
  icon?: ComponentType<{ className?: string }>;
  onRemove?: (item: LinkedItem) => Promise<void>;
  getRemoveConfirmation?: (item: LinkedItem) => string;
  /** Optional "Link existing" action: label and callback (e.g. open a picker dialog). */
  linkExistingLabel?: string;
  onLinkExisting?: () => void;
}

interface LinkedItemsProps {
  config: LinkedItemsConfig;
  className?: string;
}

export default function LinkedItems({ config, className }: LinkedItemsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const router = useRouter();
  const [pendingRemoveItem, setPendingRemoveItem] = useState<LinkedItem | null>(
    null,
  );

  const handleCreateNew = () => {
    setIsLoading(true);
    // The actual navigation will be handled by the Link component
  };

  const handleItemClick = (item: LinkedItem) => {
    router.push(item.href);
  };

  const handleRemove = async (item: LinkedItem) => {
    if (!config.onRemove) {
      return;
    }
    try {
      setRemovingId(item.id);
      await config.onRemove(item);
    } catch (error) {
      console.error("Failed to remove linked item:", error);
    } finally {
      setRemovingId(null);
    }
  };

  // If loading, show collapsed card with loading state
  if (config.isLoading) {
    return (
      <Card
        className={`${className} bg-white dark:bg-[var(--card)] minimal-shadow minimal-border`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium flex items-center">
            {config.icon && (
              <config.icon className="mr-2 h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            )}
            {config.title}
          </CardTitle>
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-900 dark:border-neutral-100 mr-2"></div>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // If no items, show collapsed card with only the add button
  if (config.items.length === 0) {
    return (
      <Card
        className={`${className} bg-white dark:bg-[var(--card)] minimal-shadow minimal-border`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium flex items-center">
            {config.icon && (
              <config.icon className="mr-2 h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            )}
            {config.title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {config.linkExistingLabel && config.onLinkExisting && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={config.onLinkExisting}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            )}
            {config.createNewHref && config.createNewHref.trim() !== "" && (
              <Button
                asChild
                size="sm"
                onClick={handleCreateNew}
                disabled={isLoading}
              >
                <Link href={config.createNewHref}>
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  }

  // If has items, show full card
  return (
    <>
      <Card
        className={`${className} bg-white dark:bg-[var(--card)] minimal-shadow minimal-border`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium flex items-center">
            {config.icon && (
              <config.icon className="mr-2 h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            )}
            {config.title}
            <Badge
              variant="secondary"
              className="ml-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              {config.items.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            {config.linkExistingLabel && config.onLinkExisting && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={config.onLinkExisting}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            )}
            {config.createNewHref && config.createNewHref.trim() !== "" && (
              <Button
                asChild
                size="sm"
                onClick={handleCreateNew}
                disabled={isLoading}
              >
                <Link href={config.createNewHref}>
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {config.items.map((item) => (
              <button
                type="button"
                key={item.id}
                className="group relative w-full cursor-pointer rounded-lg border border-[rgba(var(--border-rgb),0.7)] bg-background p-3 text-left transition-colors duration-200"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex min-w-0 flex-col pr-8">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline truncate">
                      {item.name}
                    </span>
                  </div>
                  {item.tag && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {item.tag}
                    </div>
                  )}
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                {config.onRemove && (
                  <span className="absolute top-2 right-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 border border-transparent text-muted-foreground opacity-70 transition-colors hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive/60 group-hover:opacity-100"
                      disabled={removingId === item.id}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setPendingRemoveItem(item);
                      }}
                    >
                      {removingId === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Link2Off className="h-3 w-3" />
                      )}
                    </Button>
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      {config.onRemove && (
        <ConfirmDialog
          open={!!pendingRemoveItem}
          title="Remove linked item?"
          description={
            pendingRemoveItem
              ? (config.getRemoveConfirmation?.(pendingRemoveItem) ??
                `Remove ${pendingRemoveItem.name}?`)
              : undefined
          }
          confirmLabel="Remove"
          isDestructive={false}
          onConfirm={
            pendingRemoveItem ? () => handleRemove(pendingRemoveItem) : () => {}
          }
          onOpenChange={(open) => {
            if (!open) {
              setPendingRemoveItem(null);
            }
          }}
        />
      )}
    </>
  );
}
