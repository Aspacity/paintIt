"use client";

import React from "react";
import { motion } from "framer-motion";

const HOW_IT_WORKS_STEPS = [
  {
    num: "01",
    label: "Create",
    title: "Start with a space",
    desc: "Select a 3D room shell and set up your initial paint concept.",
  },
  {
    num: "02",
    label: "Explore",
    title: "Test colours & finishes",
    desc: "Experiment with wall colors, Emulsion or Gloss finishes, and day/night lighting.",
  },
  {
    num: "03",
    label: "Share",
    title: "Send to your client",
    desc: "Generate an interactive link so your client can explore the 3D room on any device.",
  },
  {
    num: "04",
    label: "Decide",
    title: "Proceed with clarity",
    desc: "Align on the exact final concept with zero confusion and begin painting.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF8C38]">
          HOW IT WORKS
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Four simple steps to visual clarity.
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          From concept creation to final decision — PaintIT simplifies every stage of the paint communication process.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {HOW_IT_WORKS_STEPS.map((step, idx) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-neutral-900/60 border border-neutral-850 p-6 rounded-3xl space-y-4 relative flex flex-col justify-between hover:border-[#FF8C38]/50 transition-colors"
          >
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-[#FF8C38] inline-block">
                {step.num} — {step.label}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {step.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
