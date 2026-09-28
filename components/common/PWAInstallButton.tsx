"use client";

import React from "react";
import { usePWAInstall } from "@/context/PWAContext";
import { useTheme } from "@/context/ThemeContext";

interface PWAInstallButtonProps {
  variant?: "navbar" | "button" | "chip" | "banner";
  className?: string;
  label?: string;
}

export default function PWAInstallButton({
  variant = "button",
  className = "",
  label,
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // If already installed inside standalone mode, don't show prompt button unless in settings/debugging
  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
        <span>✓</span>
        <span>App Installed</span>
      </div>
    );
  }

  // If not installable and not iOS, return null
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await promptInstall();
  };

  const buttonText = label || (isIOS ? "Install App (iOS)" : "Install App");

  if (variant === "navbar") {
    return (
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all transform hover:scale-105 shadow-md active:scale-95 ${
          isDark
            ? "bg-[#FF8C38] hover:bg-[#ff9e54] text-black"
            : "bg-[#FF8C38] hover:bg-[#ff9e54] text-black"
        } ${className}`}
        title="Install PaintIT PWA for fast 3D performance"
      >
        <span className="text-sm">📲</span>
        <span>{buttonText}</span>
      </button>
    );
  }

  if (variant === "chip") {
    return (
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
          isDark
            ? "bg-neutral-900 border-[#FF8C38]/40 text-[#FF8C38] hover:bg-neutral-800"
            : "bg-white border-[#FF8C38]/60 text-[#e06d19] hover:bg-stone-50"
        } ${className}`}
      >
        <span>📲</span>
        <span>{buttonText}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
        isDark
          ? "bg-[#FF8C38] hover:bg-[#ff9e54] text-black"
          : "bg-[#FF8C38] hover:bg-[#ff9e54] text-black"
      } ${className}`}
    >
      <span className="text-sm">📲</span>
      <span>{buttonText}</span>
    </button>
  );
}
