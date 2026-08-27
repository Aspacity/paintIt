"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900 text-center">
      <div className="bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-neutral-950 border border-neutral-850 rounded-3xl p-8 sm:p-16 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
            READY TO TRANSFORM YOUR PAINT PRESENTATIONS?
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Don't just describe the result. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-neutral-200">
              Show it.
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-neutral-300 max-w-xl mx-auto font-normal leading-relaxed">
            Explore your paint ideas before the work begins. Give your clients visual clarity and complete confidence.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#early-access"
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Get Started with PaintIT
            </a>

            <a
              href="#early-access"
              className="px-8 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              Join Early Access
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
