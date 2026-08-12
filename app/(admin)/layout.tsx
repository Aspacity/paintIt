"use client";

import React, { useState } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const navItems = [
    { name: "📊 Analytics Dashboard", short: "📊", path: "/admin/dashboard" },
    { name: "📣 Campaign Broadcasts", short: "📣", path: "/admin/campaigns" },
    { name: "🎨 3D Playground Catalog", short: "🎨", path: "/admin/playground" },
    { name: "🧱 3D Room Assembling", short: "🧱", path: "/admin/modular-sandbox" },
  ];

  return (
    <RoleGuard allowedRole="ADMIN">
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
        {/* Mobile Header Bar */}
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between z-50">
          <div>
            <h2 className="text-xs font-black tracking-widest uppercase text-emerald-400">PaintIT Studio</h2>
            <p className="text-[9px] font-mono text-neutral-500 uppercase">Master Admin</p>
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold"
          >
            {isMobileOpen ? "✕ Close" : "☰ Menu"}
          </button>
        </div>

        {/* Admin Navigation Sidebar (Desktop Collapsible & Mobile Toggleable) */}
        <aside
          className={`bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between shrink-0 transition-all duration-300 ${
            isMobileOpen ? "block fixed inset-0 z-50 w-full" : "hidden md:flex"
          } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
        >
          <div>
            {/* Header Brand & Desktop Collapse Toggle */}
            <div className="p-4 sm:p-5 border-b border-neutral-800/60 flex items-center justify-between">
              {!isCollapsed ? (
                <div>
                  <h2 className="text-xs font-black tracking-[0.2em] uppercase text-emerald-400 truncate">PaintIT Studio</h2>
                  <p className="text-[9px] font-mono text-neutral-500 uppercase mt-0.5">Master Admin Hub</p>
                </div>
              ) : (
                <span className="text-sm font-black text-emerald-400 mx-auto">PI</span>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white items-center justify-center text-xs font-bold transition-all border border-neutral-750"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? "▶" : "◀"}
              </button>
            </div>

            {/* Nav Links */}
            <nav className="p-3 space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                      isActive
                        ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-850 border border-transparent"
                    }`}
                    title={item.name}
                  >
                    <span className="text-sm shrink-0">{item.short}</span>
                    {!isCollapsed && <span className="truncate">{item.name.replace(/^[^\s]+\s*/, "")}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Profile Footer */}
          <div className="p-3 border-t border-neutral-800/60 bg-neutral-950/40 flex items-center justify-between">
            {!isCollapsed && (
              <div className="truncate pr-2">
                <p className="text-[10px] font-black uppercase text-neutral-300 truncate">{user?.fullName || "Administrator"}</p>
                <p className="text-[9px] font-mono text-neutral-500 truncate">{user?.email}</p>
              </div>
            )}
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className={`py-1.5 bg-neutral-900 hover:bg-red-950/40 hover:text-red-400 border border-neutral-800 hover:border-red-900/50 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all shrink-0 ${
                isCollapsed ? "w-full text-center" : "px-2.5"
              }`}
              title="Log Out Admin"
            >
              {isCollapsed ? "🚪" : "Exit"}
            </button>
          </div>
        </aside>

        {/* Admin Main Viewport Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
