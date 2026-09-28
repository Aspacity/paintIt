"use client";

import React from "react";
import { UserRole } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface RoleSelectionCardGroupProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  disabled?: boolean;
}

export default function RoleSelectionCardGroup({
  selectedRole,
  onSelectRole,
  disabled = false,
}: RoleSelectionCardGroupProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isPainter = selectedRole === "PAINTER";
  const isConsumer = selectedRole === "CONSUMER";

  return (
    <div className="space-y-3 select-none">
      <div className="text-center space-y-1">
        <label className={`text-[11px] font-mono font-bold uppercase tracking-wider block ${
          isDark ? "text-neutral-300" : "text-stone-700"
        }`}>
          Select Account Type
        </label>
        <p className={`text-[11px] ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
          Choose how you will be using PaintIT (you can change this later in settings)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 🎨 PAINTER / CONTRACTOR CARD */}
        <div
          onClick={() => !disabled && onSelectRole("PAINTER")}
          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
            isPainter
              ? "bg-[#FF8C38]/15 border-[#FF8C38] shadow-lg shadow-[#FF8C38]/10 scale-[1.02]"
              : isDark
              ? "bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 opacity-80 hover:opacity-100"
              : "bg-white border-stone-200 hover:border-stone-300 opacity-80 hover:opacity-100"
          } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          {/* Active Selection Badge */}
          {isPainter && (
            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#FF8C38] text-black flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎨</span>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#FF8C38]/20 text-[#FF8C38] border border-[#FF8C38]/30 inline-block">
                  Painter / Contractor
                </span>
                <h3 className={`text-sm font-bold leading-tight mt-1 ${isDark ? "text-white" : "text-stone-900"}`}>
                  Professional Account
                </h3>
              </div>
            </div>

            <p className={`text-[11px] leading-relaxed mb-3 ${isDark ? "text-neutral-300" : "text-stone-600"}`}>
              For painters & contractors creating 3D proposals, winning bids, and showcasing project portfolios.
            </p>
          </div>

          <ul className={`text-[10px] space-y-1 font-medium border-t pt-2.5 ${
            isDark ? "border-neutral-800 text-neutral-400" : "border-stone-100 text-stone-500"
          }`}>
            <li className="flex items-center gap-1.5">
              <span className="text-[#FF8C38] font-bold">✓</span> Create 3D Color Proposals for Bids
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#FF8C38] font-bold">✓</span> Showcase Work in Public Portfolio
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#FF8C38] font-bold">✓</span> Get Client Painting Leads
            </li>
          </ul>
        </div>

        {/* 🏡 HOMEOWNER / CLIENT CARD */}
        <div
          onClick={() => !disabled && onSelectRole("CONSUMER")}
          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
            isConsumer
              ? "bg-[#FF8C38]/15 border-[#FF8C38] shadow-lg shadow-[#FF8C38]/10 scale-[1.02]"
              : isDark
              ? "bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 opacity-80 hover:opacity-100"
              : "bg-white border-stone-200 hover:border-stone-300 opacity-80 hover:opacity-100"
          } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          {/* Active Selection Badge */}
          {isConsumer && (
            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#FF8C38] text-black flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏡</span>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30 inline-block">
                  Homeowner / Client
                </span>
                <h3 className={`text-sm font-bold leading-tight mt-1 ${isDark ? "text-white" : "text-stone-900"}`}>
                  Client Account
                </h3>
              </div>
            </div>

            <p className={`text-[11px] leading-relaxed mb-3 ${isDark ? "text-neutral-300" : "text-stone-600"}`}>
              For homeowners & clients testing colors in 3D, creating room concepts, and hiring professional painters.
            </p>
          </div>

          <ul className={`text-[10px] space-y-1 font-medium border-t pt-2.5 ${
            isDark ? "border-neutral-800 text-neutral-400" : "border-stone-100 text-stone-500"
          }`}>
            <li className="flex items-center gap-1.5">
              <span className="text-sky-400 font-bold">✓</span> Test Paint Colors & Finishes in 3D
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-sky-400 font-bold">✓</span> Share Concepts with Family & Painters
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-sky-400 font-bold">✓</span> Connect with Verified Painters
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
