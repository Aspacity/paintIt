"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";

export default function ClientGroupDashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Core exploratory features navigation links list
  const coreNavigationTabs = [
    { name: "Homeowner Hub", shortName: "Hub", path: "/hub", icon: "🏠" },
    { name: "Explore Painters", shortName: "Painters", path: "/search/painters", icon: "🔍" },
    { name: "3D Room Designs", shortName: "3D Designs", path: "/search/designs", icon: "🎨" },
    { name: "My Profile", shortName: "Profile", path: "/profile-page", icon: "👤" },
  ];

  const targetName = user?.fullName || user?.full_name || "Homeowner";
  const displayFirstName = targetName.trim().split(" ")[0];
  const nameInitial = targetName.trim().charAt(0).toUpperCase() || "H";

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>

      {/* MOBILE TOP HEADER BAR */}
      <header className={`md:hidden w-full border-b px-4 py-3 flex items-center justify-between z-40 sticky top-0 ${
        isDark ? "bg-black/90 border-neutral-900 text-white" : "bg-white/90 border-stone-200 text-stone-900"
      }`}>
        <Logo size="sm" subtitle="Client" textColor={isDark ? "text-white" : "text-stone-900"} />

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border text-xs font-bold ${
              isDark ? "bg-neutral-900 border-neutral-800 text-amber-300" : "bg-stone-100 border-stone-300 text-stone-800"
            }`}
            title="Toggle Theme"
          >
            {isDark ? "🌙" : "☀️"}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`p-2 rounded-xl text-xs font-bold border transition-all ${
              isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-stone-100 border-stone-300 text-stone-900"
            }`}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* DESKTOP & SLIDING MOBILE SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 p-4 shrink-0 flex flex-col justify-between border-r transition-all duration-300 ease-in-out ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        } ${
          isMobileOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Top Section: Identity & Navigation */}
        <div className="space-y-6">
          {/* Header Brand & Desktop Collapse Toggle */}
          <div className="flex items-center justify-between pt-1">
            {!isCollapsed ? (
              <Logo size="sm" subtitle="Homeowner Hub" textColor={isDark ? "text-white" : "text-stone-900"} />
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
            {isMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden text-xs font-bold uppercase text-stone-400 hover:text-stone-900"
              >
                ✕ Close
              </button>
            )}
          </div>

          {/* User Info Badge */}
          {!isCollapsed && (
            <div className={`p-3 border rounded-2xl flex items-center gap-3 shadow-xs ${
              isDark ? "bg-neutral-900 border-neutral-850" : "bg-[#FAF8F5] border-stone-200"
            }`}>
              <div className="w-9 h-9 rounded-xl bg-[#FF8C38] text-black font-bold text-sm flex items-center justify-center shrink-0">
                {nameInitial}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-stone-900"}`}>{displayFirstName}</h4>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF8C38]">🏡 Homeowner</span>
              </div>
            </div>
          )}

          {/* Core Navigation Links */}
          <nav className="space-y-1.5">
            {coreNavigationTabs.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    isActive
                      ? "bg-[#FF8C38] text-black border-[#FF8C38] shadow-md font-extrabold"
                      : isDark
                      ? "text-neutral-400 hover:bg-neutral-900 hover:text-white border-transparent"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 border-transparent"
                  }`}
                  title={tab.name}
                >
                  <span className="text-sm shrink-0">{tab.icon}</span>
                  {!isCollapsed && <span className="truncate">{tab.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Theme Switcher & Logout */}
        <div className={`border-t pt-4 space-y-2 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              isDark
                ? "bg-neutral-900 border-neutral-800 text-amber-300 hover:bg-neutral-800"
                : "bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{isDark ? "🌙" : "☀️"}</span>
              {!isCollapsed && <span>{isDark ? "Dark Mode" : "Light Mode"}</span>}
            </span>
            {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF8C38]">Toggle</span>}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-xl transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Log Out"
          >
            <span className="text-sm">🚪</span>
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT DISPLAY AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-12 max-w-5xl w-full mx-auto">
        {children}
      </main>

    </div>
  );
}