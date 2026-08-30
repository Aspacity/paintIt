"use client";

import React, { useState, useRef, useEffect } from "react";

export interface MicroVideoStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  badge?: string;
  actionText?: string;
  onActionClick?: () => void;
}

interface MicroVideoCarouselProps {
  title?: string;
  subtitle?: string;
  steps: MicroVideoStep[];
  className?: string;
}

export function MicroVideoCarousel({
  title = "⚡ 15-Second Quick Walkthrough",
  subtitle = "Swipe left/right to see how to navigate and achieve your goals in 1 tap.",
  steps,
  className = "",
}: MicroVideoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Auto-play centered video and pause inactive videos
  useEffect(() => {
    steps.forEach((step, idx) => {
      const vid = videoRefs.current[step.id];
      if (vid) {
        if (idx === activeIndex) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
          vid.currentTime = 0;
        }
      }
    });
  }, [activeIndex, steps]);

  // Handle scroll snap index calculation
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.firstElementChild?.clientWidth || 280;
    const newIndex = Math.round(scrollPosition / (cardWidth + 16));
    if (newIndex >= 0 && newIndex < steps.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const scrollToStep = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.firstElementChild?.clientWidth || 280;
    container.scrollTo({
      left: index * (cardWidth + 16),
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  if (!steps || steps.length === 0) return null;

  return (
    <div className={`p-5 bg-neutral-950 border border-neutral-850 rounded-3xl space-y-4 shadow-xl select-none font-sans ${className}`}>
      {/* Header Title & Dots Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-900 pb-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#FF8C38] flex items-center gap-2">
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">{subtitle}</p>}
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => scrollToStep(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? "w-6 bg-[#FF8C38]" : "w-1.5 bg-neutral-800 hover:bg-neutral-700"
              }`}
              title={`Step ${idx + 1}: ${step.title}`}
            />
          ))}
        </div>
      </div>

      {/* Swipeable Micro-Video Cards Track */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1 px-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {steps.map((step, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={step.id}
              className={`snap-center shrink-0 w-[270px] sm:w-[320px] bg-neutral-900 border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all duration-300 ${
                isActive
                  ? "border-[#FF8C38]/60 shadow-2xl ring-1 ring-orange-500/30 scale-[1.01]"
                  : "border-neutral-800 opacity-60 hover:opacity-80"
              }`}
            >
              {/* Media Wrapper (Video Player or Interactive Motion Fallback) */}
              <div className="relative w-full h-48 rounded-xl bg-neutral-950 border border-neutral-850 overflow-hidden flex items-center justify-center group">
                {step.videoUrl ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[step.id] = el;
                    }}
                    src={step.videoUrl}
                    poster={step.thumbnailUrl}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain bg-neutral-950"
                  />
                ) : (
                  // Animated Mockup Graphic when Video is pending production
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-2 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
                    <div className="w-10 h-10 rounded-full bg-[#FF8C38]/15 border border-[#FF8C38]/40 flex items-center justify-center text-[#FF8C38] font-black text-sm animate-pulse">
                      ▶
                    </div>
                    <span className="text-[9px] font-mono uppercase text-neutral-400 font-bold tracking-wider">
                      Video Demo Loading
                    </span>
                  </div>
                )}

                {/* Top Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 bg-neutral-950/80 border border-neutral-800 text-[#FF8C38] text-[9px] font-mono font-bold rounded-md backdrop-blur-md">
                    Step {step.stepNumber} of {steps.length}
                  </span>
                  {step.badge && (
                    <span className="px-2 py-0.5 bg-[#FF8C38] text-neutral-950 text-[9px] font-black uppercase rounded-md shadow-md">
                      {step.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Text Meta Info */}
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wide truncate">{step.title}</h4>
                <p className="text-[10px] text-neutral-400 leading-relaxed font-medium line-clamp-2">{step.subtitle}</p>
              </div>

              {/* Action Button */}
              {step.actionText && (
                <button
                  type="button"
                  onClick={step.onActionClick}
                  className="w-full py-2 bg-[#FF8C38]/15 hover:bg-[#FF8C38] text-[#FF8C38] hover:text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-[#FF8C38]/40 flex items-center justify-center gap-1.5"
                >
                  <span>{step.actionText}</span>
                  <span>➔</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
