"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8 text-neutral-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Aspacity Attribution */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-black text-xs">
            P<span className="text-emerald-400">IT</span>
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white block">
              PaintIT
            </span>
            <span className="text-[10px] font-mono text-neutral-400 block">
              A product by{" "}
              <a
                href="https://aspacity.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-emerald-400 underline underline-offset-2 transition-colors font-semibold"
              >
                Aspacity
              </a>
            </span>
          </div>
        </div>

        {/* Focused Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#for-homeowners" className="hover:text-white transition-colors">
            For Homeowners
          </a>
          <a href="#for-painters" className="hover:text-white transition-colors">
            For Painters
          </a>
          <Link href="/search/designs" className="hover:text-white transition-colors">
            Explore 3D Catalog
          </Link>
          <a
            href="https://aspacity.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline transition-colors flex items-center gap-1 font-mono"
          >
            <span>Aspacity Company</span>
            <span>↗</span>
          </a>
        </nav>

        {/* Copyright */}
        <p className="text-[10px] font-mono text-neutral-400">
          © {new Date().getFullYear()} PaintIT — A product by <a href="https://aspacity.vercel.app" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-emerald-400 underline">Aspacity</a>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}