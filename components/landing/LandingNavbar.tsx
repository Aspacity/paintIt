"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-850/80 py-3 shadow-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Subtle Aspacity Attribution */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white font-black text-sm tracking-tighter group-hover:border-emerald-500/60 transition-colors shadow-inner">
            P<span className="text-emerald-400">IT</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-neutral-100 group-hover:text-emerald-400 transition-colors">
              PaintIT Studio
            </span>
            <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">
              A product by Aspacity
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#for-painters" className="hover:text-white transition-colors">
            For Painters
          </a>
          <Link href="/search/designs" className="hover:text-white transition-colors">
            Explore
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/search/designs"
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Explore PaintIT
          </Link>
          <a
            href="#early-access"
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/15 active:scale-95 transition-all"
          >
            Get Started
          </a>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-neutral-400 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950/95 backdrop-blur-2xl border-b border-neutral-800 px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-400">
              How It Works
            </a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-400">
              Features
            </a>
            <a href="#for-painters" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-400">
              For Painters
            </a>
            <Link href="/search/designs" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-400">
              Explore
            </Link>
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="#early-access"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-emerald-500 text-neutral-950 font-black text-xs uppercase tracking-wider block"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </motion.header>
  );
}
