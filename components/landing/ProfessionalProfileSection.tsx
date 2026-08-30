"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProfessionalProfileSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* LEFT MOCKUP DISPLAY */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 bg-neutral-900/80 border border-neutral-850 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl relative"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF8C38]/25 border border-[#FF8C38]/50 text-[#FF8C38] font-bold flex items-center justify-center text-sm">
                PRO
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Apex Paint & Decorating Studio</h4>
                <span className="text-[10px] font-mono text-neutral-400">Master Painter • Lagos, Nigeria</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#FF8C38]/15 text-[#FF8C38] font-mono text-[9px] font-bold uppercase">
              VERIFIED PROFILE
            </span>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">
              EXPERIENCE & SPECIALIZATIONS
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300">
                10+ Years Experience
              </span>
              <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300">
                Interior & Exterior Emulsions
              </span>
              <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300">
                Satin & Gloss Architectural Finishes
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800 space-y-3">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">
              PORTFOLIO SHOWCASE
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 rounded-xl bg-neutral-950 border border-neutral-800 p-3 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-[#FF8C38] font-bold">PROJECT #1</span>
                <span className="text-xs font-bold text-white">Luxury Living Room</span>
              </div>
              <div className="h-24 rounded-xl bg-neutral-950 border border-neutral-800 p-3 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-[#FF8C38] font-bold">PROJECT #2</span>
                <span className="text-xs font-bold text-white">Executive Bedroom Suite</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT EDITORIAL CONTENT */}
        <div className="lg:col-span-6 space-y-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF8C38] block">
            PROFESSIONAL PAINTER PROFILES
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
            Showcase your craftsmanship with a professional profile.
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            PaintIT isn't just a 3D visualizer — it's a professional platform. Build your profile, display your experience and skills, showcase your 3D design projects, and give prospective clients a clear, professional way to contact you.
          </p>

          <ul className="space-y-3 pt-2">
            <li className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#FF8C38] shrink-0 mt-1.5" />
              <span>Display your experience years, location, bio, and paint specializations</span>
            </li>
            <li className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#FF8C38] shrink-0 mt-1.5" />
              <span>Showcase past 3D room design concepts and finished paint projects</span>
            </li>
            <li className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#FF8C38] shrink-0 mt-1.5" />
              <span>Give potential clients a direct path to reach out and inquire about bookings</span>
            </li>
          </ul>

          <div className="pt-4">
            <a
              href="#early-access"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FF8C38]/70 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Build Your Painter Profile</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
