"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface LightingState {
  id: string;
  time: string;
  title: string;
  description: string;
  brightness: string;
  sepia: string;
  hue: string;
  badgeBg: string;
  tag: string;
}

const LIGHTING_STATES: LightingState[] = [
  {
    id: "morning",
    time: "08:00 AM",
    title: "Morning East Light",
    description: "Cool, crisp daylight brings out subtle blue and green undertones. Light gray walls can feel significantly cooler.",
    brightness: "brightness(104%) contrast(100%)",
    sepia: "sepia(5%)",
    hue: "hue-rotate(-15deg)",
    badgeBg: "bg-sky-950/80 text-sky-300 border-sky-800",
    tag: "Cool & Crisp",
  },
  {
    id: "afternoon",
    time: "01:30 PM",
    title: "Direct Afternoon Sun",
    description: "High intensity, neutral white illumination renders colors true to swatch cards but amplifies wall texture and sheen.",
    brightness: "brightness(110%) contrast(105%)",
    sepia: "sepia(10%)",
    hue: "hue-rotate(0deg)",
    badgeBg: "bg-amber-950/80 text-amber-300 border-amber-800",
    tag: "High Intensity",
  },
  {
    id: "evening",
    time: "07:45 PM",
    title: "Warm Evening Lamp Light",
    description: "Low-kelvin warm artificial lighting casts golden hues, turning cool sage tones warm and deepening dark neutrals.",
    brightness: "brightness(90%) contrast(108%)",
    sepia: "sepia(35%)",
    hue: "hue-rotate(20deg)",
    badgeBg: "bg-orange-950/80 text-orange-300 border-orange-800",
    tag: "Golden Hour",
  },
];

export default function ProblemSection() {
  const [activeState, setActiveState] = useState<LightingState>(LIGHTING_STATES[0]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className={`py-16 sm:py-24 border-y transition-colors duration-300 ${
      isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-[#F4F1EA] border-stone-300/60 text-stone-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] mb-2 block">
            The Context Factor
          </span>
          <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight font-sans leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            A colour can look <span className="font-serif italic text-[#FF8C38]">very different</span> on your wall.
          </h2>
          <p className={`mt-4 text-base sm:text-lg leading-relaxed font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Lighting, surrounding furniture, room scale, and surface finish drastically alter how paint feels throughout the day. PaintIT helps you explore these shifts visually before you commit.
          </p>
        </div>

        {/* Interactive Lighting Shift Demo */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 rounded-3xl border shadow-2xl ${
          isDark ? "bg-black border-neutral-800" : "bg-[#FAF8F5] border-stone-300/80"
        }`}>
          {/* Left Column: Interactive State Controls */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
              Select Lighting Conditions:
            </h3>

            {LIGHTING_STATES.map((state) => {
              const isActive = activeState.id === state.id;
              return (
                <button
                  key={state.id}
                  onClick={() => setActiveState(state)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    isActive
                      ? isDark
                        ? "bg-neutral-900 border-[#FF8C38] shadow-md ring-1 ring-[#FF8C38]/30"
                        : "bg-white border-stone-900 shadow-sm ring-1 ring-stone-900/10"
                      : isDark
                      ? "bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700"
                      : "bg-[#F4F1EA]/60 border-stone-200 hover:bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold tracking-wide ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
                      {state.time}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${state.badgeBg}`}
                    >
                      {state.tag}
                    </span>
                  </div>
                  <h4 className={`text-base font-bold mb-1 ${isDark ? "text-white" : "text-stone-900"}`}>
                    {state.title}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                    {state.description}
                  </p>
                </button>
              );
            })}

            <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
              isDark ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-[#EFECE6] border-stone-300/60 text-stone-700"
            }`}>
              <span className="text-base">💡</span>
              <p className="leading-normal">
                <strong>Did you know?</strong> 74% of homeowners regret paint purchases because they evaluated swatches under store fluorescents rather than actual room light.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Room Room under Active Lighting */}
          <div className="lg:col-span-7 relative h-[340px] sm:h-[450px] rounded-2xl overflow-hidden border border-neutral-800 shadow-inner bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeState.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full"
              >
                <Image
                  src="/images/painted_finished_room.jpg"
                  alt={`Room in ${activeState.title}`}
                  fill
                  priority
                  className="object-cover transition-all duration-700"
                  style={{
                    filter: `${activeState.brightness} ${activeState.sepia} ${activeState.hue}`,
                  }}
                />

                {/* Subtle Amber Overlay */}
                <div
                  className="absolute inset-0 bg-[#FF8C38]/20 pointer-events-none"
                  style={{ mixBlendMode: "multiply" }}
                />

                {/* Live Floating Metadata Badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-black/90 backdrop-blur-md text-white p-3 rounded-xl border border-neutral-800 shadow-lg flex items-center justify-between sm:justify-start gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C38]" />
                    <span className="text-xs font-semibold">{activeState.title}</span>
                  </div>
                  <span className="text-neutral-400 text-xs border-l border-neutral-800 pl-4 font-mono">
                    {activeState.time}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
