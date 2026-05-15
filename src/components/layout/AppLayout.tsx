import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Outlet } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/shared/PWAUpdatePrompt";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <OfflineBanner />
          <AppHeader />
          <main className="flex-1 overflow-auto bg-background">
            <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
      </div>
    </SidebarProvider>
  );
}

