"use client";

import { Button } from "@/components/ui/primitives/button";
import { Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockToggleProps {
  isLocked: boolean;
  onToggle: (locked: boolean) => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function LockToggle({
  isLocked,
  onToggle,
  className,
  size = "default",
}: LockToggleProps) {
  const handleToggle = () => {
    onToggle(!isLocked);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleToggle}
      className={cn("flex items-center gap-2 transition-colors", className)}
    >
      {isLocked ? (
        <>
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Locked</span>
        </>
      ) : (
        <>
          <Unlock className="h-4 w-4" />
          <span className="hidden sm:inline">Unlocked</span>
        </>
      )}
    </Button>
  );
}
