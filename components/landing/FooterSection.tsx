"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function FooterSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className={`text-xs border-t pt-16 pb-12 transition-colors duration-300 ${
      isDark ? "bg-black text-neutral-400 border-neutral-800" : "bg-[#121110] text-stone-400 border-stone-800"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b ${
          isDark ? "border-neutral-800" : "border-stone-800"
        }`}>
          {/* Brand Column & Aspacity Acknowledgement */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF8C38] text-black flex items-center justify-center font-bold text-sm tracking-widest">
                P
              </div>
              <span className="font-semibold text-white tracking-tight text-lg font-sans">
                PaintIT<span className="text-[#FF8C38] font-bold">.</span>
              </span>
            </Link>
            <p className="text-neutral-400 text-sm max-w-sm leading-relaxed font-normal">
              Visualizing better spaces, one colour at a time. The 3D room visualization platform for homeowners and painting contractors.
            </p>
            
            {/* 🏢 ASPACITY COMPANY ACKNOWLEDGEMENT CARD & LINK */}
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-1.5 max-w-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-neutral-400 font-bold uppercase tracking-wider">
                  PARENT TECHNOLOGY COMPANY
                </span>
                <a
                  href="https://aspacity.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF8C38] hover:underline font-bold flex items-center gap-1 font-mono text-[10px]"
                >
                  <span>Explore Aspacity</span>
                  <span>➔</span>
                </a>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                PaintIT is a product by <a href="https://aspacity.vercel.app" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FF8C38] underline font-semibold">Aspacity</a> — building software products that connect people, professionals, creativity, and technology.
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a href="#how-it-works" className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#for-homeowners" className="hover:text-white transition">
                  For Homeowners
                </a>
              </li>
              <li>
                <a href="#for-painters" className="hover:text-white transition">
                  For Painters
                </a>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-white transition">
                  Interactive Demo
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  href="https://aspacity.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <span>Aspacity Company</span>
                  <span className="text-[10px] text-[#FF8C38]">↗</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  FAQ & Support
                </a>
              </li>
              <li>
                <a href="mailto:contact@aspacity.com" className="hover:text-white transition">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Legal & Policy
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Social & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} PaintIT — A product by <a href="https://aspacity.vercel.app" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#FF8C38] underline font-semibold">Aspacity</a>. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-neutral-400 font-medium">
            <a href="https://aspacity.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF8C38] transition">
              Aspacity Ecosystem
            </a>
            <span>•</span>
            <a href="#early-access" className="text-[#FF8C38] hover:underline font-bold">
              Early Access
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
