"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import PaintItMasterCanvas, { WallFinishType } from "@/components/canvas/PaintItMasterCanvas";

export default function SpatialShowcase3D() {
  const [wallColor, setWallColor] = useState<string>("#C4B199"); // Desert Sand
  const [wallFinish, setWallFinish] = useState<WallFinishType>("EMULSION");
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [wallStates, setWallStates] = useState<Record<string, { color: string; finish: WallFinishType }>>({
    wall_back: { color: "#C4B199", finish: "EMULSION" },
    wall_left: { color: "#F2F1E9", finish: "EMULSION" },
    wall_right: { color: "#9BA498", finish: "EMULSION" },
    ceiling: { color: "#FFFFFF", finish: "EMULSION" },
  });

  return (
    <section id="showcase-3d" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-400 block">
          INTERACTIVE SPATIAL ENGINE
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
          This Isn&apos;t a Static Picture.
          <br />
          <span className="text-neutral-400">This Is a Space You Control.</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-normal">
          Double-click or tap any wall surface directly in the 3D viewport to trigger real-time paint splash application, toggle daylighting, and inspect architectural reflections.
        </p>
      </div>

      {/* 3D Viewport Window Frame */}
      <div className="relative border border-neutral-850 bg-neutral-950 rounded-3xl shadow-2xl overflow-hidden min-h-[580px] lg:min-h-[640px] flex flex-col">
        {/* Top Control Toolbar */}
        <div className="h-12 bg-neutral-900/90 border-b border-neutral-850 px-4 flex items-center justify-between z-20 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200">
              PaintIT Studio 2.0 WebGL Canvas
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              Rotate 3D • Double-Tap Wall
            </span>
          </div>
        </div>

        {/* 3D RENDER CANVAS AREA */}
        <div className="flex-1 relative bg-neutral-950">
          <PaintItMasterCanvas
            config={{
              mode: "sandbox",
              modelUrl: "/models/shells/spacious-lux.glb",
              timeOfDay: "day",
              activeWallColor: wallColor,
              activeWallFinish: wallFinish,
              activeCeilingType: "Ceiling_Cove",
              activeFloorTextureId: "floor_oak",
              wallSurfaceStates: wallStates,
              bumpScale: 0.05,
              shadowOpacity: 0.65,
              enableAutoCutaway: true,
              enableZoom: false,
              hideLightingTab: true,
            }}
            onConfigChange={(newCfg) => {
              if (newCfg.wallSurfaceStates) {
                setWallStates(newCfg.wallSurfaceStates);
              }
              if (newCfg.activeWallColor) {
                setWallColor(newCfg.activeWallColor);
              }
              if (newCfg.activeWallFinish) {
                setWallFinish(newCfg.activeWallFinish);
              }
              if (newCfg.timeOfDay) {
                setIsNightMode(newCfg.timeOfDay === "night");
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}
