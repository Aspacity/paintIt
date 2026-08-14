"use client";

import React from "react";
import { motion } from "framer-motion";

interface Step {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Pick Your Room Layout",
    subtitle: "Select a 3D room",
    description: "Choose a 3D room template or upload your space dimensions.",
    icon: "🏠",
  },
  {
    number: "02",
    title: "Choose Real Paint Brands",
    subtitle: "Real paint catalog",
    description: "Browse actual paint colors from Dulux, Sherwin-Williams, and Benjamin Moore.",
    icon: "🎨",
  },
  {
    number: "03",
    title: "Tap to Paint in 3D",
    subtitle: "Instant 3D transformation",
    description: "Tap any wall to see how colors look under realistic daylight and test matte, satin, or gloss shine.",
    icon: "✨",
  },
  {
    number: "04",
    title: "Share & Start Painting",
    subtitle: "Zero color confusion",
    description: "Send your 3D design to your painter, client, or family so everyone agrees before painting starts.",
    icon: "🤝",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-400 block">
          HOW IT WORKS
        </span>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Four Simple Steps to Perfect Room Colors
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-normal">
          No complicated CAD software. Just pick, tap, preview, and paint.
        </p>
      </div>

      {/* 4-Step Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-850 hover:border-neutral-750 transition-all space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{step.icon}</span>
              <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-emerald-400 transition-colors">
                {step.number}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">{step.title}</h3>
              <p className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider">{step.subtitle}</p>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-normal">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}