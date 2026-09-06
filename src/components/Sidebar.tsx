import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  Briefcase,
  Upload,
  Network,
  AlertTriangle,
  FileSearch,
  Clock,
  Map,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/app/cases", icon: Briefcase, label: "Cases" },
  { to: "/app/upload", icon: Upload, label: "Data Upload" },
  { to: "/app/network", icon: Network, label: "Network" },
  { to: "/app/alerts", icon: AlertTriangle, label: "Alerts" },
  { to: "/app/evidence", icon: FileSearch, label: "Evidence" },
  { to: "/app/timeline", icon: Clock, label: "Timeline" },
  { to: "/app/map", icon: Map, label: "Map" },
  { to: "/app/reports", icon: FileText, label: "Reports" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function handleToggle() {
      setMobileOpen(true);
    }
    window.addEventListener("toggle-mobile-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-mobile-sidebar", handleToggle);
  }, []);

  const nav = (
    <nav className="flex-1 space-y-0.5 px-2 py-3">
      {navItems.map((item) => {
        const active = item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
              active ? "bg-white/[0.08] text-cyan-300" : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
            }`}
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3 z-50 flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 text-white/40 lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-white/[0.06] bg-[#0e0f14] transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          <div className="flex items-center gap-2.5">
            <Shield className="size-5 shrink-0 text-cyan-400" />
            <span className="text-sm font-semibold tracking-tight text-white/90">CNA System</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-white/30 hover:text-white/60"><X className="size-4" /></button>
        </div>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`relative hidden h-full flex-col border-r border-white/[0.06] bg-[#0e0f14] transition-all duration-200 lg:flex ${collapsed ? "w-16" : "w-56"}`}>
        <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-4">
          <Shield className="size-5 shrink-0 text-cyan-400" />
          {!collapsed && <span className="text-sm font-semibold tracking-tight text-white/90">CNA System</span>}
        </div>
        {nav}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex h-10 items-center justify-center border-t border-white/[0.06] text-white/30 transition-colors hover:text-white/60"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </aside>
    </>
  );
}
