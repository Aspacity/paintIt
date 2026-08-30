"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function EarlyAccessProof() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("painter");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1000);
  };

  return (
    <section id="early-access" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="bg-neutral-900/70 border border-neutral-850 rounded-3xl p-8 sm:p-14 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF8C38]">
            EARLY-STAGE COMMITMENT
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Built with real painters in mind.
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl mx-auto font-normal">
            PaintIT is actively being shaped through direct conversations and feedback from professional painters, homeowners, and interior specialists.
          </p>

          <div className="pt-4 max-w-md mx-auto">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center justify-center gap-3 text-xs font-mono text-neutral-400 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="painter"
                      checked={role === "painter"}
                      onChange={() => setRole("painter")}
                      className="accent-orange-400"
                    />
                    <span>I am a Professional Painter</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="homeowner"
                      checked={role === "homeowner"}
                      onChange={() => setRole("homeowner")}
                      className="accent-orange-400"
                    />
                    <span>I am a Homeowner / Designer</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF8C38] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-[#FF8C38] hover:bg-[#FF8C38] disabled:bg-neutral-800 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    {submitting ? "Submitting..." : "Join Early Access"}
                  </button>
                </div>

                <span className="text-[10px] font-mono text-neutral-500 block pt-1">
                  We respect your inbox. Zero spam guaranteed.
                </span>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-950 border border-[#FF8C38]/40 p-6 rounded-2xl space-y-2 text-center"
              >
                <div className="w-8 h-8 rounded-full bg-[#FF8C38]/15 text-[#FF8C38] font-bold mx-auto flex items-center justify-center text-sm">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-white">Thank you for joining!</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  We&apos;ll keep you updated as PaintIT evolves.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
