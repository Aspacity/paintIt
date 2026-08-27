"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const PREVIEW_PALETTE = [
  { name: "Desert Sand", hex: "#C4B199", finish: "Matte Emulsion" },
  { name: "Pearl White", hex: "#F2F1E9", finish: "Matte Emulsion" },
  { name: "Sage Olive", hex: "#9BA498", finish: "Satin Sheen" },
  { name: "Obsidian", hex: "#1E1E24", finish: "High Gloss" },
];

export default function Hero() {
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [activeLighting, setActiveLighting] = useState<"day" | "night">("day");

  const currentColor = PREVIEW_PALETTE[activeColorIndex];

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
        <Link
          href="/search/designs"
          className="px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Explore 3D Rooms & Catalog</span>
          <span>→</span>
        </Link>

        <a
          href="#early-access"
          className="px-7 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all"
        >
          Join Early Access
        </a>
      </motion.div>

      {/* SLEEK SPATIAL PRODUCT SHOWCASE FRAME */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-10 sm:mt-14 w-full max-w-5xl mx-auto rounded-3xl border border-neutral-850 bg-neutral-950 p-2 sm:p-3 shadow-2xl overflow-hidden relative"
      >
        <div className="w-full rounded-2xl bg-neutral-900/60 border border-neutral-850 p-6 sm:p-10 flex flex-col gap-6 relative overflow-hidden text-left">
          {/* Background Ambient Glow */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: currentColor.hex, opacity: 0.15 }}
          />

          {/* Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                PAINTIT 3D SPATIAL PREVIEW
              </span>
            </div>

            {/* Day / Night Environment Selector */}
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveLighting("day")}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-lg transition-all ${
                  activeLighting === "day"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                ☀️ Daylight
              </button>
              <button
                onClick={() => setActiveLighting("night")}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-lg transition-all ${
                  activeLighting === "night"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                🌙 Night
              </button>
            </div>
          </div>

          {/* Interactive Swatch & Finish Storyboard Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 pt-2">
            {/* Color Swatch Preview Box */}
            <div className="md:col-span-6 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
                ACTIVE WALL SURFACE
              </span>

              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-xl shrink-0 transition-colors duration-500"
                  style={{ backgroundColor: currentColor.hex }}
                />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">{currentColor.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">{currentColor.hex}</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-neutral-900 border border-neutral-800 text-emerald-400">
                      {currentColor.finish}
                    </span>
                  </div>
                </div>
              </div>

              {/* Swatch Selector */}
              <div className="pt-2 space-y-2 border-t border-neutral-900">
                <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">
                  Select Room Swatch Concept
                </span>
                <div className="flex items-center gap-2">
                  {PREVIEW_PALETTE.map((item, idx) => (
                    <button
                      key={item.name}
                      onClick={() => setActiveColorIndex(idx)}
                      className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${
                        activeColorIndex === idx
                          ? "border-emerald-400 scale-110 shadow-lg"
                          : "border-neutral-800 hover:border-neutral-600"
                      }`}
                      style={{ backgroundColor: item.hex }}
                      title={item.name}
                    >
                      {activeColorIndex === idx && <span className="text-xs font-bold text-white mix-blend-difference">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Catalog Callout Card */}
            <div className="md:col-span-6 bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between h-full">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider inline-block">
                  READY TO EXPLORE REAL ROOMS?
                </span>
                <h3 className="text-lg font-bold text-white">
                  Experience interactive 3D rooms inside our Catalog.
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Pick any 3D layout, test unlimited colors, preview finishes under day/night lighting, and share your concepts with clients.
                </p>
              </div>

              <div className="pt-3">
                <Link
                  href="/search/designs"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Launch 3D Architecture Catalog</span>
                  <span>➔</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}