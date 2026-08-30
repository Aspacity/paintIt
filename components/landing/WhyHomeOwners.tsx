"use client";

import React from "react";

export default function WhyHomeOwners() {
  return (
    <section id="homeowners" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#FF8C38] block">
            FOR HOMEOWNERS & DESIGNERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Don&apos;t Guess What Your Space Will Look Like. <br />
            <span className="text-[#FF8C38]">See It First.</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
            Tiny paper swatches don&apos;t tell you how a color will feel in your actual room. PaintIT lets you test real paint colors on full 3D walls under daylight—so you make the right choice the first time.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Try real colors from Dulux, Sherwin-Williams, and Benjamin Moore",
              "See how matte (emulsion), satin, and high-gloss finishes reflect light",
              "Share 3D room renders with family, friends, or your painter",
              "Save time and money by avoiding wrong paint colors",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-neutral-300 font-medium">
                <div className="w-5 h-5 rounded-full bg-[#FF8C38]/15 border border-[#FF8C38]/40 text-[#FF8C38] flex items-center justify-center text-[10px] shrink-0">
                  ✓
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950 border border-neutral-850 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Homeowner Experience
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8C38] bg-[#FF8C38]/15 px-2.5 py-0.5 rounded border border-[#FF8C38]/30">
              Simple & Fast
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">&quot;I want to repaint my room&quot;</h4>
                <p className="text-[11px] text-neutral-400">Test color ideas instantly in 3D</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Pick Exact Colors & Finishes</h4>
                <p className="text-[11px] text-neutral-400">Select real paint codes that you can buy at stores</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              <span className="text-2xl">🛠️</span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Hand Off To Your Painter</h4>
                <p className="text-[11px] text-neutral-400">Give your painter exact specs so they paint with zero confusion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}