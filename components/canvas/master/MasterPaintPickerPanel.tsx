"use client";

import React, { useState, useRef } from "react";
import { REAL_PAINTS_CATALOG } from "@/config/paints";
import { WallFinishType } from "@/components/canvas/PaintItMasterCanvas";

interface MasterPaintPickerPanelProps {
  paintsList: any[];
  config: any;
  activeSelectedWall: string | null;
  onSelectWallSurface: (wallKey: string) => void;
  onColorChange: (colorHex: string) => void;
  onFinishChange: (finish: WallFinishType) => void;
  onApplyFinishToAllWalls: (finish: WallFinishType) => void;
}

export function MasterPaintPickerPanel({
  paintsList,
  config,
  activeSelectedWall,
  onSelectWallSurface,
  onColorChange,
  onFinishChange,
  onApplyFinishToAllWalls,
}: MasterPaintPickerPanelProps) {
  const [activeTab, setActiveTab] = useState<"COLORS" | "FINISHES">("COLORS");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [customHex, setCustomHex] = useState<string>("#C4B199");

  // Draggable position state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPos({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const wallSurfaces = [
    { key: "wall_back", label: "Back Wall" },
    { key: "wall_left", label: "Left Wall" },
    { key: "wall_right", label: "Right Wall" },
    { key: "wall_front", label: "Front Wall" },
    { key: "toilet", label: "Toilet Wall" },
    { key: "ceiling", label: "Ceiling" },
  ];

  const catalogPaints = paintsList && paintsList.length > 0 ? paintsList : REAL_PAINTS_CATALOG;
  const targetKey = activeSelectedWall || "wall_back";
  const currentStates = config.wallSurfaceStates || {};
  const currentColor = currentStates[targetKey]?.color || config.activeWallColor || "#C4B199";
  const currentFinish = currentStates[targetKey]?.finish || config.activeWallFinish || "EMULSION";

  return (
    <div
      className="pointer-events-auto w-80 max-h-[75vh] bg-neutral-950/95 backdrop-blur-2xl border border-neutral-850 rounded-3xl p-3.5 flex flex-col space-y-3 shadow-2xl overflow-hidden transition-shadow duration-150 select-none"
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      {/* 1. Panel Drag Handle Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between pb-2 border-b border-neutral-850 cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF8C38] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            🎨 Paint & Finishes
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#FF8C38] text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all"
        >
          {isCollapsed ? "▲" : "▼"}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* 2. Target Wall Surface Selector */}
          <div className="space-y-1 pb-2 border-b border-neutral-850 shrink-0">
            <div className="flex items-center justify-between text-[9px] font-mono">
              <span className="text-[#FF8C38] font-bold uppercase">
                Active Surface: <span className="text-white font-extrabold">{targetKey.toUpperCase()}</span>
              </span>
              <span className="text-neutral-500 font-medium">Double-Tap Wall to Cycle</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {wallSurfaces.map((surf) => {
                const isSelected = targetKey === surf.key;
                return (
                  <button
                    key={surf.key}
                    type="button"
                    onClick={() => onSelectWallSurface(surf.key)}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-xl uppercase whitespace-nowrap transition-all border ${
                      isSelected
                        ? "bg-[#FF8C38] text-neutral-950 border-[#FF8C38] font-black shadow-md"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {surf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 2 Tab Buttons */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-900/90 rounded-2xl border border-neutral-850 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("COLORS")}
              className={`py-1.5 text-[10px] font-bold uppercase rounded-xl transition-all ${
                activeTab === "COLORS"
                  ? "bg-[#FF8C38] text-black shadow-md font-extrabold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              🎨 Paint Swatches
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("FINISHES")}
              className={`py-1.5 text-[10px] font-bold uppercase rounded-xl transition-all ${
                activeTab === "FINISHES"
                  ? "bg-[#FF8C38] text-black shadow-md font-extrabold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              ✨ Sheens & Finishes
            </button>
          </div>

          {/* 4. Tab Body Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {/* TAB 1: PAINT COLORS */}
            {activeTab === "COLORS" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>REAL PAINTS CATALOG</span>
                  <span className="text-[#FF8C38] font-bold">{catalogPaints.length} Colors</span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {catalogPaints.map((paint) => {
                    const paintColorHex = paint.code || paint.hex || "#C4B199";
                    const isSelected = currentColor.toLowerCase() === paintColorHex.toLowerCase();
                    return (
                      <button
                        key={paint.id || paint.code || paint.name}
                        type="button"
                        onClick={() => onColorChange(paintColorHex)}
                        className={`p-2 rounded-2xl border flex items-center gap-2 text-left transition-all ${
                          isSelected
                            ? "bg-[#FF8C38]/25 border-[#FF8C38] text-white shadow-lg"
                            : "bg-neutral-900 border-neutral-850 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-inner"
                          style={{ backgroundColor: paintColorHex }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold block truncate text-white">{paint.name}</span>
                          <span className="text-[8px] font-mono text-neutral-400 block uppercase">
                            {paint.brand || paintColorHex}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 border-t border-neutral-850 space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-neutral-400 font-bold block">
                    Custom Hex Paint Code
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="w-7 h-7 rounded-lg border border-neutral-800 bg-transparent cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#FF8C38]"
                      placeholder="#C4B199"
                    />
                    <button
                      type="button"
                      onClick={() => onColorChange(customHex)}
                      className="px-3 py-1 bg-[#FF8C38] hover:bg-[#FF8C38] text-black font-extrabold text-[10px] uppercase rounded-xl transition-all shadow-md active:scale-95 shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SHEENS & FINISHES */}
            {activeTab === "FINISHES" && (
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                  Select Wall Paint Sheen (Reflectivity & Texture)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "EMULSION", label: "Matte", desc: "Low sheen / Flat" },
                    { id: "SATIN", label: "Satin", desc: "Soft eggshell luster" },
                    { id: "GLOSS", label: "Gloss", desc: "High sheen reflect" },
                  ].map((finish) => {
                    const isSelected = currentFinish === finish.id;

                    return (
                      <button
                        key={finish.id}
                        type="button"
                        onClick={() => onFinishChange(finish.id as WallFinishType)}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? "bg-[#FF8C38]/25 border-[#FF8C38] text-orange-300 shadow-lg font-black"
                            : "bg-neutral-900 border-neutral-850 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <span className="text-xs font-bold">{finish.label}</span>
                        <span className="text-[8px] font-mono text-neutral-400 leading-tight">{finish.desc}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-neutral-850 space-y-2">
                  <span className="text-[9px] font-mono text-neutral-400 block">
                    Active Sheen on <span className="font-bold text-white">{targetKey.toUpperCase()}</span>:{" "}
                    <span className="text-[#FF8C38] font-bold">{currentFinish}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onApplyFinishToAllWalls(currentFinish as WallFinishType)}
                    className="w-full py-2 text-[10px] font-mono font-bold uppercase text-[#FF8C38] bg-[#FF8C38]/15 hover:bg-[#FF8C38]/25 rounded-2xl border border-[#FF8C38]/30 transition-all text-center shadow-md active:scale-95"
                  >
                    ✨ Apply {currentFinish} Finish to All Walls
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
