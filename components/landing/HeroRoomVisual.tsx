"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  overlayStyle: string;
  mixBlendMode: React.CSSProperties["mixBlendMode"];
}

interface LightingPreset {
  id: string;
  label: string;
  icon: string;
  brightness: string;
  warmthFilter: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "orange-accent",
    name: "Light Warm Amber",
    hex: "#FF8C38",
    overlayStyle: "rgba(255, 140, 56, 0.38)",
    mixBlendMode: "multiply",
  },
  {
    id: "sage",
    name: "Muted Sage",
    hex: "#5A7361",
    overlayStyle: "rgba(90, 115, 97, 0.42)",
    mixBlendMode: "multiply",
  },
  {
    id: "terracotta",
    name: "Warm Terracotta",
    hex: "#C86D51",
    overlayStyle: "rgba(200, 109, 81, 0.38)",
    mixBlendMode: "multiply",
  },
  {
    id: "slate",
    name: "Nordic Slate",
    hex: "#547582",
    overlayStyle: "rgba(84, 117, 130, 0.42)",
    mixBlendMode: "multiply",
  },
  {
    id: "sand",
    name: "Warm Sand",
    hex: "#D4B896",
    overlayStyle: "rgba(212, 184, 150, 0.35)",
    mixBlendMode: "multiply",
  },
];

const LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: "morning",
    label: "Morning Daylight",
    icon: "🌅",
    brightness: "brightness(102%) contrast(101%)",
    warmthFilter: "sepia(8%) hue-rotate(-10deg)",
  },
  {
    id: "afternoon",
    label: "Afternoon Sun",
    icon: "☀️",
    brightness: "brightness(106%) contrast(103%)",
    warmthFilter: "sepia(14%) hue-rotate(5deg)",
  },
  {
    id: "evening",
    label: "Warm Evening",
    icon: "🌙",
    brightness: "brightness(92%) contrast(105%)",
    warmthFilter: "sepia(28%) hue-rotate(15deg)",
  },
];

export default function HeroRoomVisual() {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [activeColor, setActiveColor] = useState<ColorPreset>(COLOR_PRESETS[0]);
  const [activeLighting, setActiveLighting] = useState<LightingPreset>(LIGHTING_PRESETS[1]);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!containerRef.current) return;
    setContainerWidth(containerRef.current.clientWidth);
    const handleResize = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percent = (x / rect.width) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className={`w-full max-w-5xl mx-auto mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border shadow-2xl overflow-hidden relative transition-colors duration-300 ${
      isDark ? "bg-neutral-900 border-neutral-800" : "bg-[#F4F1EA] border-stone-300/80"
    }`}>
      {/* Top Floating Control Bar Overlay */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-2">
        {/* Left Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF8C38] animate-pulse" />
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-neutral-200" : "text-stone-800"}`}>
            Interactive Room Visualizer
          </span>
          <span className={`text-[11px] font-medium hidden sm:inline ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
            • Drag divider to compare
          </span>
        </div>

        {/* Lighting Selector */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border shadow-xs ${
          isDark ? "bg-black border-neutral-800" : "bg-[#FAF8F5] border-stone-200"
        }`}>
          {LIGHTING_PRESETS.map((light) => (
            <button
              key={light.id}
              onClick={() => setActiveLighting(light)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeLighting.id === light.id
                  ? "bg-[#FF8C38] text-black font-bold shadow-xs"
                  : isDark
                  ? "text-neutral-300 hover:text-white hover:bg-neutral-800"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              <span>{light.icon}</span>
              <span className="hidden sm:inline">{light.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Draggable Comparison Canvas */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className="relative w-full h-[320px] sm:h-[480px] lg:h-[540px] rounded-xl sm:rounded-2xl overflow-hidden cursor-ew-resize select-none bg-black"
      >
        {/* RIGHT LAYER: PaintIT Transformed & Colored Room */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/painted_finished_room.jpg"
            alt="PaintIT Transformed Room Concept"
            fill
            priority
            className="object-cover transition-all duration-500"
            style={{
              filter: `${activeLighting.brightness} ${activeLighting.warmthFilter}`,
            }}
          />
          {/* Dynamic Paint Overlay Filter */}
          <div
            className="absolute inset-0 transition-all duration-500 pointer-events-none"
            style={{
              backgroundColor: activeColor.overlayStyle,
              mixBlendMode: activeColor.mixBlendMode,
            }}
          />

          {/* Label Badge Right */}
          <div className="absolute top-4 right-4 z-20 bg-black/85 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-700 flex items-center gap-2 shadow-md">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColor.hex }} />
            <span>PaintIT Concept ({activeColor.name})</span>
          </div>
        </div>

        {/* LEFT LAYER: Original Raw Unpainted Room */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden transition-all duration-75"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="relative w-full h-full" style={{ width: containerWidth ? `${containerWidth}px` : "100%" }}>
            <Image
              src="/images/raw_unpainted_room.jpg"
              alt="Original Unpainted Space"
              fill
              priority
              className="object-cover"
              style={{
                filter: activeLighting.brightness,
              }}
            />
            {/* Label Badge Left */}
            <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md text-neutral-300 text-xs font-medium px-3 py-1.5 rounded-full border border-neutral-700 shadow-md">
              Original Space
            </div>
          </div>
        </div>

        {/* Draggable Divider Bar */}
        <div
          className="absolute top-0 bottom-0 z-30 w-1 bg-[#FF8C38] shadow-[0_0_15px_rgba(255,140,56,0.6)] transition-all duration-75 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Drag Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-black border-2 border-[#FF8C38] shadow-xl flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-110 active:scale-95">
            <svg
              className="w-5 h-5 text-[#FF8C38]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l-3 3m0 0l3 3m-3-3h14m-8-6l3 3m0 0l-3 3m3-3H3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Color Swatches Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold tracking-tight ${isDark ? "text-neutral-300" : "text-stone-700"}`}>
            Explore Wall Tones:
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color.id}
              onClick={() => setActiveColor(color)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeColor.id === color.id
                  ? isDark
                    ? "bg-neutral-800 border-[#FF8C38] text-white shadow-sm ring-1 ring-[#FF8C38]/40"
                    : "bg-white border-stone-900 text-stone-900 shadow-sm ring-1 ring-stone-900/10"
                  : isDark
                  ? "bg-transparent border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800/50"
                  : "bg-transparent border-stone-300/80 text-stone-600 hover:border-stone-400 hover:bg-stone-200/30"
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs transition-transform group-hover:scale-110"
                style={{ backgroundColor: color.hex }}
              />
              <span>{color.name}</span>
            </button>
          ))}
        </div>

        <div className={`text-[11px] font-medium hidden lg:block ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
          Active Finish: <span className={`font-semibold ${isDark ? "text-white" : "text-stone-800"}`}>Eggshell Matte</span>
        </div>
      </div>
    </div>
  );
}
