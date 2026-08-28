"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function FinalCTASection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className={`py-20 sm:py-28 relative overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#1C1917] text-[#FAF8F5]"
    }`}>
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-[#FF8C38]/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] block">
            Ready to Transform Your Workflow?
          </span>

          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white font-sans leading-tight">
            Stop guessing. <span className="font-serif italic text-[#FF8C38]">Start seeing.</span>
          </h2>

          <p className="text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Explore your next colour decision in realistic light and context before you spend money, time or effort.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search/designs"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-base font-bold shadow-lg hover:shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 text-center"
            >
              Explore 3D Rooms
            </Link>
            <Link
              href="/register?role=painter"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-base font-semibold border border-neutral-700 shadow-xs transition-all text-center"
            >
              I'm a professional
            </Link>
          </div>

          <div className="pt-6 text-xs text-neutral-500 font-medium">
            No credit card required • Instant interactive 3D room access
          </div>
        </motion.div>
      </div>
    </section>
  );
}
