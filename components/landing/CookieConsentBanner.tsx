"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsentBanner() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem("paintit_cookie_consent");
    if (consent) {
      setAccepted(true);
    } else {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("paintit_cookie_consent", "true");
    setAccepted(true);
  };

  const handleDecline = () => {
    localStorage.setItem("paintit_cookie_consent", "false");
    setAccepted(true);
  };

  if (accepted !== false) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 sm:p-5 bg-neutral-900/95 text-neutral-200 border border-neutral-800 rounded-2xl shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🍪</span>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Privacy Preference
            </h4>
          </div>
          <button
            onClick={handleDecline}
            className="text-neutral-500 hover:text-neutral-300 text-xs"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed mb-4 font-normal">
          We use essential cookies to remember your studio color selections and session preferences. Read our{" "}
          <Link href="/cookies" className="underline hover:text-white">
            Cookie Policy
          </Link>{" "}
          for details.
        </p>

        <div className="flex items-center justify-end gap-2 text-xs">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white font-medium transition"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold shadow-xs transition"
          >
            Accept All
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
