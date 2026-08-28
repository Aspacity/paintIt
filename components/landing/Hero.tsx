"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroRoomVisual from "./HeroRoomVisual";
import { useTheme } from "@/context/ThemeContext";

export default function Hero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className={`relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      {/* Subtle Ambient Radial Glow */}
      <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] pointer-events-none z-0 ${
        isDark ? "from-[#FF8C38]/20 via-transparent to-transparent" : "from-[#FF8C38]/15 via-transparent to-transparent"
      }`} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6 sm:mb-8 border ${
            isDark
              ? "bg-neutral-900 border-neutral-800 text-neutral-200"
              : "bg-[#EFECE6] border-stone-300/80 text-stone-800"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#FF8C38]" />
          <span>Paint & Interior Visualization Platform</span>
        </motion.div>

        {/* Expressive Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-sans max-w-4xl mx-auto leading-[1.1] ${
            isDark ? "text-white" : "text-stone-900"
          }`}
        >
          See it before you <span className="text-[#FF8C38] font-serif italic">paint it.</span>
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal ${
            isDark ? "text-neutral-300" : "text-stone-600"
          }`}
        >
          Visualize your space in different colours, finishes and lighting before you spend money, time or effort bringing those ideas to life.
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/search/designs"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-base font-bold shadow-lg hover:shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            Explore 3D Designs
          </Link>
          <a
            href="#how-it-works"
            className={`w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-semibold border shadow-xs transition-all text-center ${
              isDark
                ? "bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700"
                : "bg-white hover:bg-stone-100 text-stone-800 border-stone-300"
            }`}
          >
            Explore how it works
          </a>
        </motion.div>

        {/* Dual Audience Entry Selector */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`mt-8 pt-4 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm border-t ${
            isDark ? "border-neutral-800/80 text-neutral-400" : "border-stone-200/60 text-stone-600"
          }`}
        >
          <span className={`font-semibold uppercase tracking-wider text-[11px] ${
            isDark ? "text-neutral-300" : "text-stone-800"
          }`}>
            Tailored Path:
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/search/designs"
              className={`px-3.5 py-1.5 rounded-full font-medium transition border ${
                isDark
                  ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200"
                  : "bg-[#F4F1EA] hover:bg-[#EFECE6] border-stone-300/70 text-stone-800"
              }`}
            >
              🏠 I want to visualize my space
            </Link>
            <Link
              href="/register?role=painter"
              className={`px-3.5 py-1.5 rounded-full font-medium transition border ${
                isDark
                  ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200"
                  : "bg-[#F4F1EA] hover:bg-[#EFECE6] border-stone-300/70 text-stone-800"
              }`}
            >
              🎨 I'm a painting professional
            </Link>
          </div>
        </motion.div>

        {/* Hero Interactive Room Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <HeroRoomVisual />
        </motion.div>
      </div>
    </section>
  );
}