"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const PAINTER_BENEFITS = [
  {
    title: "Communicate Concepts Clearly",
    description: "Move past describing undertones or warm whites with words. Show full 3D concepts your client can explore on screen.",
    icon: "💬",
  },
  {
    title: "Reduce Revise & Delay Cycles",
    description: "Avoid post-painting surprises or mid-project color changes by aligning on the exact shade and finish upfront.",
    icon: "⏱️",
  },
  {
    title: "Share Interactive Visual Links",
    description: "Send your client a shareable link after an estimate. Let them review colour choices at home with complete confidence.",
    icon: "🔗",
  },
  {
    title: "Build a Digital Project Showcase",
    description: "Create your professional painter profile, display past 3D room transformations, and let new clients reach out directly.",
    icon: "💼",
  },
];

export default function ForPaintersSection() {
  return (
    <section id="for-painters" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* LEFT EDITORIAL HEADER */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
            FOR PROFESSIONAL PAINTERS
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
            You already have the skill. Help clients see it.
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            PaintIT doesn't change how you prep or paint — it changes how you communicate. Give your clients something they can actually see, explore, and approve before you buy the first tin of paint.
          </p>

          <div className="pt-2">
            <a
              href="#early-access"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all"
            >
              <span>Get Started with PaintIT</span>
              <span>→</span>
            </a>
          </div>
        </div>

        {/* RIGHT BENEFIT CARDS */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PAINTER_BENEFITS.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-neutral-900/60 border border-neutral-850 p-6 rounded-3xl space-y-3 hover:border-neutral-750 transition-colors"
            >
              <span className="text-2xl">{benefit.icon}</span>
              <h3 className="text-base font-bold text-white tracking-tight">
                {benefit.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
