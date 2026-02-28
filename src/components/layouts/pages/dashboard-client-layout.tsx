"use client";

import { PersistentLayout } from "../containers/persistent-layout";
import { SWRConfig } from "swr";
import { swrDefaultConfig } from "@/lib/swr-config";
import { PreloadRegistry } from "../containers/preload-registry";
import NewPageWrapper from "./new-page-wrapper";

interface DashboardClientLayoutProps {
  children: React.ReactNode;
}

/**
 * Client-side dashboard layout component
 * Wraps the dashboard content with the necessary providers
 * and the persistent layout to avoid flashes between page transitions
 */
export default function DashboardClientLayout({
  children,
}: DashboardClientLayoutProps) {
  return (
    <SWRConfig value={swrDefaultConfig}>
        <PreloadRegistry>
          <PersistentLayout>
            <NewPageWrapper>{children}</NewPageWrapper>
          </PersistentLayout>
        </PreloadRegistry>
    </SWRConfig>
  );
}
