"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  visualTag: string;
  visualContent: (isDark: boolean) => React.ReactNode;
}

export default function ProcessSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const steps: Step[] = [
    {
      number: "01",
      title: "Choose your space",
      description: "Upload a photo of your actual room or select from our high-resolution architectural 3D layout templates.",
      icon: "📐",
      accent: "border-[#FF8C38]",
      visualTag: "Step 1 Visual",
      visualContent: (dark) => (
        <div className={`w-full h-36 rounded-xl p-3 flex flex-col justify-between border relative overflow-hidden transition-colors ${
          dark ? "bg-neutral-950 border-neutral-800 text-neutral-200" : "bg-stone-200/80 border-stone-300 text-stone-800"
        }`}>
          <div className={`flex items-center justify-between text-[11px] font-semibold ${dark ? "text-neutral-400" : "text-stone-600"}`}>
            <span>Living Room Layout</span>
            <span className={`px-2 py-0.5 rounded text-[10px] ${dark ? "bg-neutral-800 text-neutral-300" : "bg-stone-300 text-stone-800"}`}>Photo Upload</span>
          </div>
          <div className="flex items-center justify-center gap-3 my-auto">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-xs border ${
              dark ? "bg-neutral-900 border-neutral-800" : "bg-stone-300/80 border-stone-400/40"
            }`}>
              📷
            </div>
            <div className="text-left">
              <p className={`text-xs font-semibold ${dark ? "text-white" : "text-stone-900"}`}>Master Bedroom.jpg</p>
              <p className={`text-[10px] ${dark ? "text-neutral-400" : "text-stone-500"}`}>Auto-detected surfaces: 4 Walls, Ceiling</p>
            </div>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${dark ? "bg-neutral-900" : "bg-stone-300"}`}>
            <div className="bg-[#FF8C38] h-full w-full animate-pulse" />
          </div>
        </div>
      ),
    },
    {
      number: "02",
      title: "Explore colours",
      description: "Experiment with curated paint brand swatches, custom HEX tones, accent wall splits, and surface sheens.",
      icon: "🎨",
      accent: "border-[#FF8C38]",
      visualTag: "Step 2 Visual",
      visualContent: (dark) => (
        <div className={`w-full h-36 rounded-xl p-3 flex flex-col justify-between border transition-colors ${
          dark ? "bg-neutral-950 border-neutral-800 text-neutral-200" : "bg-stone-200/80 border-stone-300 text-stone-800"
        }`}>
          <div className={`flex items-center justify-between text-[11px] font-semibold ${dark ? "text-neutral-400" : "text-stone-600"}`}>
            <span>Palette Swatches</span>
            <span className="text-[10px] text-[#FF8C38] font-bold">5 Colors Tested</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 my-auto">
            {[
              { hex: "#FF8C38", label: "Amber" },
              { hex: "#5A7361", label: "Sage" },
              { hex: "#C86D51", label: "Clay" },
              { hex: "#547582", label: "Slate" },
              { hex: "#D4B896", label: "Sand" },
            ].map((swatch, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-lg border shadow-xs transition-transform ${
                    idx === 0 ? "scale-110 ring-2 ring-[#FF8C38]" : ""
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className={`text-[9px] font-medium ${dark ? "text-neutral-400" : "text-stone-600"}`}>{swatch.label}</span>
              </div>
            ))}
          </div>
          <div className={`text-[10px] text-center font-medium ${dark ? "text-neutral-400" : "text-stone-500"}`}>
            Active: Warm Amber (Eggshell Matte)
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: "See it in context",
      description: "Simulate daylight shifts from early morning to warm evening lamp light to view true color performance.",
      icon: "☀️",
      accent: "border-[#FF8C38]",
      visualTag: "Step 3 Visual",
      visualContent: (dark) => (
        <div className={`w-full h-36 rounded-xl p-3 flex flex-col justify-between border transition-colors ${
          dark ? "bg-neutral-950 border-neutral-800 text-neutral-200" : "bg-stone-200/80 border-stone-300 text-stone-800"
        }`}>
          <div className={`flex items-center justify-between text-[11px] font-semibold ${dark ? "text-neutral-400" : "text-stone-600"}`}>
            <span>Lighting Simulation</span>
            <span className={`text-[10px] font-mono ${dark ? "text-neutral-400" : "text-stone-700"}`}>5000K → 2700K</span>
          </div>
          <div className="flex items-center justify-around my-auto text-center">
            <div className={`p-2 rounded-lg text-xs font-medium border ${dark ? "bg-sky-950/70 text-sky-300 border-sky-800" : "bg-sky-100/80 text-sky-900 border-sky-200"}`}>
              <span className="block text-sm">🌅</span>
              <span>Morning</span>
            </div>
            <div className={`font-bold ${dark ? "text-neutral-500" : "text-stone-400"}`}>→</div>
            <div className={`p-2 rounded-lg text-xs font-semibold border shadow-xs scale-105 ${dark ? "bg-amber-950/80 text-amber-300 border-amber-800" : "bg-amber-100/80 text-amber-900 border-amber-300"}`}>
              <span className="block text-sm">☀️</span>
              <span>Midday</span>
            </div>
            <div className={`font-bold ${dark ? "text-neutral-500" : "text-stone-400"}`}>→</div>
            <div className={`p-2 rounded-lg text-xs font-medium border ${dark ? "bg-orange-950/70 text-orange-300 border-orange-800" : "bg-orange-100/80 text-orange-900 border-orange-200"}`}>
              <span className="block text-sm">🌙</span>
              <span>Evening</span>
            </div>
          </div>
          <div className={`text-[10px] text-center font-medium ${dark ? "text-neutral-400" : "text-stone-500"}`}>
            Shadow & Reflection Accuracy Applied
          </div>
        </div>
      ),
    },
    {
      number: "04",
      title: "Decide with confidence",
      description: "Save your final visual room concept, generate paint quantity estimates, or share directly with your painter.",
      icon: "✨",
      accent: "border-[#FF8C38]",
      visualTag: "Step 4 Visual",
      visualContent: (dark) => (
        <div className={`w-full h-36 rounded-xl p-3 flex flex-col justify-between border transition-colors ${
          dark ? "bg-neutral-950 border-neutral-800 text-neutral-200" : "bg-stone-200/80 border-stone-300 text-stone-800"
        }`}>
          <div className={`flex items-center justify-between text-[11px] font-semibold ${dark ? "text-neutral-400" : "text-stone-600"}`}>
            <span>Concept Approved</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              dark ? "bg-emerald-950 text-emerald-300 border-emerald-800" : "bg-emerald-100 text-emerald-800 border-emerald-300"
            }`}>
              Ready to Paint
            </span>
          </div>
          <div className={`p-2.5 rounded-lg border text-left my-auto space-y-1 ${
            dark ? "bg-neutral-900 border-neutral-800" : "bg-white border-stone-300"
          }`}>
            <div className={`flex justify-between items-center text-xs font-bold ${dark ? "text-white" : "text-stone-900"}`}>
              <span>Selected Tone: Amber Eggshell</span>
              <span className={`text-[10px] font-normal ${dark ? "text-neutral-400" : "text-stone-500"}`}>Est. 2 Gallons</span>
            </div>
            <p className={`text-[10px] ${dark ? "text-neutral-400" : "text-stone-600"}`}>
              Share link generated for Painter Brief.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="w-full py-1 text-center bg-[#FF8C38] text-black rounded text-[10px] font-bold">
              Share Concept Link
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className={`py-16 sm:py-24 transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] mb-2 block">
            Simple 4-Step Journey
          </span>
          <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight font-sans leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            How PaintIT brings your <span className="font-serif italic text-[#FF8C38]">ideas to life.</span>
          </h2>
          <p className={`mt-4 text-base sm:text-lg font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            From initial photo upload to final painter brief—experience your space before committing a single drop of paint.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`p-6 rounded-3xl border ${step.accent} border-t-4 shadow-xl flex flex-col justify-between transition-colors ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#F4F1EA] border-stone-300/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-2xl font-bold font-mono ${isDark ? "text-neutral-600" : "text-stone-400"}`}>
                    {step.number}
                  </span>
                  <span className="text-2xl">{step.icon}</span>
                </div>

                <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-stone-900"}`}>
                  {step.title}
                </h3>
                <p className={`text-xs leading-relaxed mb-6 font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                  {step.description}
                </p>
              </div>

              {/* Rich Visual Mini Card */}
              {step.visualContent(isDark)}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
