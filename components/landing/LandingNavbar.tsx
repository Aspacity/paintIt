"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/common/Logo";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "For Homeowners", href: "#for-homeowners" },
    { name: "For Painters", href: "#for-painters" },
    { name: "3D Designs", href: "/search/designs" },
    { name: "FAQ", href: "#faq" },
  ];

  const isDark = theme === "dark";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? "bg-black/90 backdrop-blur-md border-b border-neutral-800/80 shadow-md py-3.5"
            : "bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 shadow-sm py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Centralized Logo Mark */}
          <Logo size="md" textColor={isDark ? "text-white" : "text-stone-900"} />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors tracking-tight ${
                  isDark ? "text-neutral-300 hover:text-white" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions + Theme Toggle Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Global Theme Switcher Control */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all flex items-center gap-1.5 px-3 text-xs font-semibold ${
                isDark
                  ? "bg-neutral-900 border-neutral-700 text-amber-300 hover:bg-neutral-800"
                  : "bg-stone-200/70 border-stone-300 text-stone-800 hover:bg-stone-200"
              }`}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              aria-label="Toggle Global Theme"
            >
              <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
              <span>{isDark ? "Dark" : "Light"}</span>
            </button>

            <Link
              href="/login"
              className={`text-sm font-medium px-3 py-2 transition-colors ${
                isDark ? "text-neutral-300 hover:text-white" : "text-stone-700 hover:text-stone-950"
              }`}
            >
              Log in
            </Link>
            <Link
              href="/search/designs"
              className="inline-flex items-center justify-center px-4.5 py-2.5 rounded-full bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Explore 3D Rooms
            </Link>
          </div>

          {/* Mobile Hamburger Toggle & Theme Switcher */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border text-xs font-bold ${
                isDark ? "bg-neutral-900 border-neutral-700 text-amber-300" : "bg-stone-200 border-stone-300 text-stone-800"
              }`}
              aria-label="Toggle Theme"
            >
              {isDark ? "🌙" : "☀️"}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition ${
                isDark ? "text-neutral-300 hover:text-white hover:bg-neutral-800" : "text-stone-700 hover:text-stone-900 hover:bg-stone-200"
              }`}
              aria-label="Toggle Navigation Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden px-4 pt-3 pb-6 space-y-4 shadow-xl overflow-hidden ${
              isDark ? "bg-neutral-900 border-b border-neutral-800" : "bg-[#FAF8F5] border-b border-stone-200"
            }`}
          >
            <div className="flex flex-col space-y-3 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-medium text-base py-1.5 border-b ${
                    isDark ? "text-neutral-200 hover:text-white border-neutral-800" : "text-stone-700 hover:text-stone-950 border-stone-200"
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-2 ${
                  isDark ? "bg-neutral-800 border-neutral-700 text-amber-300" : "bg-stone-200 border-stone-300 text-stone-800"
                }`}
              >
                <span>{isDark ? "🌙 Mode: Dark (Switch to Light ☀️)" : "☀️ Mode: Light (Switch to Dark 🌙)"}</span>
              </button>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-center font-medium py-2.5 rounded-lg border ${
                  isDark ? "text-neutral-200 border-neutral-700 bg-neutral-800" : "text-stone-800 border-stone-300 bg-white"
                }`}
              >
                Log in
              </Link>
              <Link
                href="/search/designs"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-black bg-[#FF8C38] font-bold py-2.5 rounded-lg shadow-sm"
              >
                Explore 3D Rooms
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
