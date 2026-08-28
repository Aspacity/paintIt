"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface ColorOption {
  name: string;
  code: string;
  hex: string;
  bgFilterStyle: string;
}

interface FinishOption {
  id: string;
  name: string;
  sheenPercentage: string;
  description: string;
}

const DEMO_COLORS: ColorOption[] = [
  { name: "Light Amber Tone", code: "SW-6884", hex: "#FF8C38", bgFilterStyle: "rgba(255, 140, 56, 0.42)" },
  { name: "Nordic Sage", code: "SW-6184", hex: "#5A7361", bgFilterStyle: "rgba(90, 115, 97, 0.45)" },
  { name: "Terracotta Clay", code: "SW-6332", hex: "#C86D51", bgFilterStyle: "rgba(200, 109, 81, 0.42)" },
  { name: "Deep Navy Slate", code: "SW-6244", hex: "#3A4F59", bgFilterStyle: "rgba(58, 79, 89, 0.50)" },
  { name: "Earthy Olive", code: "SW-6178", hex: "#6B705C", bgFilterStyle: "rgba(107, 112, 92, 0.44)" },
];

const FINISH_OPTIONS: FinishOption[] = [
  { id: "matte", name: "Eggshell Matte", sheenPercentage: "0 - 10%", description: "Smooth low-sheen finish ideal for living areas and bedrooms." },
  { id: "satin", name: "Velvet Satin", sheenPercentage: "15 - 25%", description: "Slight pearl reflection for durable hallway and dining surfaces." },
  { id: "gloss", name: "Semi-Gloss", sheenPercentage: "35 - 50%", description: "High-durability moisture-resistant sheen for trim and cabinetry." },
];

export default function InteractiveDemoSection() {
  const [selectedColor, setSelectedColor] = useState<ColorOption>(DEMO_COLORS[0]);
  const [selectedFinish, setSelectedFinish] = useState<FinishOption>(FINISH_OPTIONS[0]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section id="interactive-demo" className={`py-16 sm:py-24 relative overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] mb-2 block">
            Interactive Product Studio
          </span>
          <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight font-sans leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Experience the decision <span className="font-serif italic text-[#FF8C38]">before making it.</span>
          </h2>
          <p className={`mt-4 text-base sm:text-lg font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Interact with live wall colors and finish sheens inside our digital studio interface.
          </p>
        </div>

        {/* Studio Workspace Showcase UI */}
        <div className={`border rounded-3xl p-4 sm:p-8 shadow-2xl transition-colors ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#F4F1EA] border-stone-300"
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Control Panel */}
            <div className="lg:col-span-4 space-y-6">
              {/* Color Swatch Picker */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-3 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                  1. Select Paint Tone
                </label>
                <div className="space-y-2.5">
                  {DEMO_COLORS.map((color) => {
                    const isSelected = selectedColor.code === color.code;
                    return (
                      <button
                        key={color.code}
                        onClick={() => setSelectedColor(color)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isSelected
                            ? isDark
                              ? "bg-neutral-800 border-[#FF8C38] text-white shadow-sm"
                              : "bg-white border-stone-900 text-stone-900 shadow-sm"
                            : isDark
                            ? "bg-black/70 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                            : "bg-[#FAF8F5]/80 border-stone-300 text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="text-left">
                            <p className="text-xs font-semibold">{color.name}</p>
                            <p className={`text-[10px] font-mono ${isDark ? "text-neutral-400" : "text-stone-500"}`}>{color.code}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-xs text-[#FF8C38] font-bold">Active</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Surface Sheen Presets */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-3 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                  2. Select Surface Finish
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FINISH_OPTIONS.map((finish) => (
                    <button
                      key={finish.id}
                      onClick={() => setSelectedFinish(finish)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedFinish.id === finish.id
                          ? "bg-[#FF8C38] text-black font-bold border-[#FF8C38]"
                          : isDark
                          ? "bg-black/70 border-neutral-800 text-neutral-400 hover:text-white"
                          : "bg-white border-stone-300 text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <p className="text-xs font-semibold">{finish.name.split(" ")[0]}</p>
                      <p className="text-[9px] opacity-80 mt-0.5">{finish.sheenPercentage}</p>
                    </button>
                  ))}
                </div>
                <p className={`text-[11px] mt-2 italic font-normal ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
                  {selectedFinish.description}
                </p>
              </div>
            </div>

            {/* Right Interactive Visualization Canvas */}
            <div className="lg:col-span-8 relative h-[360px] sm:h-[480px] rounded-2xl overflow-hidden border border-neutral-800 bg-black shadow-inner">
              <Image
                src="/images/painted_finished_room.jpg"
                alt="Studio Visualizer Preview"
                fill
                priority
                className="object-cover transition-all duration-500"
              />

              {/* Dynamic Color Blend Layer */}
              <div
                className="absolute inset-0 transition-all duration-500 pointer-events-none"
                style={{
                  backgroundColor: selectedColor.bgFilterStyle,
                  mixBlendMode: "multiply",
                }}
              />

              {/* Top Studio Bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C38]" />
                  <span className="text-xs font-mono tracking-tight text-neutral-300">
                    PaintIT Engine v2.4 • Render Active
                  </span>
                </div>
                <span className="text-xs font-semibold text-white">
                  {selectedColor.name} ({selectedFinish.name})
                </span>
              </div>

              {/* Bottom Canvas Overlay Metadata */}
              <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-neutral-800 text-xs text-neutral-300 flex items-center gap-3">
                <span>Coverage: <strong>~320 sq ft</strong></span>
                <span>•</span>
                <span>Reflectance Index: <strong>{selectedFinish.sheenPercentage}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
