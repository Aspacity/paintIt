"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: "ANNOUNCEMENT" | "NEW_FEATURE" | "FIXED_ISSUE" | "NEW_DEVELOPMENT" | "SYSTEM_ALERT";
  targetRole: string;
  priority: "normal" | "high" | "urgent";
  actionUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export default function NotificationBellDrawer() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const userRole = user?.role || "CONSUMER";
      const userId = user?.id || "";
      const res = await fetch(`/api/notifications?role=${userRole}&userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Could not fetch notifications:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notifId: string) => {
    if (!user?.id) return;
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notifId, userId: user.id }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "NEW_FEATURE":
        return "bg-[#FF8C38]/20 text-[#FF8C38] border-[#FF8C38]/40";
      case "FIXED_ISSUE":
        return "bg-[#FF8C38]/20 text-orange-300 border-[#FF8C38]/40";
      case "NEW_DEVELOPMENT":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      case "SYSTEM_ALERT":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    }
  };

  return (
    <div className="relative inline-block font-sans">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl border transition-all ${
          isDark
            ? "bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
            : "bg-white border-stone-300 text-stone-900 hover:bg-stone-100"
        }`}
        title="Notifications & System Updates"
        aria-label="Toggle notifications"
      >
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF8C38] text-black font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer (Positioned to open into viewport without off-screen clipping) */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[120]"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`absolute right-0 md:left-0 md:right-auto mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl border shadow-2xl z-[130] overflow-hidden p-4 space-y-3 animate-fade-in ${
              isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-stone-200 text-stone-900"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 px-1 border-neutral-800">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FF8C38] flex items-center gap-1.5">
                  <span>🔔 Notifications & Updates</span>
                </h3>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  Platform updates, fixed issues & system alerts
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 font-bold text-neutral-300">
                {unreadCount} Unread
              </span>
            </div>

            {/* Notifications Feed */}
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500 font-mono space-y-1">
                <span className="text-2xl block">🔕</span>
                <p className="font-bold uppercase text-neutral-400">No Notifications</p>
                <p className="text-[10px] text-neutral-500">
                  New announcements, feature releases, and system updates will appear here!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      notif.isRead
                        ? isDark
                          ? "bg-neutral-900/40 border-neutral-900 opacity-75"
                          : "bg-stone-50 border-stone-200 opacity-80"
                        : isDark
                        ? "bg-neutral-900 border-neutral-800 shadow-md"
                        : "bg-stone-100 border-stone-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(notif.category)}`}>
                        {notif.category.replace("_", " ")}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-neutral-100 leading-tight">
                      {notif.title}
                    </h4>

                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {notif.body}
                    </p>

                    {notif.actionUrl && (
                      <a
                        href={notif.actionUrl}
                        className="text-[10px] font-bold text-[#FF8C38] hover:underline inline-block pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Update Details ➔
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
