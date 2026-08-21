"use client";

import React, { useState, useEffect } from "react";

interface PainterVideoWalkthroughPlayerProps {
  videoUrl?: string;
}

export function PainterVideoWalkthroughPlayer({ videoUrl }: PainterVideoWalkthroughPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(25);
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep(1);
          return 0;
        }
        const next = prev + 1;
        if (next > 66) setActiveStep(3);
        else if (next > 33) setActiveStep(2);
        else setActiveStep(1);
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl space-y-0 text-white select-none">
      {/* 🎬 VIDEO PLAYER FRAME HEADER */}
      <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200">
            🎬 Painter Pro Workflow • 4K HD Video Walkthrough
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            4K 60FPS
          </span>
        </div>
      </div>

      {/* 🎥 MAIN VIDEO SCREEN / CONTAINER */}
      <div className="relative aspect-video bg-neutral-950 flex items-center justify-center overflow-hidden group">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          /* Animated Interactive Video Simulation Screen */
          <div className="w-full h-full relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6 flex flex-col justify-between overflow-hidden">
            {/* Background 3D Grid Wave Animation */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 animate-pulse pointer-events-none" />

            {/* Video Watermark Badge */}
            <div className="absolute top-4 right-4 z-10 bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase">
                PaintIT 3D Realtime Stream
              </span>
            </div>

            {/* Dynamic Scene Video Content */}
            <div className="my-auto text-center space-y-4 max-w-md mx-auto z-10">
              {activeStep === 1 && (
                <div className="space-y-3 animate-fade-in">
                  <span className="text-4xl block">🏠 3D Room Camera Rotation</span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Step 1: Rotate & Inspect 3D Space
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    Orbit camera 360° around ceiling coves, floor planks, and windows in real-time WebGL.
                  </p>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3 animate-fade-in">
                  <span className="text-4xl block">🎨 1-Tap Real-Time Paint Splash</span>
                  <h3 className="text-base font-black text-emerald-400 uppercase tracking-wider">
                    Step 2: Instant Wall Color & Sheen Swap
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    Double-tap wall surface to apply Desert Sand, Sage Green, or Deep Navy Emulsion.
                  </p>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-3 animate-fade-in">
                  <span className="text-4xl block">🤝 1-Click Client Approval Link</span>
                  <h3 className="text-base font-black text-cyan-400 uppercase tracking-wider">
                    Step 3: Send 3D Link & Win Quote
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    Share custom 3D link on WhatsApp/Email. Client approves color before painting starts!
                  </p>
                </div>
              )}
            </div>

            {/* Voiceover Captions Bar */}
            <div className="z-10 bg-neutral-950/90 backdrop-blur-md p-3 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">🎙️ Voiceover:</span>
                <span className="text-neutral-200 truncate max-w-xs sm:max-w-md">
                  {activeStep === 1
                    ? "&quot;Show your clients exact 3D lighting before opening a single paint bucket...&quot;"
                    : activeStep === 2
                    ? "&quot;Tap any wall to instantly cycle paint codes, sheens, and floor finishes...&quot;"
                    : "&quot;Clients sign quotes 3x faster when they can interactively approve colors!&quot;"}
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-bold hidden sm:inline">
                CHAPTER {activeStep}/3
              </span>
            </div>
          </div>
        )}

        {/* Video Overlay Play Button (Only visible on hover or when paused) */}
        {!videoUrl && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-emerald-500/90 text-neutral-950 flex items-center justify-center text-xl font-bold shadow-2xl hover:scale-110 transition-all opacity-80 group-hover:opacity-100"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
        )}
      </div>

      {/* 🎛️ VIDEO CONTROL BAR & SCRUBBER */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-850 space-y-3">
        {/* Progress Bar */}
        <div className="w-full bg-neutral-850 h-1.5 rounded-full overflow-hidden cursor-pointer">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg border border-neutral-800 font-bold"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play Video"}
            </button>

            <span className="text-neutral-400">
              {Math.floor((progress / 100) * 24)}s / 24s
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            <span className={activeStep === 1 ? "text-emerald-400 font-bold" : ""}>1. 3D Space</span>
            <span>•</span>
            <span className={activeStep === 2 ? "text-emerald-400 font-bold" : ""}>2. Paint Splash</span>
            <span>•</span>
            <span className={activeStep === 3 ? "text-emerald-400 font-bold" : ""}>3. Win Job</span>
          </div>
        </div>
      </div>
    </div>
  );
}
