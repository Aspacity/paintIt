"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function RealismComparison() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, rect);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  return (
    <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none border-t border-neutral-900">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
        <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase text-[#FF8C38] block">
          REAL-WORLD ACCURACY
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          What You See in 3D is What Gets Painted
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-xl mx-auto">
          Drag the slider below to compare a raw unpainted room shell with PaintIT&apos;s realistic 3D room preview.
        </p>
      </div>

      {/* INTERACTIVE VISUAL BEFORE / AFTER SLIDER */}
      <div
        className="relative max-w-5xl mx-auto h-[260px] sm:h-[400px] md:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl cursor-ew-resize bg-neutral-950"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* RIGHT IMAGE: Painted Finished Room Preview */}
        <div className="absolute inset-0 bg-neutral-950">
          <Image
            src="/images/painted_finished_room.jpg"
            alt="Painted 3D Room Preview"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
            priority
          />
          {/* Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-lg bg-[#FF8C38] text-neutral-950 shadow-lg">
              ✨ 3D Painted Preview
            </span>
          </div>
        </div>

        {/* LEFT IMAGE: Raw Unpainted Concrete Shell */}
        <div
          className="absolute inset-y-0 left-0 bg-neutral-950 overflow-hidden border-r-2 border-[#FF8C38]"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="relative w-full h-full min-w-[260px] sm:min-w-[500px]">
            <Image
              src="/images/raw_unpainted_room.jpg"
              alt="Raw Unpainted Concrete Room Shell"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
              priority
            />
          </div>
          {/* Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-lg bg-neutral-900/90 border border-neutral-700 text-neutral-300 backdrop-blur-md shadow-lg">
              🏗️ Bare Unpainted Shell
            </span>
          </div>
        </div>

        {/* SLIDER DRAG HANDLE */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#FF8C38] shadow-2xl pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-900 border-2 border-[#FF8C38] text-[#FF8C38] flex items-center justify-center text-xs font-bold shadow-2xl">
            ↔
          </div>
        </div>
      </div>

      {/* MOBILE-SLEEK DETAIL CARDS BELOW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-6 sm:mt-10 max-w-5xl mx-auto">
        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base">☀️</span>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Realistic Sunlight</h4>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed font-normal">
            See how your room color looks under morning sunlight and evening room lamps.
          </p>
        </div>

        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base">💎</span>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Paint Finish Shine</h4>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed font-normal">
            Test matte (emulsion), satin sheen, and high gloss reflections before painting.
          </p>
        </div>

        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base">📐</span>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">True Room Shadows</h4>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed font-normal">
            Soft natural shadows show realistic depth around corners and furniture.
          </p>
        </div>
      </div>
    </section>
  );
}
