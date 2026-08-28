"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function WhyVisualizationSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pillars = [
    {
      title: "See the difference",
      description: "Understand how colours interact with room scale, natural light angles, and existing furnishings in real context.",
      icon: "👁️",
      accent: "text-[#FF8C38]",
    },
    {
      title: "Communicate clearly",
      description: "Show a living visual concept instead of trying to explain complex undertones or accent wall directions with words alone.",
      icon: "💬",
      accent: "text-[#FF8C38]",
    },
    {
      title: "Decide with confidence",
      description: "Explore dozens of room combinations risk-free before spending money on paint cans, primer, or professional labor.",
      icon: "🎯",
      accent: "text-[#FF8C38]",
    },
  ];

  return (
    <section className={`py-16 sm:py-24 border-b transition-colors duration-300 ${
      isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-[#FAF8F5] border-stone-200/80 text-stone-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] mb-2 block">
            Core Philosophy
          </span>
          <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight font-sans leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Why visualization <span className="font-serif italic text-[#FF8C38]">changes everything.</span>
          </h2>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`p-8 rounded-3xl border shadow-xl hover:border-neutral-700 transition-colors group ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#F4F1EA] border-stone-300/80"
              }`}
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl mb-6 shadow-xs group-hover:scale-110 transition-transform ${
                  isDark ? "bg-black border-neutral-800" : "bg-white border-stone-300"
                }`}>
                  {pillar.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-stone-900"}`}>
                  {pillar.title}
                </h3>
                <p className={`text-sm leading-relaxed font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                  {pillar.description}
                </p>
              </div>

              <div className={`mt-8 pt-4 border-t flex items-center justify-between text-xs font-semibold ${
                isDark ? "border-neutral-800" : "border-stone-300/60"
              }`}>
                <span className={pillar.accent}>Explore Feature</span>
                <span className={`group-hover:translate-x-1 transition-transform ${isDark ? "text-neutral-500" : "text-stone-400"}`}>→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
