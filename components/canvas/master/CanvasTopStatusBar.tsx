"use client";

import React from "react";
import { OfflineSyncBanner } from "@/components/ui/OfflineSyncBanner";

export type CameraViewPreset = "FULL_ROOM" | "SEATING_FOCUS" | "ACCENT_WALL" | "TOP_DOWN";

interface CanvasTopStatusBarProps {
  activeSelectedWall: string | null;
  activeWallFinish: string;
  isSavingLocally?: boolean;
  lastSavedTimestamp?: number | null;
  onSyncToLiveServer?: () => Promise<void>;
  onSelectCameraPreset: (preset: CameraViewPreset) => void;
}

export function CanvasTopStatusBar({
  activeSelectedWall,
  activeWallFinish,
  isSavingLocally,
  lastSavedTimestamp,
  onSyncToLiveServer,
  onSelectCameraPreset,
}: CanvasTopStatusBarProps) {
  return (
    <div className="absolute top-14 md:top-3 left-2 right-2 md:left-3 md:right-3 flex flex-wrap sm:flex-nowrap items-center justify-between pointer-events-none z-10 gap-2">
      {/* Active Surface Status Pill & Offline Banner */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="bg-neutral-950/85 backdrop-blur-xl border border-neutral-800 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-[#FF8C38] animate-pulse" />
          <span className="text-[10px] font-mono text-[#FF8C38] font-bold uppercase tracking-wide">
            {activeSelectedWall ? activeSelectedWall.toUpperCase() : "SELECT SURFACE"}
            {activeSelectedWall &&
            (activeSelectedWall.toLowerCase().includes("curtain") ||
              activeSelectedWall.toLowerCase().includes("window") ||
              activeSelectedWall.toLowerCase().includes("door") ||
              activeSelectedWall.toLowerCase().includes("lamp"))
              ? " • NATIVE FIXTURE"
              : ` • ${activeWallFinish}`}
          </span>
        </div>

        <OfflineSyncBanner
          isSavingLocally={isSavingLocally}
          lastSavedTimestamp={lastSavedTimestamp}
          onSyncToLiveServer={onSyncToLiveServer}
        />
      </div>

      {/* Camera Preset Buttons */}
      <div className="flex items-center gap-1 bg-neutral-950/85 backdrop-blur-xl border border-neutral-800 p-1 rounded-2xl pointer-events-auto shadow-2xl">
        <button
          onClick={() => onSelectCameraPreset("FULL_ROOM")}
          className="px-2.5 py-1 text-[9px] font-black uppercase rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all"
        >
          🏠 Room
        </button>
        <button
          onClick={() => onSelectCameraPreset("SEATING_FOCUS")}
          className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all"
        >
          🛋️ Focus
        </button>
        <button
          onClick={() => onSelectCameraPreset("ACCENT_WALL")}
          className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all"
        >
          🎨 Wall
        </button>
      </div>
    </div>
  );
}
