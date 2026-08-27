"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OfflineSyncBannerProps {
  onSyncToLiveServer?: () => void;
  isSavingLocally?: boolean;
  lastSavedTimestamp?: string | null;
}

export function OfflineSyncBanner({
  onSyncToLiveServer,
  isSavingLocally = false,
  lastSavedTimestamp = null,
}: OfflineSyncBannerProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnectedModal, setShowReconnectedModal] = useState<boolean>(false);
  const [hasPendingOfflineData, setHasPendingOfflineData] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    // Detect initial online state
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      // Check if user saved data while offline
      const pendingData = localStorage.getItem("paintit_offline_workspace_draft");
      if (pendingData) {
        setHasPendingOfflineData(true);
        setShowReconnectedModal(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedModal(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handlePushSync = async () => {
    setIsSyncing(true);
    try {
      if (onSyncToLiveServer) {
        await onSyncToLiveServer();
      }
      setHasPendingOfflineData(false);
      setShowReconnectedModal(false);
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {/* 🟢/🟡 NETWORK & DRAFT STATUS PILL (FLOATING WORKSPACE UI) */}
      <div className="flex items-center gap-2 select-none">
        <div
          className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-xl shadow-lg transition-all ${
            isOnline
              ? "bg-neutral-950/80 border-emerald-500/30 text-emerald-400"
              : "bg-amber-950/90 border-amber-500/50 text-amber-300 animate-pulse"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span>{isOnline ? "Live Sync Active" : "⚡ Offline Mode"}</span>
        </div>

        {/* Local Draft Saved Indicator */}
        <AnimatePresence>
          {isSavingLocally && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="text-[9px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full flex items-center gap-1"
            >
              <span>💾 Draft Saved Locally</span>
              {lastSavedTimestamp && (
                <span className="text-neutral-500">({lastSavedTimestamp})</span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 🚀 BACK ONLINE RECONNECTION MODAL / TOAST */}
      <AnimatePresence>
        {showReconnectedModal && hasPendingOfflineData && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-32px)] bg-neutral-950/95 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg shrink-0">
                  🌐
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">
                    Internet Reconnected!
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
                    You have offline room styling changes saved locally on your device.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowReconnectedModal(false)}
                className="text-neutral-500 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="pt-2 border-t border-neutral-900 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReconnectedModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Keep Local
              </button>

              <button
                onClick={handlePushSync}
                disabled={isSyncing}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? (
                  <span>Syncing...</span>
                ) : (
                  <>
                    <span>🚀 Push Updates to Live Server</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
