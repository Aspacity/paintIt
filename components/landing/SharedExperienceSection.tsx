"use client";

import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Create Your Concept",
    desc: "Set up the 3D room shell and pick your primary paint palette.",
  },
  {
    num: "02",
    title: "Select Finishes & Lighting",
    desc: "Apply Emulsion, Satin, or Gloss sheens and toggle daylight or night mode.",
  },
  {
    num: "03",
    title: "Generate Share Link",
    desc: "Click share to generate a lightweight web link for your client.",
  },
  {
    num: "04",
    title: "Client Explores on Device",
    desc: "Your client opens the link on their phone or laptop — no app install needed.",
  },
  {
    num: "05",
    title: "Decide & Paint",
    desc: "Align on the final concept with zero confusion and begin the project.",
  },
];

export default function SharedExperienceSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
          SHARED VISUAL EXPERIENCE
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Let your client explore the concept on their own device.
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Create a 3D visualization, copy the share link, and send it directly to your client.
        </p>
      </div>

      {/* WALKTHROUGH FLOW */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STEPS.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className="bg-neutral-900/60 border border-neutral-850 p-5 rounded-2xl space-y-3 relative flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400 block">
                {step.num}
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {step.title}
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
