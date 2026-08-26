"use client";

import React from "react";
import { motion } from "framer-motion";

const STAGES = [
  {
    step: "01",
    label: "EXPLAIN",
    title: "Start with the concept",
    description: "Discuss colour palettes, wall ideas, and mood goals with your client.",
    icon: "💬",
  },
  {
    step: "02",
    label: "VISUALIZE",
    title: "Render inside 3D space",
    description: "Apply real paint shades and wall finishes inside interactive 3D room models.",
    icon: "🎨",
  },
  {
    step: "03",
    label: "EXPLORE",
    title: "Test lighting & combinations",
    description: "Switch between daylight and night ambient light to verify color behavior.",
    icon: "☀️",
  },
  {
    step: "04",
    label: "DECIDE",
    title: "Proceed with confidence",
    description: "The client approves the exact concept. Start painting with zero guesswork.",
    icon: "✨",
  },
];

export default function SolutionSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
          THE PAINTIT TRANSFORMATION
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Show the idea before the first coat.
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          PaintIT transforms how paint concepts are presented, bringing clarity and speed to every colour decision.
        </p>
      </div>

      {/* TRANSFORMATION FLOW STEPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {STAGES.map((stage, idx) => (
          <motion.div
            key={stage.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-neutral-900/70 border border-neutral-850 p-6 rounded-3xl relative flex flex-col justify-between hover:border-emerald-500/40 transition-colors group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{stage.icon}</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-neutral-800 text-emerald-400">
                  {stage.step}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 block mb-1">
                  {stage.label}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {stage.title}
                </h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {stage.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
