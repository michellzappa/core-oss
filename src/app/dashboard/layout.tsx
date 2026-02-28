import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Sidebar from "@/components/layouts/navigation/sidebar";
import DashboardClientLayout from "@/components/layouts/pages/dashboard-client-layout";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/navigation/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <div className="bg-[var(--background)] w-full">
        <Sidebar userEmail={user.email ?? null} />
        <SidebarInset>
          <main
            id="main-content"
            className="flex-1 overflow-y-auto overflow-x-hidden pt-20 pb-4 px-4 sm:pt-6 sm:pb-6 sm:px-6 lg:p-8 min-w-0 bg-[var(--background)]"
          >
            <DashboardClientLayout>{children}</DashboardClientLayout>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
