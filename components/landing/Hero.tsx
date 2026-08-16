"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import PaintItMasterCanvas from "@/components/canvas/PaintItMasterCanvas";

export default function Hero() {
  const [heroColor, setHeroColor] = useState("#C4B199"); // Desert Sand
  const [heroFinish, setHeroFinish] = useState<"EMULSION" | "GLOSS" | "SATIN">("EMULSION");
  const [heroWallStates, setHeroWallStates] = useState<Record<string, { color: string; finish: "EMULSION" | "GLOSS" | "SATIN" }>>({
    wall_back: { color: "#C4B199", finish: "EMULSION" },
    wall_left: { color: "#F2F1E9", finish: "EMULSION" },
    wall_right: { color: "#9BA498", finish: "EMULSION" },
    ceiling: { color: "#FFFFFF", finish: "EMULSION" },
  });

  return (
    <section className="relative pt-20 sm:pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
      {/* Audience Badges */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6"
      >
        <span className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-full bg-neutral-900 border border-neutral-800 text-emerald-400">
          ✨ 3D Spatial Design Platform
        </span>
        <span className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
          🏡 For Designers & Owners
        </span>
        <span className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
          👨‍🎨 For Contractors & Pros
        </span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] max-w-4xl mx-auto"
      >
        See how your room looks <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-neutral-100 to-neutral-400">
          before you design & build it.
        </span>
      </motion.h1>

      {/* Supporting Copy */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-3 sm:mt-5 text-xs sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed"
      >
        PaintIT helps painters, homeowners, and designers preview real paint colors and finishes in interactive 3D. Tap any wall to test colors instantly.
      </motion.p>

      {/* Primary Hero 3D Room Visualizer Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        id="demo"
        className="mt-6 sm:mt-10 w-full max-w-5xl mx-auto rounded-2xl sm:rounded-3xl border border-neutral-850 bg-neutral-950 p-1.5 sm:p-2 shadow-2xl overflow-hidden relative"
      >
        <div className="w-full rounded-xl sm:rounded-2xl bg-neutral-950 flex flex-col overflow-hidden relative">
          {/* Header toolbar */}
          <div className="h-10 sm:h-11 border-b border-neutral-900 px-3 sm:px-4 flex items-center justify-between bg-neutral-900/80 z-20 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-neutral-300 uppercase tracking-wider">
                PaintIT 3D Room Studio
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 rounded border border-emerald-500/20">
              Double Tap Wall To Change Paint
            </span>
          </div>

          {/* Render Frame Area */}
          <div className="w-full h-[400px] sm:h-[480px] md:h-[540px] bg-neutral-950 relative overflow-hidden">
            <PaintItMasterCanvas
              config={{
                mode: "sandbox",
                modelUrl: "/models/shells/spacious-lux.glb",
                timeOfDay: "day",
                activeWallColor: heroColor,
                activeWallFinish: heroFinish,
                activeCeilingType: "Ceiling_Cove",
                activeFloorTextureId: "floor_oak",
                wallSurfaceStates: heroWallStates,
                enableAutoCutaway: true,
                enableZoom: false,
                hideLightingTab: true,
              }}
              onConfigChange={(newCfg) => {
                if (newCfg.wallSurfaceStates) setHeroWallStates(newCfg.wallSurfaceStates);
                if (newCfg.activeWallColor) setHeroColor(newCfg.activeWallColor);
                if (newCfg.activeWallFinish) setHeroFinish(newCfg.activeWallFinish);
              }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}