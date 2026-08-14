"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-neutral-950/85 backdrop-blur-xl border-b border-neutral-850/80 py-3 shadow-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white font-black text-sm tracking-tighter group-hover:border-emerald-500/60 transition-colors shadow-inner">
            P<span className="text-emerald-400">IT</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-neutral-100 group-hover:text-emerald-400 transition-colors">
              PaintIT Studio
            </span>
            <span className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase">
              3D Spatial Design Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#homeowners" className="hover:text-white transition-colors">
            For Designers & Owners
          </a>
          <a href="#professionals" className="hover:text-white transition-colors">
            For Contractors & Pros
          </a>
          <a href="#ecosystem" className="hover:text-white transition-colors">
            Design Ecosystem
          </a>
          <a href="#roadmap" className="hover:text-white transition-colors">
            Vision & Roadmap
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/realism-test"
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Launch Studio Demo
          </Link>
          <a
            href="#early-access"
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/15 active:scale-95 transition-all"
          >
            Try PaintIT
          </a>
        </div>
      </div>
    </motion.header>
  );
}
