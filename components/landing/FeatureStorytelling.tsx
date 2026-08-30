"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FEATURES = [
  {
    id: "visualize",
    tabLabel: "01 / VISUALIZE SPACE",
    title: "Explore concepts inside 3D rooms",
    description: "Move beyond 2D paper paint swatches. Preview your colour ideas inside realistic 3D room geometries to understand spatial depth and proportions.",
    details: ["Real-time 3D room navigation", "Locked eye-level camera orbit", "Accurate wall surface boundaries"],
    badge: "3D SPATIAL ENGINE",
  },
  {
    id: "paint",
    tabLabel: "02 / PAINT WALLS",
    title: "Tap to paint individual walls",
    description: "Test accent walls, trim contrasts, and complete room combinations in seconds. Simply double-tap any surface to apply paint colors instantly.",
    details: ["Independent wall color isolation", "Instant paint swatch application", "Unlimited color combinations"],
    badge: "SURFACE CONTROLS",
  },
  {
    id: "finishes",
    tabLabel: "03 / EXPLORE FINISHES",
    title: "Compare Emulsion, Satin & Gloss",
    description: "Paint isn't just about color — it's about reflection. Preview real paint sheens including velvety Matte Emulsion, soft Satin, and high specular Gloss.",
    details: ["Real-time sheen specular maps", "Matte Emulsion flat reflection", "High Gloss architectural sheen"],
    badge: "SHEEN SIMULATION",
  },
  {
    id: "lighting",
    tabLabel: "04 / SEE LIGHTING",
    title: "Test daylight & night lighting",
    description: "See how a shade shifts between morning natural sunlight and night ambient light fixtures. Verify color stability before committing to paint.",
    details: ["Daylight directional sun control", "Night ambient lighting simulation", "Equatorial sun elevation & azimuth"],
    badge: "LIGHTING ENVIRONMENT",
  },
  {
    id: "share",
    tabLabel: "05 / SHARE WITH CLIENT",
    title: "Send shareable interactive links",
    description: "Generate a web link to send directly to your client. They can open the 3D room concept on their phone or laptop and explore the design themselves.",
    details: ["Zero-install mobile web access", "Interactive client viewing link", "Direct client feedback channel"],
    badge: "CLIENT COLLABORATION",
  },
];

export default function FeatureStorytelling() {
  const [activeTab, setActiveTab] = useState("visualize");

  const currentFeature = FEATURES.find((f) => f.id === activeTab) || FEATURES[0];

  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF8C38]">
          FEATURE STORYTELLING
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Built for real-world painting workflows.
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Every tool inside PaintIT is designed around how paint decisions are actually explored, tested, and approved.
        </p>
      </div>

      {/* FEATURE INTERACTIVE TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-neutral-850">
        {FEATURES.map((feat) => {
          const isSelected = activeTab === feat.id;
          return (
            <button
              key={feat.id}
              onClick={() => setActiveTab(feat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#FF8C38] text-neutral-950 shadow-lg shadow-orange-500/20"
                  : "bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-850"
              }`}
            >
              {feat.tabLabel}
            </button>
          );
        })}
      </div>

      {/* ACTIVE FEATURE DETAILED CARD */}
      <div className="bg-neutral-900/70 border border-neutral-850 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* LEFT DETAILS */}
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-block px-3 py-1 bg-[#FF8C38]/15 border border-[#FF8C38]/30 text-[#FF8C38] text-[10px] font-mono font-bold uppercase rounded-md">
                {currentFeature.badge}
              </span>

              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {currentFeature.title}
              </h3>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                {currentFeature.description}
              </p>

              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">
                  Workflow Capabilities
                </span>
                <ul className="space-y-2">
                  {currentFeature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C38]" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RIGHT MOCKUP DISPLAY */}
            <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                  PAINTIT {currentFeature.badge}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#FF8C38] animate-pulse" />
              </div>

              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-[#FF8C38] mx-auto flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {currentFeature.title}
                </h4>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                  Engineered specifically to help painters communicate visual concepts with ease.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-900 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>STATUS</span>
                <span className="text-[#FF8C38] font-bold">READY TO USE</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
