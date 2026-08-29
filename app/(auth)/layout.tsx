"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function AuthenticationLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen font-sans flex flex-col items-center justify-center relative p-4 overflow-x-hidden transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      {/* Top Floating Theme Switcher Control */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full border transition-all flex items-center gap-1.5 px-3 text-xs font-semibold shadow-xs ${
            isDark
              ? "bg-neutral-900 border-neutral-700 text-amber-300 hover:bg-neutral-800"
              : "bg-stone-200/80 border-stone-300 text-stone-800 hover:bg-stone-200"
          }`}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          aria-label="Toggle Global Theme"
        >
          <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
          <span>{isDark ? "Dark" : "Light"}</span>
        </button>
      </div>

      {/* Ambient Radial Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-96 rounded-full blur-[140px] pointer-events-none ${
        isDark ? "bg-[#FF8C38]/15" : "bg-[#FF8C38]/10"
      }`} />

      {/* Shared Header Context Brand Mark */}
      <div className="mb-5 text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#FF8C38] text-black flex items-center justify-center font-bold text-sm tracking-widest shadow-sm group-hover:scale-105 transition-transform">
            P
          </div>
          <span className={`font-bold text-2xl tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            PaintIT<span className="text-[#FF8C38]">.</span> <span className="text-xs font-semibold uppercase tracking-widest text-[#FF8C38]">Studio OS</span>
          </span>
        </Link>
      </div>

      {/* Main Structural Authorization Card Viewport */}
      <main className={`w-full max-w-md relative z-10 border rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-stone-200"
      }`}>
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#FF8C38]" />
        <div className="p-6 sm:p-7">
          {children}
        </div>
      </main>

      {/* Global Minimalist Footer */}
      <footer className={`mt-6 text-[10px] font-medium tracking-widest uppercase select-none z-10 ${
        isDark ? "text-neutral-500" : "text-stone-400"
      }`}>
        Secure Auth Protocol • PaintIT Studio Engine
      </footer>
    </div>
  );
}