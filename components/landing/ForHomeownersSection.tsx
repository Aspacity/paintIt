"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function ForHomeownersSection() {
  const [selectedStage, setSelectedStage] = useState<"raw" | "options" | "final">("final");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className={`py-16 sm:py-24 relative overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-neutral-950 text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] mb-2 block">
            Homeowner Decision Journey
          </span>
          <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight font-sans leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Not sure what colour <span className="font-serif italic text-[#FF8C38]">belongs in your space?</span>
          </h2>
          <p className={`mt-4 text-base sm:text-lg font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Explore endless wall shade possibilities in context before you buy sample pots or paint a single brush stroke.
          </p>
        </div>

        {/* Stage Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex p-1.5 rounded-full border gap-1 ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#EFECE6] border-stone-300"
          }`}>
            <button
              onClick={() => setSelectedStage("raw")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedStage === "raw"
                  ? "bg-[#FF8C38] text-black shadow-xs font-bold"
                  : isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              1. Original Blank Space
            </button>
            <button
              onClick={() => setSelectedStage("options")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedStage === "options"
                  ? "bg-[#FF8C38] text-black shadow-xs font-bold"
                  : isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              2. Test Swatch Options
            </button>
            <button
              onClick={() => setSelectedStage("final")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedStage === "final"
                  ? "bg-[#FF8C38] text-black shadow-xs font-bold"
                  : isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              3. Final Approved Concept ✨
            </button>
          </div>
        </div>

        {/* Dynamic Transformation Card Showcase */}
        <div className={`max-w-4xl mx-auto rounded-3xl border p-4 sm:p-6 shadow-2xl overflow-hidden transition-colors ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#F4F1EA] border-stone-300"
        }`}>
          <div className="relative h-[320px] sm:h-[460px] rounded-2xl overflow-hidden bg-black">
            {selectedStage === "raw" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full">
                <Image
                  src="/images/raw_unpainted_room.jpg"
                  alt="Original Blank Space"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full border border-neutral-800">
                  Step 1: Raw Unpainted Space
                </div>
              </motion.div>
            )}

            {selectedStage === "options" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full">
                <Image
                  src="/images/painted_finished_room.jpg"
                  alt="Testing Color Possibilities"
                  fill
                  className="object-cover"
                  style={{ filter: "brightness(102%) contrast(100%)" }}
                />
                <div
                  className="absolute inset-0 bg-[#547582]/40"
                  style={{ mixBlendMode: "multiply" }}
                />
                <div className="absolute top-4 left-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full border border-neutral-800">
                  Step 2: Testing Nordic Slate Swatch
                </div>
              </motion.div>
            )}

            {selectedStage === "final" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full">
                <Image
                  src="/images/painted_finished_room.jpg"
                  alt="Final Approved Concept"
                  fill
                  className="object-cover"
                  style={{ filter: "brightness(105%) contrast(102%)" }}
                />
                <div
                  className="absolute inset-0 bg-[#FF8C38]/38"
                  style={{ mixBlendMode: "multiply" }}
                />
                <div className="absolute top-4 left-4 bg-[#FF8C38] text-black font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
                  Step 3: Selected Warm Amber Concept
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <div>
              <p className={`text-base font-bold ${isDark ? "text-white" : "text-stone-900"}`}>Explore before you commit.</p>
              <p className={`text-xs ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Save hours of guesswork and eliminate regret before buying paint.</p>
            </div>
            <Link
              href="/search/designs"
              className="px-6 py-3 rounded-full bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold shadow-md transition-all shrink-0"
            >
              Explore 3D Rooms
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
