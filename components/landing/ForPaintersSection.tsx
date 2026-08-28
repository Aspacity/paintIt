"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function ForPaintersSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const workflowSteps = [
    { num: "01", title: "Understand Client Idea", desc: "Gather initial moodboards or preferred paint swatches from the homeowner." },
    { num: "02", title: "Create Concept", desc: "Build a 3D visual preview in PaintIT using exact paint codes and finishes." },
    { num: "03", title: "Present Interactively", desc: "Share a private link or present live on tablet during your client consultation." },
    { num: "04", title: "Client Approves Fast", desc: "Eliminate color uncertainty and reduce back-and-forth revision delays." },
    { num: "05", title: "Execute the Job", desc: "Order precise gallon estimates and deliver your expert craft with confidence." },
  ];

  return (
    <section id="for-painters-section" className={`py-16 sm:py-24 border-y transition-colors duration-300 ${
      isDark ? "bg-black border-neutral-800 text-white" : "bg-[#F4F1EA] border-stone-300/80 text-stone-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] block">
              Professional Contractor Suite
            </span>

            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight font-sans leading-tight ${isDark ? "text-white" : "text-stone-900"}`}>
              Your skill gets the job done. <span className="font-serif italic text-[#FF8C38]">PaintIT helps clients see it.</span>
            </h2>

            <p className={`text-base leading-relaxed font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              PaintIT does not replace the professional painter. It equips you with a modern presentation tool so prospective clients immediately understand the value of your craftsmanship.
            </p>

            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#FAF8F5] border-stone-300"
            }`}>
              <div className={`flex items-center gap-2 font-bold text-sm ${isDark ? "text-white" : "text-stone-900"}`}>
                <span>🛡️</span>
                <span>Contractor Guarantee</span>
              </div>
              <p className={`text-xs leading-normal font-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                Designed to bridge client expectations with field realities, speeding up project approvals and protecting bid margins.
              </p>
            </div>

            <div>
              <Link
                href="/register?role=painter"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-sm font-bold shadow-md transition-all"
              >
                Explore PaintIT for professionals
              </Link>
            </div>
          </div>

          {/* Right Column: 5-Step Workflow Cards */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
              The Painter Workflow Advantage:
            </h3>

            {workflowSteps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-4 transition-colors shadow-sm ${
                  isDark ? "bg-neutral-900 border-neutral-800 hover:border-[#FF8C38]/60" : "bg-[#FAF8F5] border-stone-300/80 hover:border-[#FF8C38]/60"
                }`}
              >
                <span className="w-9 h-9 rounded-xl bg-[#FF8C38]/20 text-[#FF8C38] font-bold text-sm flex items-center justify-center shrink-0 font-mono">
                  {step.num}
                </span>
                <div>
                  <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{step.title}</h4>
                  <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? "text-neutral-400" : "text-stone-600"}`}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
