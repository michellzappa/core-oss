import React, { ReactNode } from "react";
import { PageLayout } from "./page-layout";

interface DashboardPageWrapperProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  headerContent?: ReactNode;
  children: ReactNode;
}

/**
 * Consistent wrapper for the dashboard page
 * Uses the same header structure as other pages but without the card border
 */
export default function DashboardPageWrapper({
  title = "Dashboard",
  subtitle = "Welcome to Core",
  actions,
  headerContent,
  children,
}: DashboardPageWrapperProps) {
  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
      headerContent={headerContent}
      hideCard={true}
    >
      {children}
    </PageLayout>
  );
}
