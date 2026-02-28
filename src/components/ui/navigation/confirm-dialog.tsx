"use client";

import * as React from "react";
import { Button } from "@/components/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/navigation/dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    if (isSubmitting || isLoading) return;
    const maybePromise = onConfirm();
    if (
      maybePromise &&
      typeof (maybePromise as Promise<unknown>).then === "function"
    ) {
      try {
        setIsSubmitting(true);
        await maybePromise;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-confirm-dialog-content
        aria-describedby={
          description ? "confirm-dialog-description" : undefined
        }
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription id="confirm-dialog-description">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            className={isDestructive ? "bg-red-600 text-white hover:bg-red-700" : undefined}
            onClick={handleConfirm}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? `${confirmLabel}…` : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
