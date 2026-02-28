"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReactNode } from "react";

interface ServerActionFormProps {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  entityName: string;
  backLink: string;
  className?: string;
}

export function ServerActionForm({
  action,
  children,
  entityName,
  backLink,
  className,
}: ServerActionFormProps) {
  const router = useRouter();

  async function handleAction(formData: FormData) {
    try {
      await action(formData);
      toast.success(`${entityName} updated successfully`);
      router.push(backLink);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred while saving";
      toast.error(errorMessage);
    }
  }

  return (
    <form action={handleAction} className={className}>
      {children}
    </form>
  );
}

