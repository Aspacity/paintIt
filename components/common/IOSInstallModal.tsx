"use client";

import React from "react";
import { usePWAInstall } from "@/context/PWAContext";
import { useTheme } from "@/context/ThemeContext";

export default function IOSInstallModal() {
  const { showIOSModal, setShowIOSModal } = usePWAInstall();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!showIOSModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl space-y-5 relative ${
        isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-stone-200 text-stone-900"
      }`}>
        {/* Close Button */}
        <button
          onClick={() => setShowIOSModal(false)}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-xs font-bold transition-all"
        >
          ✕
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FF8C38]/20 border border-[#FF8C38]/40 flex items-center justify-center text-2xl mx-auto">
            📲
          </div>

          <h3 className="text-lg font-bold">Install PaintIT on iOS</h3>
          <p className={`text-xs ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Follow these 2 quick steps to add PaintIT to your iPhone or iPad Home Screen:
          </p>
        </div>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
            isDark ? "bg-neutral-950/80 border-neutral-800" : "bg-stone-50 border-stone-200"
          }`}>
            <span className="w-7 h-7 rounded-full bg-[#FF8C38] text-black font-extrabold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div className="text-xs">
              <span>Tap the </span>
              <span className="font-bold text-[#FF8C38]">Share button ( ⬆️ )</span>
              <span> in Safari navigation bar.</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
            isDark ? "bg-neutral-950/80 border-neutral-800" : "bg-stone-50 border-stone-200"
          }`}>
            <span className="w-7 h-7 rounded-full bg-[#FF8C38] text-black font-extrabold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div className="text-xs">
              <span>Scroll down and tap </span>
              <span className="font-bold text-[#FF8C38]">&quot;Add to Home Screen ( ➕ )&quot;</span>.
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowIOSModal(false)}
          className="w-full py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
        >
          Got It!
        </button>
      </div>
    </div>
  );
}
