"use client";

import React from "react";
import { motion } from "framer-motion";

export default function TrustSignalSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-neutral-950 border border-neutral-900 rounded-3xl p-8 sm:p-12 text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold text-[#22C55E] uppercase tracking-widest">
          SHARED 3D VISUALIZATION HUB
        </div>

        <blockquote className="text-lg sm:text-2xl font-medium text-white max-w-2xl mx-auto leading-relaxed">
          &ldquo;Being able to see our exact living room wall colors in 3D under daylight before hiring our painter eliminated all our anxiety. The project was finished without a single color disagreement.&rdquo;
        </blockquote>

        <div className="pt-2 text-xs font-mono text-neutral-400">
          — Homeowner & Professional Painter Collaboration • <span className="text-[#22C55E]">Early Access Beta</span>
        </div>
      </motion.div>
    </section>
  );
}
