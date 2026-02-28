"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-[var(--background)] group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toast]:bg-green-100 dark:group-[.toast]:bg-green-800 group-[.toast]:text-green-600 dark:group-[.toast]:text-green-200 group-[.toast]:border-green-200",
          error:
            "group-[.toast]:bg-red-100 dark:group-[.toast]:bg-red-800 group-[.toast]:text-red-600 dark:group-[.toast]:text-red-200 group-[.toast]:border-red-200",
          info: "group-[.toast]:bg-blue-100 dark:group-[.toast]:bg-blue-800 group-[.toast]:text-blue-600 dark:group-[.toast]:text-blue-200 group-[.toast]:border-blue-200",
          warning:
            "group-[.toast]:bg-yellow-100 dark:group-[.toast]:bg-yellow-800 group-[.toast]:text-yellow-600 dark:group-[.toast]:text-yellow-200 group-[.toast]:border-yellow-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
