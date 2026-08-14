"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8 text-neutral-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-black text-xs">
            P<span className="text-emerald-400">IT</span>
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white block">PaintIT Studio</span>
            <span className="text-[9px] font-mono text-neutral-400">Spatial Intelligence Platform</span>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <a href="#ecosystem" className="hover:text-white transition-colors">Ecosystem</a>
          <a href="#experience" className="hover:text-white transition-colors">Experience</a>
          <a href="#showcase-3d" className="hover:text-white transition-colors">Interactive 3D</a>
          <a href="#realism" className="hover:text-white transition-colors">Realism Engine</a>
          <Link href="/admin/realism-test" className="hover:text-emerald-400 transition-colors">Studio Demo</Link>
        </nav>

        <p className="text-[10px] font-mono text-neutral-400">
          © {new Date().getFullYear()} PaintIT Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}