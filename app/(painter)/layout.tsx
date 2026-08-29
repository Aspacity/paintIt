"use client";

import React from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { BottomNav } from "@/components/ui/BottomNav";
import { useTheme } from "@/context/ThemeContext";

export default function PainterDashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <RoleGuard allowedRole="PAINTER">
      <div className={`min-h-screen relative pb-24 md:pb-0 md:pl-64 transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
      }`}>

        {/* Mount navigation component engine */}
        <BottomNav items={[]} />

        {/* Dynamic Page Content Surface Area Injection Mount */}
        <main className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 animate-fade-in">
          {children}
        </main>

      </div>
    </RoleGuard>
  );
}