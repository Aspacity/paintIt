"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function ShareCollaborateSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const shareSteps = [
    { step: "01", title: "Create Concept", desc: "Customize wall colors and lighting in your PaintIT workspace." },
    { step: "02", title: "Generate Link", desc: "Click share to create an instant interactive visual concept URL." },
    { step: "03", title: "Painter Reviews", desc: "Contractor opens the link on mobile to review spatial requirements." },
    { step: "04", title: "Approve Direction", desc: "Align on paint quantities, finishes, and project start date with confidence." },
  ];

  return (
    <section className={`py-16 sm:py-24 border-y transition-colors duration-300 ${
      isDark ? "bg-black border-neutral-800 text-white" : "bg-[#EFECE6] border-stone-300/80 text-stone-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] mb-2 block">
            Seamless Collaboration
          </span>
          <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight font-sans leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            See it. Share it. <span className="font-serif italic text-[#FF8C38]">Decide together.</span>
          </h2>
          <p className={`mt-4 text-base sm:text-lg font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Eliminate miscommunication between client vision and contractor execution with one-click interactive concept sharing.
          </p>
        </div>

        {/* Share Link Interactive Mock Card */}
        <div className={`max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border shadow-2xl transition-colors ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#FAF8F5] border-stone-300"
        }`}>
          <div className={`flex items-center justify-between p-3 rounded-xl border mb-8 text-xs font-mono ${
            isDark ? "bg-black border-neutral-800 text-neutral-300" : "bg-[#EFECE6] border-stone-300 text-stone-700"
          }`}>
            <span className="truncate mr-4">
              https://paintit.studio/concept/share?id=living-room-amber-v2
            </span>
            <button
              onClick={() => alert("Sample link copied to clipboard!")}
              className="px-3 py-1 bg-[#FF8C38] text-black font-sans text-[11px] font-bold rounded-md shrink-0 hover:bg-[#ff9e54] transition"
            >
              Copy Link
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shareSteps.map((item) => (
              <div key={item.step} className={`p-4 rounded-2xl border text-left transition-colors ${
                isDark ? "bg-neutral-950 border-neutral-800" : "bg-[#F4F1EA] border-stone-300/70"
              }`}>
                <span className="text-xs font-bold font-mono text-[#FF8C38] block mb-1">
                  {item.step}
                </span>
                <h4 className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-stone-900"}`}>{item.title}</h4>
                <p className={`text-[11px] leading-relaxed font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
