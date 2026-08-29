"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { QuickLeadPopup } from "@/components/analytics/QuickLeadPopup";
import Logo from "@/components/common/Logo";

export default function PublicMarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const params = useParams();

  const painterId = params?.id as string;

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      {/* Premium Public Header */}
      <header className={`w-full border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${
        isDark ? "bg-black/90 border-neutral-800" : "bg-[#FAF8F5]/90 border-stone-200"
      }`}>
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Logo size="md" textColor={isDark ? "text-white" : "text-stone-900"} />

          <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/search/painters"
              className={`transition-colors ${isDark ? "text-neutral-300 hover:text-[#FF8C38]" : "text-stone-600 hover:text-[#FF8C38]"}`}
            >
              Find Painters
            </Link>
            <Link
              href="/search/designs"
              className={`transition-colors ${isDark ? "text-neutral-300 hover:text-[#FF8C38]" : "text-stone-600 hover:text-[#FF8C38]"}`}
            >
              3D Designs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Global Theme Switcher Control */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-full border transition-all flex items-center gap-1.5 px-3 text-xs font-semibold ${
                isDark
                  ? "bg-neutral-900 border-neutral-700 text-amber-300 hover:bg-neutral-800"
                  : "bg-stone-200/80 border-stone-300 text-stone-800 hover:bg-stone-200"
              }`}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              aria-label="Toggle Global Theme"
            >
              <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
              <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href={user?.role === "PAINTER" ? "/dashboard" : "/hub"}
                  className="text-xs bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold px-3.5 py-2 rounded-xl transition-all shadow-md"
                >
                  Workspace
                </Link>
                <button
                  onClick={logout}
                  className={`text-xs font-semibold transition-colors ${
                    isDark ? "text-neutral-400 hover:text-red-400" : "text-stone-500 hover:text-red-500"
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold px-4 py-2 rounded-xl transition-all shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Embedded Viewport Frame Output Slot */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Quick Lead Capture Popup */}
      {painterId && <QuickLeadPopup painterId={painterId} />}
    </div>
  );
}