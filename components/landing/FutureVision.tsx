"use client";

import React from "react";
import { motion } from "framer-motion";

export default function FutureVision() {
  return (
    <section id="roadmap" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-400 block">
          OUR BIG VISION
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
          Building the Platform for Physical Spaces
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 font-normal">
          PaintIT Studio is expanding step-by-step into a complete 3D spatial design engine. Here is what we are building.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-emerald-500/40 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🎨</span>
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              AVAILABLE NOW
            </span>
          </div>
          <h3 className="text-base font-bold text-white">Surface & Color Design</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-normal">
            Per-wall paint design, real brand swatch catalogs, 3D splash ripples, and natural daylight preview.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-850 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🛋️</span>
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              IN DEVELOPMENT
            </span>
          </div>
          <h3 className="text-base font-bold text-white">FurnishIT Layout Planner</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-normal">
            3D furniture drag-and-drop placement, room clearance checks, and multi-furniture arrangement saving.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-850 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-2xl">✨</span>
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              FUTURE ROADMAP
            </span>
          </div>
          <h3 className="text-base font-bold text-white">DesignIT Material Explorer</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-normal">
            Hardwood, marble, and slate floor textures, LED ceiling cove lights, and 4K realistic photo renders.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-850 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🏗️</span>
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              FUTURE ROADMAP
            </span>
          </div>
          <h3 className="text-base font-bold text-white">BuildIT Property Tools</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-normal">
            Paint bucket volume calculation, direct contractor dispatch, property staging, and job estimates.
          </p>
        </div>
      </div>
    </section>
  );
}