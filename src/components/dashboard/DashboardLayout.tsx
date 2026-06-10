import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import NotificationBell from "./NotificationBell";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="dashboard-shell min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 h-14 flex items-center justify-between border-b border-white/60 px-3 sm:px-6 bg-white/70 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_16px_-8px_rgba(30,64,175,0.1)]">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="shrink-0 h-8 w-8 text-foreground/60 hover:text-foreground hover:bg-[hsl(var(--blue-ice))]" />
              {!isMobile && (
                <div className="h-4 w-px bg-border mx-1" />
              )}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--neon-green))] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--neon-green))] dash-pulse-dot" />
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground/60">Console</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <NotificationBell />
            </div>
          </header>

          {/* Main content */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
