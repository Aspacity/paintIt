"use client";

import React from "react";
import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="bg-black text-neutral-400 text-xs border-t border-neutral-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF8C38] text-black flex items-center justify-center font-bold text-sm tracking-widest">
                P
              </div>
              <span className="font-semibold text-white tracking-tight text-lg font-sans">
                PaintIT<span className="text-[#FF8C38] font-bold">.</span> Studio
              </span>
            </Link>
            <p className="text-neutral-400 text-sm max-w-sm leading-relaxed font-normal">
              Visualizing better spaces, one colour at a time. The architectural visualization platform for homeowners and painting contractors.
            </p>
            <div className="pt-2 text-neutral-500 font-mono text-[11px]">
              Core Positioning: <span className="text-[#FF8C38] font-semibold">Visualize before you paint.</span>
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
                  Interactive Studio
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
                <a href="#faq" className="hover:text-white transition">
                  About Stage
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  FAQ & Support
                </a>
              </li>
              <li>
                <a href="mailto:contact@paintit.studio" className="hover:text-white transition">
                  Contact Studio
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
            © {new Date().getFullYear()} PaintIT Studio. All rights reserved. Built for visual spatial decisions.
          </div>

          {/* Social Placeholders */}
          <div className="flex items-center gap-5">
            <span className="hover:text-white transition cursor-pointer">Instagram</span>
            <span className="hover:text-white transition cursor-pointer">TikTok</span>
            <span className="hover:text-white transition cursor-pointer">LinkedIn</span>
            <span className="hover:text-white transition cursor-pointer">X</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
