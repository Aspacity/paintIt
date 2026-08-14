"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideData {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  badge: "AVAILABLE NOW" | "IN DEVELOPMENT" | "FUTURE ROADMAP";
  badgeColor: string;
  icon: string;
  bgGradient: string;
  features: string[];
}

const ECOSYSTEM_SLIDES: SlideData[] = [
  {
    id: "paintit",
    tag: "01 — PAINTIT",
    title: "Surface & Color Design Engine",
    subtitle: "See how your room looks before work begins.",
    description:
      "Design wall colors and surface finishes in interactive 3D. Test real paint brands (Dulux, Sherwin-Williams, Benjamin Moore) under realistic daylight.",
    badge: "AVAILABLE NOW",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: "🎨",
    bgGradient: "from-emerald-950/30 via-neutral-900/90 to-neutral-950",
    features: [
      "Per-wall independent surface design",
      "Real paint brand color catalogs",
      "Matte (emulsion), Satin, and High Gloss sheen",
      "Share 3D room designs directly with clients",
    ],
  },
  {
    id: "furnishit",
    tag: "02 — FURNISHIT",
    title: "Furniture & Layout Planner",
    subtitle: "Arrange your space before moving a single item.",
    description:
      "Place and arrange 3D furniture models inside your actual room layout. Check spatial clearance and room flow before buying physical items.",
    badge: "IN DEVELOPMENT",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: "🛋️",
    bgGradient: "from-amber-950/20 via-neutral-900/90 to-neutral-950",
    features: [
      "3D furniture drag and drop placement",
      "Room clearance & dimension checks",
      "Multi-furniture layout saving",
      "Scale & layout feedback",
    ],
  },
  {
    id: "designit",
    tag: "03 — DESIGNIT",
    title: "Full Interior & Material Explorer",
    subtitle: "Explore ideas before committing to final interior designs.",
    description:
      "Experiment with hardwood, tile, and marble flooring materials alongside LED ceiling cove lights in a unified 3D environment.",
    badge: "FUTURE ROADMAP",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    icon: "✨",
    bgGradient: "from-sky-950/20 via-neutral-900/90 to-neutral-950",
    features: [
      "Hardwood, tile, and marble floor mapping",
      "Ceiling cove light fixture options",
      "One-click high quality room renders",
      "Complete room mood board styling",
    ],
  },
  {
    id: "buildit",
    tag: "04 — BUILDIT",
    title: "Property & Construction Workflows",
    subtitle: "From 3D design concept to physical construction.",
    description:
      "Turn 3D spatial designs directly into material lists, paint quantity estimates, and direct contractor job requests.",
    badge: "FUTURE ROADMAP",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    icon: "🏗️",
    bgGradient: "from-purple-950/20 via-neutral-900/90 to-neutral-950",
    features: [
      "Automated wall surface area calculation",
      "Direct job quoting for painters & pros",
      "Property renovation planning",
      "Simple contractor project management",
    ],
  },
];

export default function EcosystemCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ECOSYSTEM_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + ECOSYSTEM_SLIDES.length) % ECOSYSTEM_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  const currentSlide = ECOSYSTEM_SLIDES[currentIndex];

  return (
    <section
      id="ecosystem"
      className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden select-none border-t border-neutral-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-400 block">
          THE SPATIAL DESIGN ECOSYSTEM
        </span>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          One Platform. Complete Spatial Design.
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 font-normal">
          PaintIT Studio is evolving into a complete 3D platform for visualizing, designing, furnishing, and building physical spaces.
        </p>
      </div>

      {/* Main Slide Presentation Window */}
      <div
        className="relative min-h-[460px] sm:min-h-[400px] rounded-3xl border border-neutral-850 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl bg-gradient-to-br from-neutral-900/90 via-neutral-950 to-neutral-950 flex flex-col justify-between"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1.0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute inset-0 bg-gradient-to-br ${currentSlide.bgGradient} pointer-events-none z-0`}
          />
        </AnimatePresence>

        {/* TOP META ROW */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <span className="text-xs font-mono font-bold text-neutral-400 tracking-wider">
            {currentSlide.tag}
          </span>
          <span
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${currentSlide.badgeColor}`}
          >
            {currentSlide.badge}
          </span>
        </div>

        {/* MIDDLE CONTENT SLIDE BODY */}
        <div className="relative z-10 my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">{currentSlide.icon}</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {currentSlide.title}
                  </h3>
                </div>

                <p className="text-base sm:text-lg font-medium text-emerald-300/90 leading-snug">
                  &quot;{currentSlide.subtitle}&quot;
                </p>

                <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-2xl">
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* FEATURE PILLS GRID */}
          <div className="lg:col-span-5 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-2.5 bg-black/40 border border-neutral-800/80 p-5 rounded-2xl backdrop-blur-md"
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  What It Does
                </span>
                {currentSlide.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM NAVIGATION FOOTER ROW */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-neutral-850/80">
          <div className="flex items-center gap-2">
            {ECOSYSTEM_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-emerald-400" : "w-2 bg-neutral-800 hover:bg-neutral-700"
                }`}
                title={slide.title}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 transition-all flex items-center justify-center text-sm"
              title="Previous slide"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 transition-all flex items-center justify-center text-sm"
              title="Next slide"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
