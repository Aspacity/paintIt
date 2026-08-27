"use client";

import React, { useState } from "react";

export interface BulbState {
  id: string;
  type: "point" | "spot";
  name: string;
  intensity: number;
  color: string;
  enabled: boolean;
  visible?: boolean;
  position: [number, number, number];
  rotation?: [number, number, number];
  distance?: number;
}

interface LightControlsProps {
  bulbs: BulbState[];
  setBulbs: React.Dispatch<React.SetStateAction<BulbState[]>>;
  isNightMode: boolean;
  setIsNightMode: (val: boolean) => void;
  selectedBulbId?: string | null;
  onSelectBulb?: (id: string | null) => void;
  isPainterMode?: boolean;
}

const PALETTE_LIGHT_COLORS = [
  { name: "Warm Gold", hex: "#fff4e5" },
  { name: "Crisp Daylight", hex: "#ffffff" },
  { name: "Soft Amber", hex: "#fef3c7" },
  { name: "Sky Ambient", hex: "#e0f2fe" },
  { name: "Candlelight", hex: "#ffedd5" },
];

export default function LightControls({
  bulbs,
  setBulbs,
  isNightMode,
  setIsNightMode,
  selectedBulbId,
  onSelectBulb,
  isPainterMode = false,
}: LightControlsProps) {
  const [activeBulbId, setActiveBulbId] = useState<string | null>(selectedBulbId || bulbs[0]?.id || null);

  const toggleBulb = (id: string) => {
    setBulbs((prev) =>
      prev.map((bulb) => {
        if (bulb.id === id) {
          const nextState = bulb.visible !== undefined ? !bulb.visible : !bulb.enabled;
          return { ...bulb, enabled: nextState, visible: nextState };
        }
        return bulb;
      })
    );
  };

  const handleAddBulb = (type: "spot" | "point") => {
    if (isPainterMode) return;
    const newId = `bulb_${Date.now()}`;
    const newBulb: BulbState = {
      id: newId,
      type,
      name: `${type === "spot" ? "Recessed Downlight" : "Ambient Point Light"} #${bulbs.length + 1}`,
      intensity: type === "spot" ? 2.5 : 1.2,
      color: "#fff4e5",
      enabled: true,
      visible: true,
      position: [0, 2.7, 0],
      distance: 12,
    };
    setBulbs((prev) => [...prev, newBulb]);
    setActiveBulbId(newId);
    onSelectBulb?.(newId);
  };

  const handleDeleteBulb = (id: string) => {
    if (isPainterMode) return;
    setBulbs((prev) => prev.filter((b) => b.id !== id));
    if (activeBulbId === id) {
      const remaining = bulbs.filter((b) => b.id !== id);
      const nextId = remaining[0]?.id || null;
      setActiveBulbId(nextId);
      onSelectBulb?.(nextId);
    }
  };

  const updateBulbProperty = (id: string, updates: Partial<BulbState>) => {
    if (isPainterMode) return;
    setBulbs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const updateBulbPosition = (id: string, axis: 0 | 1 | 2, val: number) => {
    if (isPainterMode) return;
    setBulbs((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newPos = [...b.position] as [number, number, number];
          newPos[axis] = val;
          return { ...b, position: newPos };
        }
        return b;
      })
    );
  };

  const currentBulb = bulbs.find((b) => b.id === activeBulbId);

  return (
    <div className="bg-neutral-950 p-4 rounded-3xl border border-neutral-850 space-y-4 text-white font-sans select-none">
      {/* ☀️ DAY / NIGHT AMBIENCE SWITCHER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
            Natural Sun & Sky Mode
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
            {isNightMode ? "🌙 Night Ambient" : "☀️ Natural Day"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsNightMode(false)}
            className={`py-2 rounded-xl border flex items-center justify-center gap-2 transition-all text-[10px] uppercase font-black ${
              !isNightMode
                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md"
                : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}
          >
            <span>☀️</span> Day Mode
          </button>
          <button
            type="button"
            onClick={() => setIsNightMode(true)}
            className={`py-2 rounded-xl border flex items-center justify-center gap-2 transition-all text-[10px] uppercase font-black ${
              isNightMode
                ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md"
                : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}
          >
            <span>🌙</span> Night Mode
          </button>
        </div>
      </div>

      {/* 💡 BULB SELECTOR & ON/OFF TOGGLE SWITCHES */}
      <div className="space-y-2 border-t border-neutral-900 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
            Light Fixtures ({bulbs.length})
          </span>
          {!isPainterMode && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleAddBulb("spot")}
                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-black uppercase rounded-lg transition-all"
              >
                + Spot Bulb
              </button>
              <button
                onClick={() => handleAddBulb("point")}
                className="px-2 py-1 bg-indigo-500 hover:bg-indigo-400 text-white text-[9px] font-black uppercase rounded-lg transition-all"
              >
                + Point Light
              </button>
            </div>
          )}
        </div>

        {/* BULB CHIP LIST WITH 1-TAP ON/OFF */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {bulbs.map((b, idx) => {
            const isSelected = b.id === activeBulbId;
            const isOn = b.visible !== undefined ? b.visible : b.enabled;
            return (
              <button
                key={b.id}
                onClick={() => {
                  toggleBulb(b.id);
                  setActiveBulbId(b.id);
                  onSelectBulb?.(b.id);
                }}
                className={`px-3 py-1.5 rounded-xl border shrink-0 text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? "bg-neutral-800 border-emerald-500 text-white shadow-md"
                    : "bg-neutral-900 border-neutral-850 text-neutral-400"
                }`}
                title="Tap to toggle ON / OFF"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${isOn ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
                <span className="text-[10px] font-bold uppercase">
                  {b.type === "spot" ? `🎯 Spot #${idx + 1}` : `💡 Point #${idx + 1}`} ({isOn ? "ON" : "OFF"})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🎚️ ADVANCED SLIDERS / GLIDES PANEL (ADMIN ONLY - HIDDEN FOR PAINTERS!) */}
      {!isPainterMode && currentBulb && (
        <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-850 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBulb(currentBulb.id)}
                className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${
                  (currentBulb.visible !== undefined ? currentBulb.visible : currentBulb.enabled)
                    ? "bg-emerald-500 text-black"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {(currentBulb.visible !== undefined ? currentBulb.visible : currentBulb.enabled) ? "ON" : "OFF"}
              </button>
              <span className="text-[11px] font-bold text-white uppercase">{currentBulb.name}</span>
            </div>
            <button
              onClick={() => handleDeleteBulb(currentBulb.id)}
              className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase px-2 py-0.5 bg-red-950/40 rounded-md border border-red-900/50"
            >
              Delete
            </button>
          </div>

          {/* INTENSITY SLIDER GLIDE */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-neutral-400">
              <span>INTENSITY</span>
              <span className="text-emerald-400 font-bold">{currentBulb.intensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20.0"
              step="0.1"
              value={currentBulb.intensity}
              onChange={(e) => updateBulbProperty(currentBulb.id, { intensity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* RADIUS / DISTANCE SLIDER GLIDE */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-neutral-400">
              <span>RADIUS / DISTANCE</span>
              <span className="text-emerald-400 font-bold">{(currentBulb.distance || 12).toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="35.0"
              step="0.5"
              value={currentBulb.distance || 12}
              onChange={(e) => updateBulbProperty(currentBulb.id, { distance: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* POSITION X, Y, Z SLIDERS & FINE CONTROLS */}
          <div className="space-y-2 border-t border-neutral-800 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase text-neutral-400 font-bold">3D Light Position Coordinates (X, Y, Z)</span>
            </div>
            
            {/* Position X */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-red-400 w-4 font-bold">X:</span>
              <input
                type="range"
                min="-10.0"
                max="10.0"
                step="0.05"
                value={currentBulb.position[0]}
                onChange={(e) => updateBulbPosition(currentBulb.id, 0, parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <input
                type="number"
                step="0.1"
                value={currentBulb.position[0]}
                onChange={(e) => updateBulbPosition(currentBulb.id, 0, parseFloat(e.target.value) || 0)}
                className="w-12 h-6 px-1 bg-neutral-950 border border-neutral-800 rounded text-[9px] font-mono text-emerald-400 text-right focus:outline-none"
              />
            </div>

            {/* Position Y (Height) */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-emerald-400 w-4 font-bold">Y:</span>
              <input
                type="range"
                min="0.1"
                max="8.0"
                step="0.05"
                value={currentBulb.position[1]}
                onChange={(e) => updateBulbPosition(currentBulb.id, 1, parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <input
                type="number"
                step="0.1"
                value={currentBulb.position[1]}
                onChange={(e) => updateBulbPosition(currentBulb.id, 1, parseFloat(e.target.value) || 0)}
                className="w-12 h-6 px-1 bg-neutral-950 border border-neutral-800 rounded text-[9px] font-mono text-emerald-400 text-right focus:outline-none"
              />
            </div>

            {/* Position Z */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-blue-400 w-4 font-bold">Z:</span>
              <input
                type="range"
                min="-10.0"
                max="10.0"
                step="0.05"
                value={currentBulb.position[2]}
                onChange={(e) => updateBulbPosition(currentBulb.id, 2, parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <input
                type="number"
                step="0.1"
                value={currentBulb.position[2]}
                onChange={(e) => updateBulbPosition(currentBulb.id, 2, parseFloat(e.target.value) || 0)}
                className="w-12 h-6 px-1 bg-neutral-950 border border-neutral-800 rounded text-[9px] font-mono text-emerald-400 text-right focus:outline-none"
              />
            </div>
          </div>

          {/* BULB COLOR SWATCHES */}
          <div className="space-y-1 border-t border-neutral-800 pt-2">
            <span className="text-[9px] font-mono uppercase text-neutral-500">Bulb Tint Color</span>
            <div className="flex items-center gap-1.5">
              {PALETTE_LIGHT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => updateBulbProperty(currentBulb.id, { color: c.hex })}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    currentBulb.color.toLowerCase() === c.hex.toLowerCase()
                      ? "border-emerald-400 scale-110 shadow-md"
                      : "border-neutral-700"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}