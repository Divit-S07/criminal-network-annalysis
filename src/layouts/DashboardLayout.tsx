import { Outlet, Navigate } from "react-router";
import { isAuthenticated } from "@/api";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardLayout() {
  const isMobile = useIsMobile();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b10]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {isMobile && (
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0e0f14] px-3 h-12">
            <span className="text-xs font-medium text-white/50">Investigation Dashboard</span>
            <button
              onClick={() => window.dispatchEvent(new Event("toggle-mobile-sidebar"))}
              className="flex items-center gap-1.5 rounded-md border border-white/[0.08] px-2 py-1 text-[11px] text-white/40 hover:text-white/60"
            >
              <span className="text-[10px] text-white/20">Menu</span>
            </button>
          </div>
        )}
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
