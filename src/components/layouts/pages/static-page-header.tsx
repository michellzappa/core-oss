import React, { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/primitives/button";
import { ArrowLeft } from "lucide-react";
import { RouteBreadcrumb } from "./route-breadcrumb";

interface PageHeaderProps {
  title?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  backLink?: string;
  avatar?: ReactNode;
  count?: number;
}

export function StaticPageHeader({
  title,
  subtitle,
  actions,
  children,
  backLink,
  avatar,
  count,
}: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <RouteBreadcrumb />
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {backLink && (
            <Link href={backLink}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-3">
            {avatar && avatar}
            <div>
              {title && (
                <h1 className="text-2xl font-bold tracking-tight">
                  {title}
                  {typeof count === "number" && (
                    <span className="ml-2 text-lg font-bold text-gray-500 dark:text-gray-400">
                      {count.toLocaleString()}
                    </span>
                  )}
                </h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {children}
    </div>
  );
}
