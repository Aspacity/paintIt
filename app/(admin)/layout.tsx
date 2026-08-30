"use client";

import React, { useState } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/common/Logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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
      <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${
        isDark ? "bg-black text-neutral-100" : "bg-[#FAF8F5] text-stone-900"
      }`}>
        {/* Mobile Header Bar */}
        <div className={`md:hidden p-4 border-b flex items-center justify-between z-50 ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        }`}>
          <Logo size="sm" textColor={isDark ? "text-white" : "text-stone-900"} />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border text-xs font-bold ${
                isDark ? "bg-neutral-900 border-neutral-800 text-amber-300" : "bg-stone-100 border-stone-300 text-stone-800"
              }`}
            >
              {isDark ? "🌙" : "☀️"}
            </button>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`p-2 rounded-xl text-xs font-bold border ${
                isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-stone-100 border-stone-300 text-stone-900"
              }`}
            >
              {isMobileOpen ? "✕ Close" : "☰ Menu"}
            </button>
          </div>
        </div>

        {/* Admin Navigation Sidebar */}
        <aside
          className={`border-r flex flex-col justify-between shrink-0 transition-all duration-300 ${
            isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
          } ${
            isMobileOpen ? "block fixed inset-0 z-50 w-full" : "hidden md:flex"
          } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
        >
          <div>
            {/* Header Brand & Desktop Collapse Toggle */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isDark ? "border-neutral-900" : "border-stone-200"
            }`}>
              {!isCollapsed ? (
                <Logo size="sm" textColor={isDark ? "text-white" : "text-stone-900"} subtitle="Master Admin" />
              ) : (
                <span className="text-sm font-bold text-[#FF8C38] mx-auto">PI</span>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden md:flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold transition-all border ${
                  isDark ? "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white" : "bg-stone-100 border-stone-300 text-stone-600 hover:text-stone-900"
                }`}
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
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 border ${
                      isActive
                        ? "bg-[#FF8C38] text-black border-[#FF8C38] shadow-md font-extrabold"
                        : isDark
                        ? "text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-transparent"
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
          <div className={`p-3 border-t flex items-center justify-between ${
            isDark ? "border-neutral-900 bg-black/40" : "border-stone-200 bg-stone-50"
          }`}>
            {!isCollapsed && (
              <div className="truncate pr-2">
                <p className={`text-[10px] font-bold uppercase truncate ${isDark ? "text-neutral-300" : "text-stone-800"}`}>
                  {user?.fullName || "Administrator"}
                </p>
                <p className={`text-[9px] font-mono truncate ${isDark ? "text-neutral-500" : "text-stone-500"}`}>{user?.email}</p>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {!isCollapsed && (
                <button
                  onClick={toggleTheme}
                  className={`p-1.5 rounded-lg border text-xs font-bold ${
                    isDark ? "bg-neutral-900 border-neutral-800 text-amber-300" : "bg-stone-200 border-stone-300 text-stone-800"
                  }`}
                  title="Toggle Theme"
                >
                  {isDark ? "🌙" : "☀️"}
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className={`py-1.5 text-[9px] font-mono uppercase tracking-wider transition-all shrink-0 rounded-lg border ${
                  isDark
                    ? "bg-neutral-900 hover:bg-red-950/40 hover:text-red-400 border-neutral-800 text-neutral-400"
                    : "bg-stone-100 hover:bg-red-50 hover:text-red-600 border-stone-300 text-stone-600"
                } ${isCollapsed ? "w-full text-center" : "px-2.5"}`}
                title="Log Out Admin"
              >
                {isCollapsed ? "🚪" : "Exit"}
              </button>
            </div>
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
