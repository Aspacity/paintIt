"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function TwoSidesSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className={`py-16 sm:py-24 border-y transition-colors duration-300 ${
      isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-[#EFECE6] border-stone-300/70 text-stone-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] mb-2 block">
            Dual Audience Architecture
          </span>
          <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight font-sans leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            One space. <span className="font-serif italic text-[#FF8C38]">Two perspectives.</span>
          </h2>
          <p className={`mt-4 text-base sm:text-lg font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Whether you are planning your own room or running a painting business, PaintIT creates a shared visual language so everyone sees the exact same vision.
          </p>
        </div>

        {/* Two Audience Cards Layout */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Central Connecting Badge (Desktop) */}
          <div className={`hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full border-4 shadow-xl items-center justify-center text-xs font-bold font-mono ${
            isDark ? "bg-[#FF8C38] text-black border-black" : "bg-[#1C1917] text-[#FAF8F5] border-[#FAF8F5]"
          }`}>
            VS
          </div>

          {/* LEFT: For Homeowners */}
          <motion.div
            id="for-homeowners"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-8 sm:p-10 rounded-3xl border shadow-xl flex flex-col justify-between relative overflow-hidden group transition-colors ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#FAF8F5] border-stone-300"
            }`}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF8C38]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-6 border ${
                isDark ? "bg-[#FF8C38]/15 text-[#FF8C38] border-[#FF8C38]/30" : "bg-[#C86D51]/10 text-[#C86D51] border-[#C86D51]/30"
              }`}>
                <span>🏠</span>
                <span>For Homeowners</span>
              </div>

              <h3 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-stone-900"}`}>
                Visualize. Explore. Decide.
              </h3>

              <p className={`text-sm sm:text-base leading-relaxed mb-6 font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                Have an idea for your space? Explore colours and see how they could transform the room before you commit time, effort or money.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  "Explore colour ideas in realistic lighting",
                  "Compare side-by-side room options effortlessly",
                  "See your space in context before buying paint",
                  "Share your exact concept with your painter",
                  "Make colour decisions with total confidence",
                ].map((benefit, idx) => (
                  <div key={idx} className={`flex items-start gap-3 text-xs sm:text-sm ${isDark ? "text-neutral-300" : "text-stone-700"}`}>
                    <span className="w-5 h-5 rounded-full bg-[#FF8C38]/20 text-[#FF8C38] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/search/designs"
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-full bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-sm shadow-md transition-all text-center"
            >
              Visualize my space
            </Link>
          </motion.div>

          {/* RIGHT: For Painters */}
          <motion.div
            id="for-painters"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-8 sm:p-10 rounded-3xl border shadow-xl flex flex-col justify-between relative overflow-hidden group transition-colors ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#FAF8F5] border-stone-300"
            }`}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-6 border ${
                isDark ? "bg-neutral-800 text-orange-300 border-neutral-700" : "bg-[#5A7361]/10 text-[#5A7361] border-[#5A7361]/30"
              }`}>
                <span>🎨</span>
                <span>For Painting Professionals</span>
              </div>

              <h3 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-stone-900"}`}>
                Create concepts. Win more jobs.
              </h3>

              <p className={`text-sm sm:text-base leading-relaxed mb-6 font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                Turn your professional knowledge into something clients can see, understand and respond to immediately.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  "Create visual room concepts in minutes",
                  "Present clear visual ideas to prospective clients",
                  "Reduce client uncertainty and revision delays",
                  "Communicate colour & finish choices visually",
                  "Help clients make decisions faster to close bids",
                ].map((benefit, idx) => (
                  <div key={idx} className={`flex items-start gap-3 text-xs sm:text-sm ${isDark ? "text-neutral-300" : "text-stone-700"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isDark ? "bg-neutral-800 text-[#FF8C38] border border-neutral-700" : "bg-[#5A7361]/15 text-[#5A7361]"
                    }`}>
                      ✓
                    </span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/register?role=painter"
              className={`inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold border transition-all text-center ${
                isDark ? "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700" : "bg-[#5A7361] hover:bg-[#4a6150] text-white border-transparent"
              }`}
            >
              I'm a painting professional
            </Link>
          </motion.div>
        </div>

        {/* Bottom Connecting Narrative Bar */}
        <div className={`mt-12 p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
          isDark ? "bg-black text-white border-neutral-800" : "bg-[#1C1917] text-[#FAF8F5] border-stone-800"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            <div>
              <p className="text-sm font-bold">The PaintIT Shared Vision Bridge</p>
              <p className={`text-xs ${isDark ? "text-neutral-400" : "text-stone-400"}`}>
                Homeowner has the idea. Painter has the skill. PaintIT helps them meet in the middle.
              </p>
            </div>
          </div>
          <a
            href="#connection"
            className="shrink-0 text-xs font-bold text-[#FF8C38] hover:underline"
          >
            See how it connects →
          </a>
        </div>
      </div>
    </section>
  );
}
