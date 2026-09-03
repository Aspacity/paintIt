"use client";

import React, { useState } from "react";
import LightControls from "@/components/canvas/LightControls";
import { MasterModelAssemblyPanel } from "@/components/canvas/master/MasterModelAssemblyPanel";
import { TEXTURE_PRESETS } from "@/utils/generateFloorTextures";
import { WallFinishType } from "@/components/canvas/PaintItMasterCanvas";

export type MobileTabType = "colors" | "finishes" | "textures" | "sun" | "lighting" | "assembly";

interface CanvasMobileToolsDrawerProps {
  config: any;
  paintsList: any[];
  activeSelectedWall: string | null;
  bulbs: any[];
  setBulbs: React.Dispatch<React.SetStateAction<any[]>>;
  selectedBulbId: string | null;
  setSelectedBulbId: (id: string | null) => void;
  studioMode: "PAINT" | "FURNITURE" | "ROOM";
  setStudioMode: (mode: "PAINT" | "FURNITURE" | "ROOM") => void;
  selectedFurnitureId: string | null;
  setSelectedFurnitureId: (id: string | null) => void;
  placedFurnitureAssets: any[];
  setPlacedFurnitureAssets: React.Dispatch<React.SetStateAction<any[]>>;
  furnitureTransformMode: "translate" | "rotate" | "scale";
  setFurnitureTransformMode: (mode: "translate" | "rotate" | "scale") => void;
  handleAddFurnitureAsset: (asset: any) => void;
  handleColorChange: (colorHex: string) => void;
  handleFinishChange: (finish: WallFinishType) => void;
  handleApplyFinishToAllWalls: (finish: WallFinishType) => void;
  onConfigChange?: (cfg: any) => void;
}

export function CanvasMobileToolsDrawer({
  config,
  paintsList,
  activeSelectedWall,
  bulbs,
  setBulbs,
  selectedBulbId,
  setSelectedBulbId,
  studioMode,
  setStudioMode,
  selectedFurnitureId,
  setSelectedFurnitureId,
  placedFurnitureAssets,
  setPlacedFurnitureAssets,
  furnitureTransformMode,
  setFurnitureTransformMode,
  handleAddFurnitureAsset,
  handleColorChange,
  handleFinishChange,
  handleApplyFinishToAllWalls,
  onConfigChange,
}: CanvasMobileToolsDrawerProps) {
  const [mobileTab, setMobileTab] = useState<MobileTabType>("colors");
  const [isMobileDrawerCollapsed, setIsMobileDrawerCollapsed] = useState<boolean>(false);
  const [mobileDrawerHeight, setMobileDrawerHeight] = useState<number>(260);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-neutral-950/95 backdrop-blur-2xl border-t border-neutral-850 shadow-2xl flex flex-col transition-all duration-200"
      style={{ height: isMobileDrawerCollapsed ? "44px" : `${mobileDrawerHeight}px` }}
    >
      {/* Control Bar */}
      <div
        className="h-9 border-b border-neutral-850 px-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 rounded-full bg-neutral-700 mx-auto" />
          <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">
            🛠️ Studio Tools
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileDrawerCollapsed(!isMobileDrawerCollapsed);
            if (isMobileDrawerCollapsed) {
              setMobileDrawerHeight(260);
            }
          }}
          className="px-2.5 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase text-[#FF8C38] hover:text-white transition-all flex items-center gap-1"
        >
          <span>{isMobileDrawerCollapsed ? "▲ Open Panel" : "▼ Collapse"}</span>
        </button>
      </div>

      {/* Horizontal Tab Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-1.5 border-b border-neutral-850/60 shrink-0 no-scrollbar">
        {[
          { id: "colors", label: "🎨 Paints" },
          { id: "finishes", label: "✨ Sheen" },
          ...(!config.hideFloorTab ? [{ id: "textures", label: "🪵 Floor" }] : []),
          ...(!config.hideLightingTab
            ? [
                { id: "sun", label: "☀️ Sun & Sky" },
                { id: "lighting", label: "💡 Bulbs" },
              ]
            : []),
          ...(!config.hideAssemblyPanel && config.isAdmin
            ? [{ id: "assembly", label: "🛠️ Assembly" }]
            : []),
        ].map((tab) => {
          const isSelected = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMobileTab(tab.id as any);
                if (isMobileDrawerCollapsed) {
                  setIsMobileDrawerCollapsed(false);
                  setMobileDrawerHeight(260);
                }
              }}
              className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold uppercase whitespace-nowrap transition-all ${
                isSelected && !isMobileDrawerCollapsed
                  ? "bg-[#FF8C38] text-neutral-950 shadow-md"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Drawer Body Content */}
      {!isMobileDrawerCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* 🎨 PAINTS TAB */}
          {mobileTab === "colors" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>SELECT PAINT SWATCH</span>
                <span className="text-[#FF8C38] font-bold">Double-Tap Wall To Apply</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {paintsList.map((paint) => {
                  const targetKey = activeSelectedWall || "wall_back";
                  const currentStates = config.wallSurfaceStates || {};
                  const isSelected = currentStates[targetKey]?.color === paint.code;
                  return (
                    <button
                      key={paint.id || paint.code}
                      onClick={() => handleColorChange(paint.code)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                        isSelected
                          ? "bg-[#FF8C38]/25 border-[#FF8C38] text-white shadow"
                          : "bg-neutral-900 border-neutral-850 text-neutral-300"
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-lg border border-white/20 shrink-0"
                        style={{ backgroundColor: paint.code }}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold block truncate">{paint.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ✨ FINISHES TAB */}
          {mobileTab === "finishes" && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Select Wall Paint Sheen
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "EMULSION", label: "Matte" },
                  { id: "SATIN", label: "Satin" },
                  { id: "GLOSS", label: "Gloss" },
                ].map((finish) => {
                  const targetKey = activeSelectedWall || "wall_back";
                  const currentStates = config.wallSurfaceStates || {};
                  const isSelected = currentStates[targetKey]?.finish === finish.id;

                  return (
                    <button
                      key={finish.id}
                      onClick={() => handleFinishChange(finish.id as WallFinishType)}
                      className={`p-2 rounded-xl border text-center transition-all text-xs font-bold ${
                        isSelected
                          ? "bg-[#FF8C38]/25 border-[#FF8C38] text-orange-300 shadow"
                          : "bg-neutral-900 border-neutral-850 text-neutral-300"
                      }`}
                    >
                      {finish.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  handleApplyFinishToAllWalls(
                    (config.wallSurfaceStates?.[activeSelectedWall || "wall_back"]?.finish as WallFinishType) || "EMULSION"
                  )
                }
                className="w-full py-1.5 text-[10px] font-mono font-bold uppercase text-[#FF8C38] bg-[#FF8C38]/15 rounded-xl border border-[#FF8C38]/30 text-center"
              >
                ✨ Finish All Walls
              </button>
            </div>
          )}

          {/* 🪵 TEXTURES TAB */}
          {mobileTab === "textures" && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Floor Texture
              </span>
              <div className="grid grid-cols-2 gap-2">
                {TEXTURE_PRESETS.filter((t) => t.category === "FLOOR").map((texture) => {
                  const isSelected = (config.activeFloorTextureId || "floor_oak") === texture.id;
                  return (
                    <button
                      key={texture.id}
                      onClick={() => onConfigChange?.({ activeFloorTextureId: texture.id })}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 ${
                        isSelected
                          ? "bg-[#FF8C38]/25 border-[#FF8C38] text-white"
                          : "bg-neutral-900 border-neutral-850 text-neutral-300"
                      }`}
                    >
                      <span className="text-sm">🪵</span>
                      <span className="text-[10px] font-bold truncate">{texture.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ☀️ SUN & SKY TAB */}
          {mobileTab === "sun" && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                Daylight Environment
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: "dawn", label: "🌅 Dawn" },
                  { key: "morning", label: "☀️ Morning" },
                  { key: "midday", label: "🌤️ Midday" },
                  { key: "goldenHour", label: "🌇 Golden" },
                  { key: "sunset", label: "🌆 Sunset" },
                  { key: "night", label: "🌙 Night" },
                ].map((p) => {
                  const isSelected = config.timeOfDay === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => onConfigChange?.({ timeOfDay: p.key })}
                      className={`py-1.5 text-[10px] font-bold rounded-xl border text-center ${
                        isSelected
                          ? "bg-[#FF8C38] text-black border-[#FF8C38] font-black shadow"
                          : "bg-neutral-900 text-neutral-300 border-neutral-800"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 💡 LIGHTING BULBS TAB */}
          {mobileTab === "lighting" && (
            <div className="space-y-2">
              <LightControls
                bulbs={bulbs}
                setBulbs={setBulbs}
                isNightMode={config.timeOfDay === "night"}
                setIsNightMode={(val) =>
                  onConfigChange?.({ timeOfDay: val ? "night" : "morning" })
                }
                selectedBulbId={selectedBulbId}
                onSelectBulb={setSelectedBulbId}
                isPainterMode={!config.isAdmin}
              />
            </div>
          )}

          {/* 🛠️ ASSEMBLY TAB */}
          {mobileTab === "assembly" && config.isAdmin && (
            <div className="space-y-2">
              <MasterModelAssemblyPanel
                activeRoomModelUrl={config.modelUrl}
                activeStudioMode={studioMode}
                selectedFurnitureId={selectedFurnitureId}
                placedAssets={placedFurnitureAssets}
                transformMode={furnitureTransformMode}
                onTransformModeChange={setFurnitureTransformMode}
                onUpdateTransform={(id, updates) => {
                  setPlacedFurnitureAssets((prev) =>
                    prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
                  );
                }}
                onSelectRoomModel={(newModelUrl) => {
                  onConfigChange?.({ modelUrl: newModelUrl });
                }}
                onSelectStudioMode={setStudioMode}
                onAddFurnitureAsset={handleAddFurnitureAsset}
                onSelectFurnitureInstance={setSelectedFurnitureId}
                onDeleteFurnitureInstance={(id) => {
                  setPlacedFurnitureAssets((prev) => prev.filter((item) => item.id !== id));
                  if (selectedFurnitureId === id) {
                    setSelectedFurnitureId(null);
                  }
                }}
                onClearAllFurniture={() => {
                  setPlacedFurnitureAssets([]);
                  setSelectedFurnitureId(null);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
