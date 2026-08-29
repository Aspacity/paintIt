"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { triggerGlobalFeedbackModal } from "@/components/ui/FeedbackModalPopup";
import Logo from "@/components/common/Logo";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavigationProps {
  items: NavItem[];
}

export const BottomNav: React.FC<NavigationProps> = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const targetName = user?.fullName || user?.full_name || "";
  const nameInitialLetter = targetName.trim() ? targetName.trim().charAt(0).toUpperCase() : "P";
  const userAvatarImageSrc = user?.avatarUrl || user?.avatar_url || null;

  // Primary workspace navigation list
  const mainWorkspaceNavItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      label: "3D Studio",
      href: "/designs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: "Leads & Inbox",
      href: "/gigs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      label: "Analytics",
      href: "/insights",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Portfolio",
      href: "/portfolio",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ========================================================== */}
      {/* 🖥️ DESKTOP LEFT SIDEBAR LAYOUT                            */}
      {/* ========================================================== */}
      <aside className={`hidden md:flex fixed top-0 left-0 bottom-0 w-64 border-r flex-col justify-between p-5 z-30 font-sans transition-colors ${
        isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
      }`}>
        <div className="w-full">
          <div className="mb-6 px-1 pt-1">
            <Logo size="sm" subtitle="Contractor OS" textColor={isDark ? "text-white" : "text-stone-900"} />
          </div>

          <nav className="space-y-1">
            <div className={`text-[10px] uppercase font-bold tracking-widest px-2 mb-2 ${
              isDark ? "text-neutral-500" : "text-stone-400"
            }`}>
              Workspace Panels
            </div>

            {mainWorkspaceNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                    isActive
                      ? "bg-[#FF8C38] text-black shadow-md"
                      : isDark
                      ? "text-neutral-400 hover:text-white hover:bg-neutral-900"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  <div className={isActive ? "text-black" : isDark ? "text-neutral-400" : "text-stone-500"}>
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER SECTION WITH THEME SWITCHER, FEEDBACK, PROFILE CARD */}
        <div className={`border-t pt-4 space-y-2 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
          {/* Theme Switcher */}
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
              <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF8C38]">Toggle</span>
          </button>

          {/* Feedback Button */}
          <button
            type="button"
            onClick={triggerGlobalFeedbackModal}
            className={`w-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border ${
              isDark
                ? "bg-neutral-900 border-neutral-800 text-[#FF8C38] hover:bg-neutral-800"
                : "bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200"
            }`}
          >
            <span>💬 Drop Feedback</span>
          </button>

          {/* Profile Card */}
          <Link
            href="/profile"
            className={`flex items-center gap-3 p-2 rounded-xl transition-all border ${
              pathname === "/profile"
                ? "bg-[#FF8C38]/15 border-[#FF8C38]/40"
                : isDark
                ? "border-transparent hover:bg-neutral-900"
                : "border-transparent hover:bg-stone-100"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#FF8C38] text-black flex items-center justify-center text-xs font-bold uppercase shrink-0 overflow-hidden shadow-xs">
              {userAvatarImageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userAvatarImageSrc}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{nameInitialLetter}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className={`text-xs font-bold truncate leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
                {targetName || "Painter Account"}
              </h4>
              <span className="text-[9px] text-[#FF8C38] font-semibold tracking-wider uppercase truncate block mt-0.5">
                Profile & Settings
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-center"
          >
            LOG OUT
          </button>
        </div>
      </aside>

      {/* ========================================================== */}
      {/* 📱 MOBILE TOP HEADER                                       */}
      {/* ========================================================== */}
      <header className={`md:hidden sticky top-0 left-0 right-0 h-14 border-b z-40 px-4 flex items-center justify-between backdrop-blur-xl select-none ${
        isDark ? "bg-neutral-950/90 border-neutral-900" : "bg-white/90 border-stone-200"
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              isDark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-stone-100 border-stone-300 text-stone-800"
            }`}
            aria-label="Open Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Logo size="sm" textColor={isDark ? "text-white" : "text-stone-900"} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border text-xs font-bold ${
              isDark ? "bg-neutral-900 border-neutral-800 text-amber-300" : "bg-stone-100 border-stone-300 text-stone-800"
            }`}
          >
            {isDark ? "🌙" : "☀️"}
          </button>

          <Link href="/profile" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF8C38] text-black flex items-center justify-center text-xs font-bold uppercase overflow-hidden shadow-xs">
              {userAvatarImageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userAvatarImageSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{nameInitialLetter}</span>
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* ========================================================== */}
      {/* 📱 MOBILE SLIDE-OUT DRAWER OVERLAY                        */}
      {/* ========================================================== */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-[110] transition-opacity duration-300 animate-fade-in"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 w-72 border-r z-[120] flex flex-col justify-between p-5 transition-transform duration-300 ease-out font-sans shadow-2xl ${
          isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-stone-200 text-stone-900"
        } ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="w-full space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-3">
            <Logo size="sm" textColor={isDark ? "text-white" : "text-stone-900"} />
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="w-8 h-8 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-1.5">
            {mainWorkspaceNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-[#FF8C38] text-black shadow-md"
                      : isDark
                      ? "text-neutral-400 hover:text-white hover:bg-neutral-900"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  <div>{item.icon}</div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t pt-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              setMobileDrawerOpen(false);
              triggerGlobalFeedbackModal();
            }}
            className="w-full py-2.5 bg-[#FF8C38]/15 border border-[#FF8C38]/40 text-[#FF8C38] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>💬 Drop Feedback</span>
          </button>

          <Link
            href="/profile"
            onClick={() => setMobileDrawerOpen(false)}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-[#FF8C38]/30 bg-[#FF8C38]/10"
          >
            <div className="w-8 h-8 rounded-full bg-[#FF8C38] text-black flex items-center justify-center text-xs font-bold shrink-0">
              {nameInitialLetter}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold truncate">{targetName || "Painter Account"}</h4>
              <span className="text-[10px] text-[#FF8C38]">Profile & Settings ➔</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileDrawerOpen(false);
              logout();
            }}
            className="w-full py-2 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            🚪 Log Out
          </button>
        </div>
      </aside>
    </>
  );
};