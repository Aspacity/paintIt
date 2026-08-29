"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";

export default function ClientGroupDashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Core exploratory features navigation links list
  const coreNavigationTabs = [
    { name: "Design Hub", path: "/hub", icon: "🏠" },
    { name: "Explore Painters", path: "/search/painters", icon: "🔍" },
    { name: "3D Room Designs", path: "/search/designs", icon: "🎨" },
  ];

  // Dedicated single node configuration reference for profile settings
  const profileTab = { name: "My Profile", path: "/profile-page", icon: "👤" };

  // Mobile navigation combines all paths seamlessly to populate the bottom floating dock bar
  const mobileNavigationTabs = [...coreNavigationTabs, profileTab];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>

      {/* ========================================================== */}
      {/* 🖥️ DESKTOP SIDEBAR NAVIGATION FRAME                          */}
      {/* ========================================================== */}
      <aside className={`hidden md:flex flex-col w-64 border-r p-5 shrink-0 justify-between transition-colors ${
        isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
      }`}>

        {/* Top Section: Branding Identity & Exploratory Links */}
        <div className="space-y-6">
          {/* Platform Identity Branding */}
          <div className="px-2 pt-1 flex items-center justify-between">
            <Logo size="sm" subtitle="Client Portal" textColor={isDark ? "text-white" : "text-stone-900"} />
          </div>

          {/* Main Core Links Stack */}
          <nav className="space-y-1">
            {coreNavigationTabs.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-[#FF8C38] text-black shadow-md"
                      : isDark
                      ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Container Section */}
        <div className={`border-t pt-4 space-y-2 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? "bg-neutral-900 border-neutral-800 text-amber-300 hover:bg-neutral-800"
                : "bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{isDark ? "🌙" : "☀️"}</span>
              <span>{isDark ? "Dark Theme" : "Light Theme"}</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF8C38]">Switch</span>
          </button>

          {/* Profile Action Link */}
          <Link
            href={profileTab.path}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              pathname === profileTab.path
                ? "bg-[#FF8C38] text-black shadow-md"
                : isDark
                ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <span className="text-sm">{profileTab.icon}</span>
            {profileTab.name}
          </Link>

          {/* Log Out Button */}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <span>🚪</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* ========================================================== */}
      {/* 📱 MOBILE TOP HEADER CONTROLLER PANEL                      */}
      {/* ========================================================== */}
      <header className={`md:hidden w-full border-b px-4 py-3 flex items-center justify-between z-40 ${
        isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
      }`}>
        <Logo size="sm" subtitle="Hub" textColor={isDark ? "text-white" : "text-stone-900"} />

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
            type="button"
            onClick={logout}
            className="text-[10px] font-bold uppercase tracking-wider text-red-500 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            Exit
          </button>
        </div>
      </header>

      {/* ========================================================== */}
      {/* 🚀 CENTRAL OPERATIONAL VIEW DISPLAY CANVAS                 */}
      {/* ========================================================== */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-5xl w-full mx-auto">
        {children}
      </main>

      {/* ========================================================== */}
      {/* 📱 MOBILE FLOATING BOTTOM FLOATING DOCK                    */}
      {/* ========================================================== */}
      <nav className={`md:hidden fixed bottom-4 left-4 right-4 h-16 backdrop-blur-md border rounded-2xl flex items-center justify-around px-2 z-40 shadow-2xl ${
        isDark ? "bg-neutral-950/90 border-neutral-900 text-white" : "bg-white/90 border-stone-300 text-stone-900"
      }`}>
        {mobileNavigationTabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
                isActive
                  ? "text-[#FF8C38] font-bold scale-105"
                  : isDark
                  ? "text-neutral-500"
                  : "text-stone-400"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5 text-center truncate max-w-full px-0.5">
                {tab.name.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}