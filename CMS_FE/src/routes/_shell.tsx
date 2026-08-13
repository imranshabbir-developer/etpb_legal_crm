import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardAtmosphere } from "@/components/dashboard-atmosphere";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Topbar } from "@/components/topbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  return (
    <SidebarProvider className="h-[100dvh] overflow-hidden">
      <div className="mobile-app-shell app-shell relative flex h-[100dvh] w-full overflow-hidden bg-dashboard-base">
        <DashboardAtmosphere />
        <AppSidebar />
        <div className="app-main-column relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="mobile-app-main app-main-scroll flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-3 sm:space-y-6 sm:p-4 md:p-6">
            <Outlet />
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
