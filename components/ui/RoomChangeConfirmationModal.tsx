"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RoomChangeConfirmationModalProps {
  isOpen: boolean;
  targetRoomName: string;
  onKeepChanges: () => void;
  onDiscardChanges: () => void;
  onCancel: () => void;
}

export function RoomChangeConfirmationModal({
  isOpen,
  targetRoomName,
  onKeepChanges,
  onDiscardChanges,
  onCancel,
}: RoomChangeConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Blurred Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-left overflow-hidden space-y-5 select-none"
        >
          {/* Top Decorative Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-transparent" />

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xl shrink-0">
              🏠
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-wide">
                Switch Architectural Room?
              </h3>
              <p className="text-xs font-mono text-cyan-300">
                Target: {targetRoomName}
              </p>
            </div>
          </div>

          {/* Body Message */}
          <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-850">
            You are switching to a new 3D room shell model. Would you like to **keep** your active wall colors and sheens, or **discard** them to load default room configuration?
          </p>

          {/* 3 Ergonomic Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={onKeepChanges}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🎨 Keep Paint Changes & Apply to New Room</span>
            </button>

            <button
              onClick={onDiscardChanges}
              className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-neutral-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🧹 Discard & Load Default Room Colors</span>
            </button>

            <button
              onClick={onCancel}
              className="w-full py-2 px-4 bg-transparent hover:bg-neutral-950 text-neutral-400 hover:text-neutral-200 text-[11px] font-mono uppercase tracking-wider rounded-xl transition-all text-center"
            >
              Cancel Switch
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
