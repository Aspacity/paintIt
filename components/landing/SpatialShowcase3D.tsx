"use client";

import React from "react";
import LandingPageClassicDemoCanvas from "./LandingPageClassicDemoCanvas";

export default function SpatialShowcase3D() {
  return (
    <section id="showcase-3d" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-400 block">
          INTERACTIVE SPATIAL ENGINE
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
          This Isn&apos;t a Static Picture.
          <br />
          <span className="text-neutral-400">This Is a Space You Control.</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-normal">
          Drag to orbit 360° around the room without page scroll interference. Select paint codes & sheens from the bottom palette bar to transform room walls in real-time.
        </p>
      </div>

      {/* 3D Viewport Window Frame (Classic Bottom Palette Layout) */}
      <div className="relative border border-neutral-850 bg-neutral-950 rounded-3xl shadow-2xl overflow-hidden h-[560px] sm:h-[620px] flex flex-col">
        <LandingPageClassicDemoCanvas />
      </div>
    </section>
  );
}
