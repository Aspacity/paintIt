"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function ConnectionStorySection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section id="connection" className={`py-16 sm:py-24 relative overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] mb-2 block">
            The Shared Connection
          </span>
          <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight font-sans leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Connecting vision to <span className="font-serif italic text-[#FF8C38]">craft.</span>
          </h2>
        </div>

        {/* 3 Step Visual Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-center">
          {/* Connecting Arrow Lines (Desktop) */}
          <div className={`hidden md:block absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 font-bold text-3xl z-10 ${
            isDark ? "text-neutral-600" : "text-stone-300"
          }`}>
            →
          </div>
          <div className={`hidden md:block absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 font-bold text-3xl z-10 ${
            isDark ? "text-neutral-600" : "text-stone-300"
          }`}>
            →
          </div>

          {/* STEP 1: HOMEOWNER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`p-8 rounded-3xl border text-center space-y-4 shadow-xl transition-colors ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#F4F1EA] border-stone-300/80"
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl border mx-auto flex items-center justify-center text-2xl shadow-xs ${
              isDark ? "bg-black border-neutral-800" : "bg-white border-stone-300"
            }`}>
              🏡
            </div>
            <span className="text-xs font-bold text-[#FF8C38] uppercase tracking-wider block">
              1. Homeowner
            </span>
            <blockquote className={`text-xl font-serif italic leading-snug ${isDark ? "text-white" : "text-stone-900"}`}>
              "I have an idea for my space."
            </blockquote>
            <p className={`text-xs leading-relaxed font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              Exploring possibilities, testing color directions, and desiring certainty before starting work.
            </p>
          </motion.div>

          {/* STEP 2: PAINTIT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`p-8 rounded-3xl border-2 border-[#FF8C38] text-center space-y-4 shadow-2xl scale-105 transition-colors ${
              isDark ? "bg-neutral-900 text-white" : "bg-[#1C1917] text-[#FAF8F5]"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF8C38] text-black mx-auto flex items-center justify-center text-2xl font-bold shadow-md">
              ✨
            </div>
            <span className="text-xs font-bold text-[#FF8C38] uppercase tracking-wider block">
              2. PaintIT Studio
            </span>
            <blockquote className="text-xl font-serif italic leading-snug">
              "Let's see it."
            </blockquote>
            <p className={`text-xs leading-relaxed font-normal ${isDark ? "text-neutral-300" : "text-stone-300"}`}>
              Translating vague color thoughts into instant, high-fidelity visual context under real lighting.
            </p>
          </motion.div>

          {/* STEP 3: PAINTER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`p-8 rounded-3xl border text-center space-y-4 shadow-xl transition-colors ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#F4F1EA] border-stone-300/80"
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl border mx-auto flex items-center justify-center text-2xl shadow-xs ${
              isDark ? "bg-black border-neutral-800" : "bg-white border-stone-300"
            }`}>
              🛠️
            </div>
            <span className="text-xs font-bold text-[#FF8C38] uppercase tracking-wider block">
              3. Painting Professional
            </span>
            <blockquote className={`text-xl font-serif italic leading-snug ${isDark ? "text-white" : "text-stone-900"}`}>
              "I can bring it to life."
            </blockquote>
            <p className={`text-xs leading-relaxed font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              Receiving approved visual briefs, ordering exact paint quantities, and delivering flawless results.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
