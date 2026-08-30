'use client';

import React, { useState } from 'react';
import { REAL_PAINTS_CATALOG } from '@/config/paints';

export interface CustomColor {
  name: string;
  hex: string;
  brand?: string;
  id?: string;
}

export interface PaintFinishPreset {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export const PAINT_FINISH_PRESETS: PaintFinishPreset[] = [
  { id: "EMULSION", name: "Emulsion", desc: "Soft Matte Finish", icon: "🛋️" },
  { id: "GLOSS", name: "Gloss", desc: "High Sheen Reflective", icon: "💎" },
  { id: "SATIN", name: "Satin", desc: "Subtle Silk Sheen", icon: "✨" },
];

interface PaintPickerProps {
  activeSurface: string;
  roomColors: Record<string, string>;
  setRoomColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  roomFinishes?: Record<string, string>;
  setRoomFinishes?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customColors: CustomColor[];
  setCustomColors: React.Dispatch<React.SetStateAction<CustomColor[]>>;
  detectedMeshes?: string[];
  onSurfaceSelect?: (meshName: string) => void;
  isReadOnly?: boolean;
}

export default function PaintPicker({
  activeSurface,
  roomColors,
  setRoomColors,
  roomFinishes = {},
  setRoomFinishes,
  customColors,
  setCustomColors,
  detectedMeshes = [],
  onSurfaceSelect,
  isReadOnly = false
}: PaintPickerProps) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#10B981");
  const [isSyncing, setIsSyncing] = useState(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const combinedPaintDeck = [
    ...REAL_PAINTS_CATALOG.map(p => ({ name: p.name, hex: p.code, brand: p.brand })),
    ...customColors.map(c => ({ name: c.name, hex: c.hex, brand: c.brand || "Custom Mix" }))
  ];

  const currentFinishId = roomFinishes[activeSurface] || "EMULSION";

  const handleFinishChange = (finishId: string) => {
    if (setRoomFinishes) {
      setRoomFinishes(prev => ({ ...prev, [activeSurface]: finishId }));
    }
  };

  const handleAddCustomColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !newColorName.trim() || !newColorHex.trim()) return;

    let formattedHex = newColorHex.trim();
    if (!formattedHex.startsWith("#")) {
      formattedHex = `#${formattedHex}`;
    }

    const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
    if (!hexRegex.test(formattedHex)) {
      alert("Please enter a valid Hex color code (e.g., #FFBF00 or F2EFE9)");
      return;
    }

    const newColor: CustomColor = {
      name: newColorName.trim(),
      hex: formattedHex,
      brand: "Custom Mix"
    };

    setCustomColors((prev) => [...prev, newColor]);
    setRoomColors((prev) => ({ ...prev, [activeSurface]: formattedHex }));
    setNewColorName("");
    setNewColorHex("#10B981");

    if (typeof window !== "undefined") {
      const activeToken = localStorage.getItem("paintit_access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (activeToken) {
        setIsSyncing(true);
        try {
          await fetch(`${BACKEND_API_URL}/api/profile/custom-paints`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${activeToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: newColor.name,
              code: newColor.hex,
              brand: newColor.brand
            })
          });
        } catch (err) {
          console.error("❌ Profile canvas sync exception:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    }
  };

  const formatSurfaceName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
  };

  return (
    <div className="space-y-4 font-sans text-white">
      {/* 🎯 ACTIVE SURFACE TARGET HUD */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span className="text-[8px] uppercase font-black text-neutral-500 tracking-wider block">Currently Painting</span>
          <span className="text-xs font-black uppercase text-[#FF8C38] tracking-wide">
            {formatSurfaceName(activeSurface)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-neutral-700 shadow-inner"
            style={{ backgroundColor: roomColors[activeSurface] || '#ffffff' }}
          />
          <span className="text-[9px] font-mono text-neutral-400">
            {(roomColors[activeSurface] || '#FFFFFF').toUpperCase()}
          </span>
        </div>
      </div>

      {/* 🎯 MESH SELECTOR DROPDOWN */}
      {detectedMeshes.length > 0 && onSurfaceSelect && (
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 block">Select 3D Mesh Surface</span>
          <select
            value={activeSurface}
            onChange={(e) => onSurfaceSelect(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-2.5 rounded-xl text-xs text-neutral-200 font-bold focus:outline-none transition-all cursor-pointer"
          >
            {detectedMeshes.map((mesh) => (
              <option key={mesh} value={mesh}>
                {formatSurfaceName(mesh)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ✨ PAINT FINISH SHEEN SELECTOR */}
      <div className="space-y-1.5 bg-neutral-950 p-3 border border-neutral-850 rounded-2xl">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-400">
            Paint Finish & Sheen Type
          </span>
          <span className="text-[9px] font-mono text-[#FF8C38] font-bold">
            {PAINT_FINISH_PRESETS.find(f => f.id === currentFinishId)?.name || "Emulsion"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PAINT_FINISH_PRESETS.map((finish) => {
            const isSelected = currentFinishId === finish.id;
            return (
              <button
                key={finish.id}
                type="button"
                onClick={() => handleFinishChange(finish.id)}
                className={`py-2 px-1 rounded-xl border text-[8px] font-black uppercase tracking-wider transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? "bg-[#FF8C38]/25 border-[#FF8C38] text-orange-300 shadow-md"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
                title={finish.desc}
              >
                <span className="text-xs">{finish.icon}</span>
                <span className="truncate w-full">{finish.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified Paint Deck Selection Row */}
      <div className="space-y-2">
        <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500">Available Paint Catalog Decks</span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {combinedPaintDeck.map((paint, index) => {
            const isSelected = (roomColors[activeSurface] || '#ffffff').toUpperCase() === paint.hex.toUpperCase();
            return (
              <button
                key={`${paint.hex}-${index}`}
                type="button"
                onClick={() => setRoomColors((prev) => ({ ...prev, [activeSurface]: paint.hex }))}
                className={`snap-center shrink-0 w-28 p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected ? "bg-white border-white text-neutral-950" : "bg-neutral-900 border-neutral-850 text-white"
                }`}
              >
                <div className="w-5 h-5 rounded-full border border-neutral-800/20" style={{ backgroundColor: paint.hex }} />
                <div className="mt-2">
                  <span className="text-[8px] uppercase font-bold text-[#FF8C38] block truncate leading-none mb-0.5">{paint.brand}</span>
                  <span className="text-[9px] font-black truncate block leading-tight">{paint.name}</span>
                </div>
                <span className="text-[8px] font-mono mt-1 opacity-60">{paint.hex.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Mixer Workspace Block */}
      {!isReadOnly && (
        <div className="border-t border-neutral-900 pt-3">
          <form onSubmit={handleAddCustomColor} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-neutral-400">Custom Color Mixer</span>
              {isSyncing && <span className="text-[8px] font-mono text-[#FF8C38] animate-pulse">Syncing...</span>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Paint Name (e.g. Royal Cream)"
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none placeholder:text-neutral-600"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-neutral-800 bg-neutral-900 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  placeholder="#10B981"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#FF8C38] hover:bg-[#FF8C38] text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
            >
              + Add Custom Paint Color
            </button>
          </form>
        </div>
      )}
    </div>
  );
}