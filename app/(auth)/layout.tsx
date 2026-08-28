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
    <div className={`min-h-screen font-sans flex flex-col items-center justify-center relative p-4 overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      {/* Top Floating Theme Switcher Control */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full border transition-all flex items-center gap-1.5 px-3 text-xs font-semibold ${
            isDark
              ? "bg-neutral-900 border-neutral-700 text-amber-300 hover:bg-neutral-800"
              : "bg-stone-200/70 border-stone-300 text-stone-800 hover:bg-stone-200"
          }`}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          aria-label="Toggle Global Theme"
        >
          <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
          <span>{isDark ? "Dark" : "Light"}</span>
        </button>
      </div>

      {/* Premium Ambient Background Accents */}
      <div className={`absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${
        isDark ? "bg-[#FF8C38]/10" : "bg-[#FF8C38]/15"
      }`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${
        isDark ? "bg-[#FF8C38]/10" : "bg-[#FF8C38]/15"
      }`} />

      {/* Shared Header Context Brand Mark */}
      <div className="mb-6 text-center animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#FF8C38] text-black flex items-center justify-center font-bold text-sm tracking-widest shadow-sm">
            P
          </div>
          <span className={`font-black text-2xl tracking-wider ${isDark ? "text-white" : "text-stone-900"}`}>
            PaintIT <span className="text-[#FF8C38] font-semibold text-sm tracking-tight">Studio OS</span>
          </span>
        </Link>
      </div>

      {/* Main Structural Authorization Card Viewport */}
      <main className={`w-full max-w-md relative z-10 border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-stone-300"
      }`}>
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#FF8C38]" />
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Global Minimalist System Guard Footer */}
      <footer className={`mt-8 text-[10px] font-medium tracking-widest uppercase select-none z-10 ${
        isDark ? "text-neutral-500" : "text-stone-500"
      }`}>
        Secure Handshake Protocol Enforced // PaintIT Core v2.0
      </footer>
    </div>
  );
}