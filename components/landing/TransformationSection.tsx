"use client";

import React from "react";
import { motion } from "framer-motion";

const HUB_TRANSFORMATIONS = [
  {
    role: "FOR HOMEOWNERS",
    title: "100% Color & Sheen Confidence",
    description: "Experience wall paint colors, sheens (Matte, Satin, High Gloss), and daylight/night lighting on real 3D room spaces. Make decisions with total clarity before hiring.",
  },
  {
    role: "FOR PAINTERS",
    title: "Win Jobs & End Unpaid Repaints",
    description: "Present high-fidelity 3D proposals that justify premium pricing. Get instant client sign-offs and connect with serious homeowners actively designing their spaces.",
  },
  {
    role: "SHARED WORKFLOW",
    title: "One Connected 3D Canvas",
    description: "Both homeowners and painters collaborate off the exact same 3D room visualization. No guesswork, no miscommunication, and zero color disputes after painting begins.",
  },
];

export default function TransformationSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-neutral-900">
      <div className="mb-12">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22C55E] block mb-2">
          THE DUAL VALUE HUB
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Designed for homeowners. Powered for professional painters.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HUB_TRANSFORMATIONS.map((item, idx) => (
          <motion.div
            key={item.role}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-neutral-950 border border-neutral-900 hover:border-neutral-800 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6 transition-colors"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-[#22C55E] uppercase tracking-wider block bg-neutral-900 px-2.5 py-1 rounded-md w-fit border border-neutral-800">
                {item.role}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
