"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PaintItMasterCanvas, { WallFinishType } from "@/components/canvas/PaintItMasterCanvas";

export default function Hero() {
  const [heroColor, setHeroColor] = useState("#C4B199"); // Desert Sand
  const [heroFinish, setHeroFinish] = useState<WallFinishType>("EMULSION");
  const [heroTimeOfDay, setHeroTimeOfDay] = useState<"day" | "night">("day");
  const [heroWallStates, setHeroWallStates] = useState<Record<string, { color: string; finish: WallFinishType }>>({
    wall_back: { color: "#C4B199", finish: "EMULSION" },
    wall_left: { color: "#F2F1E9", finish: "EMULSION" },
    wall_right: { color: "#9BA498", finish: "EMULSION" },
    wall_front: { color: "#C4B199", finish: "EMULSION" },
    toilet: { color: "#C4B199", finish: "EMULSION" },
    ceiling: { color: "#FFFFFF", finish: "EMULSION" },
  });

  return (
    <section className="relative pt-24 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
      {/* EYEBROW */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6"
      >
        <span className="px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
          BUILT FOR BETTER PAINT DECISIONS
        </span>
      </motion.div>

      {/* HEADLINE */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-4xl mx-auto text-balance"
      >
        Don&apos;t explain the result.{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-neutral-200">
          Show it.
        </span>
      </motion.h1>

      {/* SUPPORTING TEXT */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed text-balance"
      >
        PaintIT Studio helps painters and homeowners explore paint colours, finishes, and lighting inside interactive 3D spaces before work begins.
      </motion.p>

      {/* CTAS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <a
          href="#early-access"
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Get Started</span>
          <span>→</span>
        </a>

        <a
          href="#how-it-works"
          className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all"
        >
          See How It Works
        </a>
      </motion.div>

      {/* HERO VISUAL: 3D ROOM INTERACTIVE DEMO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        id="demo"
        className="mt-10 sm:mt-14 w-full max-w-5xl mx-auto rounded-2xl sm:rounded-3xl border border-neutral-850 bg-neutral-950 p-1.5 sm:p-2.5 shadow-2xl overflow-hidden relative"
      >
        <div className="w-full rounded-xl sm:rounded-2xl bg-neutral-950 flex flex-col overflow-hidden relative">
          {/* Header toolbar */}
          <div className="h-10 sm:h-11 border-b border-neutral-900 px-3 sm:px-4 flex items-center justify-between bg-neutral-900/80 z-20 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-neutral-300 uppercase tracking-wider">
                PaintIT 3D Room Studio Viewport
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 rounded border border-emerald-500/20">
              Double Tap Wall To Test Paint
            </span>
          </div>

          {/* Render Frame Area */}
          <div className="w-full h-[380px] sm:h-[480px] md:h-[540px] bg-neutral-950 relative overflow-hidden">
            <PaintItMasterCanvas
              config={{
                mode: "painter",
                modelUrl: "/models/shells/spacious-lux.glb",
                timeOfDay: heroTimeOfDay,
                activeWallColor: heroColor,
                activeWallFinish: heroFinish,
                activeCeilingType: "Ceiling_Cove",
                activeFloorTextureId: "floor_oak",
                wallSurfaceStates: heroWallStates,
                enableZoom: false,
                hideFloorTab: true,
                hideColorMixer: true,
                hideAssemblyPanel: true,
                isAdmin: false,
                hideLightingTab: false,
              }}
              onConfigChange={(newCfg) => {
                if (newCfg.wallSurfaceStates) setHeroWallStates(newCfg.wallSurfaceStates);
                if (newCfg.activeWallColor) setHeroColor(newCfg.activeWallColor);
                if (newCfg.activeWallFinish) setHeroFinish(newCfg.activeWallFinish);
                if (newCfg.timeOfDay && (newCfg.timeOfDay === "day" || newCfg.timeOfDay === "night")) {
                  setHeroTimeOfDay(newCfg.timeOfDay);
                }
              }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}