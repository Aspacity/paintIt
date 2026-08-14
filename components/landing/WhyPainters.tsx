"use client";

import React from "react";
import { motion } from "framer-motion";

export default function WhyPainters() {
  return (
    <section id="professionals" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950 border border-neutral-850 shadow-2xl space-y-6 order-2 lg:order-1">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Painters & Contractors Workflow
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              For Painters
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              <span className="text-2xl">📱</span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">1. Show Interactive 3D Previews</h4>
                <p className="text-[11px] text-neutral-400">Send clients a 3D link so they see room colors before you paint</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              <span className="text-2xl">🤝</span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">2. Win Quotes Faster</h4>
                <p className="text-[11px] text-neutral-400">Clients sign off on jobs quicker when they can visualize the result</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              <span className="text-2xl">🛡️</span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">3. Zero Unpaid Repainting</h4>
                <p className="text-[11px] text-neutral-400">Eliminate disputes about shade or finish after paint is applied</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-400 block">
            FOR PAINTERS & CONTRACTORS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Win More Jobs & Eliminate Color Misunderstandings.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
            Clients often struggle to visualize how a color swatch will look on an entire wall. With PaintIT, show clients exact 3D previews so they approve color choices confidently before your crew opens a single can.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Send 3D room preview links directly to clients on WhatsApp or Email",
              "Get instant client approval on exact paint brand codes and finish types",
              "Calculate accurate paint bucket quantities for your job estimates",
              "Build a verified portfolio of 3D transformed rooms to attract new clients",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-neutral-300 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">
                  ✓
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}