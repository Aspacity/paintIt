// components/shared/BottomNav.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { triggerGlobalFeedbackModal } from "@/components/ui/FeedbackModalPopup";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavigationProps {
  items: NavItem[];
}

export const BottomNav: React.FC<NavigationProps> = ({ items }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const targetName = user?.fullName || user?.full_name || "";
  const nameInitialLetter = targetName.trim() ? targetName.trim().charAt(0).toUpperCase() : "P";
  const userAvatarImageSrc = user?.avatarUrl || user?.avatar_url || null;

  // Primary workspace navigation list (Profile is managed via dedicated profile card at bottom)
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
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-neutral-950 border-r border-neutral-900/80 flex-col justify-between p-5 z-30 font-sans">
        <div className="w-full">
          <div className="mb-8 px-2">
            <Link href="/dashboard" className="inline-block">
              <span className="text-emerald-500 text-lg font-black tracking-wider uppercase">
                PaintIt <span className="text-white text-xs font-medium lowercase">Studio OS</span>
              </span>
            </Link>
          </div>

          <nav className="space-y-2">
            <div className="text-[10px] text-neutral-600 uppercase font-black tracking-widest px-2 mb-3">
              Workspace Panels
            </div>

            {mainWorkspaceNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                    isActive
                      ? "bg-neutral-900 text-emerald-400 border border-neutral-800"
                      : "text-neutral-500 hover:text-neutral-300 border border-transparent hover:bg-neutral-900/40"
                  }`}
                >
                  <div className={isActive ? "text-emerald-400" : "text-neutral-600"}>
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 💬 DESKTOP FEEDBACK BUTTON & PROFILE FOOTER SECTION */}
        <div className="border-t border-neutral-900 pt-4 space-y-3">
          {/* 💬 FEEDBACK BUTTON DIRECTLY IN SIDEBAR (RIGHT ABOVE PROFILE CARD) */}
          <button
            type="button"
            onClick={triggerGlobalFeedbackModal}
            className="w-full py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>💬 Drop Feedback</span>
          </button>

          {/* DEDICATED PROFILE CARD AT BOTTOM */}
          <Link
            href="/profile"
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all border ${
              pathname === "/profile"
                ? "bg-neutral-900 border-neutral-800"
                : "border-transparent hover:bg-neutral-900/40"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-black uppercase text-emerald-400 shrink-0 overflow-hidden shadow-inner select-none">
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
              <h4 className="text-xs font-black text-neutral-200 truncate leading-tight">
                {targetName || "Active Painter"}
              </h4>
              <span className="text-[9px] text-neutral-500 font-bold tracking-wider uppercase truncate block mt-0.5">
                Profile & Settings
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 bg-neutral-950 hover:bg-red-950/20 border border-neutral-900 hover:border-red-900/30 text-neutral-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            LOG OUT
          </button>
        </div>
      </aside>

      {/* ========================================================== */}
      {/* 📱 MOBILE TOP HEADER WITH HAMBURGER DRAWER TRIGGER          */}
      {/* ========================================================== */}
      <header className="md:hidden sticky top-0 left-0 right-0 h-14 bg-neutral-950/90 border-b border-neutral-900/90 z-40 px-4 flex items-center justify-between backdrop-blur-xl select-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-black text-white uppercase tracking-wider">
            PaintIt <span className="text-emerald-400">Studio</span>
          </span>
        </div>

        <Link href="/profile" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-black uppercase text-emerald-400 overflow-hidden shadow-inner">
            {userAvatarImageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatarImageSrc} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{nameInitialLetter}</span>
            )}
          </div>
        </Link>
      </header>

      {/* ========================================================== */}
      {/* 📱 MOBILE SLIDE-OUT LEFT DRAWER OVERLAY                    */}
      {/* ========================================================== */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-[110] transition-opacity duration-300 animate-fade-in"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 w-72 bg-neutral-950 border-r border-neutral-850 z-[120] flex flex-col justify-between p-5 transition-transform duration-300 ease-out font-sans shadow-2xl ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="w-full space-y-6 overflow-y-auto">
          {/* Drawer Header with Close Button */}
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <span className="text-sm font-black uppercase tracking-wider text-emerald-400">
              Navigation Menu
            </span>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Drawer Navigation List with Spacious Padding */}
          <nav className="space-y-2">
            {mainWorkspaceNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "text-neutral-400 hover:text-white border border-transparent hover:bg-neutral-900/40"
                  }`}
                >
                  <div className={isActive ? "text-emerald-400" : "text-neutral-500"}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer with FEEDBACK BUTTON & DEDICATED PROFILE CARD */}
        <div className="border-t border-neutral-900 pt-4 space-y-3">
          {/* 💬 FEEDBACK BUTTON DIRECTLY INSIDE DRAWER (ABOVE PROFILE CARD) */}
          <button
            type="button"
            onClick={() => {
              setMobileDrawerOpen(false);
              triggerGlobalFeedbackModal();
            }}
            className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>💬 Drop Feedback</span>
          </button>

          {/* MOBILE PROFILE CARD IN DRAWER FOOTER */}
          <Link
            href="/profile"
            onClick={() => setMobileDrawerOpen(false)}
            className={`flex items-center gap-3 p-3 bg-neutral-900/70 border border-neutral-850 rounded-2xl transition-all ${
              pathname === "/profile" ? "border-emerald-500/40" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xs font-black uppercase text-emerald-400 overflow-hidden shadow-inner shrink-0">
              {userAvatarImageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userAvatarImageSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{nameInitialLetter}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-white truncate">{targetName || "Painter Account"}</h4>
              <span className="text-[10px] text-emerald-400 font-mono">Profile & Settings ➔</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileDrawerOpen(false);
              logout();
            }}
            className="w-full py-2 bg-neutral-950 hover:bg-red-950/30 border border-neutral-900 hover:border-red-900/40 text-neutral-500 hover:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
          >
            🚪 Log Out
          </button>
        </div>
      </aside>
    </>
  );
};