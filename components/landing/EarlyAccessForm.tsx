"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { identifyUserSession } from "@/utils/tracker";

export default function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"homeowner" | "painter" | "designer">("homeowner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await identifyUserSession(email.toLowerCase().trim());
      setSubmitted(true);
    } catch (err) {
      console.error("Early access registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="early-access" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950 border border-neutral-800 shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-400 block">
            EARLY ACCESS PROGRAM
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Experience PaintIT Studio First.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-normal leading-relaxed">
            Join property owners, professional painters, and interior designers who are transforming how physical spaces are visualized and built.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="relative z-10 max-w-md mx-auto space-y-4">
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
              {(["homeowner", "painter", "designer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    role === r ? "bg-emerald-500 text-neutral-950 font-black shadow-md" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 h-12 px-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-6 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/15 active:scale-95 transition-all shrink-0 flex items-center justify-center"
              >
                {isSubmitting ? "Securing Access..." : "Request Early Access"}
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 font-mono">
              🔒 Zero spam. We notify you when new spatial features roll out.
            </p>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">You&apos;re On The Early Access List</h3>
            <p className="text-xs text-neutral-400">
              Thank you for registering as a <strong className="text-emerald-400 uppercase">{role}</strong>. We&apos;ll notify you directly as new spatial modules launch.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}