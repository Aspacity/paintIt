"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ProblemSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
          THE REAL-WORLD PROBLEM
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          A colour in your head doesn't always look the same on the wall.
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          The biggest delay in paint projects isn't the preparation or the painting — it's the uncertainty before the first coat.
        </p>
      </div>

      {/* EDITORIAL FRICTION STORY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: THE UNCERTAIN CLIENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-neutral-900/60 border border-neutral-850 p-6 sm:p-8 rounded-3xl space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block">
              01 / THE QUESTION
            </span>
            <blockquote className="text-lg font-bold text-neutral-200 italic border-l-2 border-emerald-500 pl-4 py-1">
              "What will this colour actually look like in my room?"
            </blockquote>
            <p className="text-xs text-neutral-400 leading-relaxed pt-2">
              A client struggles to picture how a small 2-inch paint swatch will look across four full walls under real room lighting.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-500">
            RESULT: Uncertainty & hesitation
          </div>
        </motion.div>

        {/* CARD 2: THE BACK-AND-FORTH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-neutral-900/60 border border-neutral-850 p-6 sm:p-8 rounded-3xl space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block">
              02 / THE DELAY
            </span>
            <blockquote className="text-lg font-bold text-neutral-200 italic border-l-2 border-amber-500 pl-4 py-1">
              "Let me check another chart... maybe tomorrow."
            </blockquote>
            <p className="text-xs text-neutral-400 leading-relaxed pt-2">
              Painters and clients exchange dozens of messages, physical fan decks, and sample pots trying to describe undertones and sheens with words alone.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-500">
            RESULT: Delayed project approvals
          </div>
        </motion.div>

        {/* CARD 3: THE CORE INSIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-neutral-900/60 border border-neutral-850 p-6 sm:p-8 rounded-3xl space-y-4 flex flex-col justify-between bg-gradient-to-b from-neutral-900/90 to-neutral-950"
        >
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              03 / THE INSIGHT
            </span>
            <h3 className="text-lg font-bold text-white leading-snug">
              It’s not a lack of skill — it’s a gap in visualization.
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed pt-1">
              You have the craftsmanship to deliver great work. PaintIT bridges the gap so your clients can finally see the concept before work starts.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-800/80 text-[11px] font-mono text-emerald-400 font-bold">
            SOLUTION: Visual clarity before coat one
          </div>
        </motion.div>
      </div>
    </section>
  );
}
