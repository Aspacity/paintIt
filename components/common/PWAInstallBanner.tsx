"use client";

import React, { useState, useEffect } from "react";
import { usePWAInstall } from "@/context/PWAContext";
import { useTheme } from "@/context/ThemeContext";

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const isDismissedStored = sessionStorage.getItem("paintit_pwa_banner_dismissed") === "true";
    if (isDismissedStored) {
      setDismissed(true);
    }
  }, []);

  if (isInstalled || dismissed) return null;
  if (!isInstallable && !isIOS) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("paintit_pwa_banner_dismissed", "true");
  };

  const handleInstall = async () => {
    await promptInstall();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up select-none">
      <div className={`p-4 rounded-3xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 relative overflow-hidden ${
        isDark ? "bg-neutral-950/95 border-neutral-800 text-white" : "bg-white/95 border-stone-200 text-stone-900"
      }`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FF8C38]" />

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#FF8C38]/20 border border-[#FF8C38]/40 text-xl flex items-center justify-center shrink-0">
            📲
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold truncate">Install PaintIT App</h4>
            <p className={`text-[11px] truncate ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
              {isIOS ? "Add to Home Screen for fast 3D room access" : "Fast 3D performance, offline mode & full screen"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase transition ${
              isDark ? "text-neutral-400 hover:text-white" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Later
          </button>

          <button
            onClick={handleInstall}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-extrabold shadow-md transition-all transform active:scale-95 shrink-0"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
