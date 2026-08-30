"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  REAL_ROOM_SHELLS,
  REAL_FURNISH_IT_ASSETS,
  FurnishItAssetItem,
  RoomModelItem,
} from "@/config/furnishItAssets";
import { CatalogAsset, AssetCategory } from "@/types/modular";
import { RoomChangeConfirmationModal } from "@/components/ui/RoomChangeConfirmationModal";

export interface PlacedFurnitureAsset {
  id: string;
  assetId: string;
  name: string;
  modelUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

interface MasterModelAssemblyPanelProps {
  activeRoomModelUrl: string;
  activeStudioMode: "PAINT" | "FURNITURE" | "ROOM";
  selectedFurnitureId: string | null;
  placedAssets: PlacedFurnitureAsset[];
  transformMode?: "translate" | "rotate" | "scale";
  onTransformModeChange?: (mode: "translate" | "rotate" | "scale") => void;
  onUpdateTransform?: (id: string, updates: Partial<PlacedFurnitureAsset>) => void;
  onSelectRoomModel: (modelUrl: string, keepPaints: boolean) => void;
  onSelectStudioMode: (mode: "PAINT" | "FURNITURE" | "ROOM") => void;
  onAddFurnitureAsset: (asset: FurnishItAssetItem) => void;
  onSelectFurnitureInstance: (id: string | null) => void;
  onDeleteFurnitureInstance: (id: string) => void;
  onClearAllFurniture: () => void;
}

export function MasterModelAssemblyPanel({
  activeRoomModelUrl,
  activeStudioMode,
  selectedFurnitureId,
  placedAssets,
  transformMode = "translate",
  onTransformModeChange,
  onUpdateTransform,
  onSelectRoomModel,
  onSelectStudioMode,
  onAddFurnitureAsset,
  onSelectFurnitureInstance,
  onDeleteFurnitureInstance,
  onClearAllFurniture,
}: MasterModelAssemblyPanelProps) {
  const [activeTab, setActiveTab] = useState<"CATALOG" | "ROOMS" | "SCENE">("CATALOG");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "SEATING" | "TABLES" | "DECOR">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [dynamicAssets, setDynamicAssets] = useState<FurnishItAssetItem[]>(REAL_FURNISH_IT_ASSETS);
  const [dynamicRooms, setDynamicRooms] = useState<RoomModelItem[]>(REAL_ROOM_SHELLS);

  // Pending Room Change Confirmation State
  const [pendingRoomItem, setPendingRoomItem] = useState<RoomModelItem | null>(null);

  // Draggable Position State
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1-Pointer Capture Drag Handlers
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

  // Dynamically Fetch Real GLB Models from /api/models
  useEffect(() => {
    async function loadRealModels() {
      try {
        const res = await fetch("/api/models");
        if (res.ok) {
          const data = await res.json();
          const rawModels: string[] = data.models || [];

          if (rawModels.length === 0) return;

          const parsedAssets: FurnishItAssetItem[] = [];
          const parsedRooms: RoomModelItem[] = [];

          rawModels.forEach((path) => {
            const filename = path.split("/").pop() || path;
            const cleanName = filename
              .replace(/\.glb$/i, "")
              .replace(/[-_]/g, " ")
              .replace(/\(.*\)/g, "")
              .trim();
            const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            const isShell = path.includes("shells/") || filename.includes("shell") || filename.includes("selfcon");

            if (isShell) {
              parsedRooms.push({
                id: path,
                name: formattedName,
                tagline: `Real GLB Room Model (${filename})`,
                thumbnailColor: path.includes("spacious") ? "#3b82f6" : "#8b5cf6",
                modelUrl: `/models/${path}`,
              });
            } else {
              let category: "SEATING" | "TABLES" | "DECOR" = "SEATING";
              let icon = "🛋️";
              if (path.includes("tables/") || filename.includes("table")) {
                category = "TABLES";
                icon = "☕";
              } else if (path.includes("decor/") || filename.includes("cotton") || filename.includes("plant")) {
                category = "DECOR";
                icon = "🌿";
              }

              parsedAssets.push({
                id: path,
                name: formattedName,
                category,
                thumbnailColor: category === "SEATING" ? "#475569" : category === "TABLES" ? "#94a3b8" : "#15803d",
                icon,
                modelUrl: `/models/${path}`,
                defaultScale: [1, 1, 1],
                description: `Real 3D GLB Asset from /public/models/${path}`,
              });
            }
          });

          if (parsedAssets.length > 0) setDynamicAssets(parsedAssets);
          if (parsedRooms.length > 0) setDynamicRooms(parsedRooms);
        }
      } catch (err) {
        console.error("Using static catalog fallback:", err);
      }
    }
    loadRealModels();
  }, []);

  const filteredAssets = dynamicAssets.filter((a) => {
    const matchesCat = categoryFilter === "ALL" || a.category === categoryFilter;
    const matchesSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedFurnitureAsset = placedAssets.find((a) => a.id === selectedFurnitureId) || null;

  return (
    <div
      className="pointer-events-auto z-30 transition-all duration-200"
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      {isCollapsed ? (
        /* 🛋️ MINIMIZED FLOATING PILL BUTTON (DRAGGABLE ANYWHERE!) */
        <button
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => setIsCollapsed(false)}
          className="bg-neutral-950/90 hover:bg-neutral-900 backdrop-blur-xl border border-neutral-800 text-white px-3.5 py-2 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black uppercase tracking-wider transition-all active:scale-95 border-cyan-500/30 cursor-grab active:cursor-grabbing select-none"
          title="Expand Model Assembly Panel (Drag anywhere)"
        >
          <span className="text-neutral-500 font-bold">⋮⋮</span>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>🛋️ Assembly ({placedAssets.length})</span>
          <span className="text-cyan-400">◀</span>
        </button>
      ) : (
        /* 🛋️ EXPANDED DRAGGABLE & COLLAPSIBLE ASSEMBLY PANEL */
        <div className="bg-neutral-950/95 backdrop-blur-2xl border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden w-80 text-white select-none transition-all flex flex-col max-h-[80vh]">
          {/* 🟢 DRAGGABLE HANDLE HEADER */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="px-4 py-3 bg-neutral-900/90 border-b border-neutral-800/80 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-bold text-xs">⋮⋮</span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">
                Model Assembly & FurnishIT
              </h3>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 hover:border-cyan-400 text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all"
              title="Collapse Panel"
            >
              ➖
            </button>
          </div>

          <div className="p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800">
            {/* 🕹️ STUDIO MODE SWITCHER TABS */}
            <div className="bg-neutral-900/90 p-1 rounded-2xl border border-neutral-800/80 grid grid-cols-2 gap-1">
              <button
                onClick={() => onSelectStudioMode("PAINT")}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeStudioMode === "PAINT"
                    ? "bg-[#FF8C38] text-neutral-950 shadow-lg font-black"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <span>🎨 Paint Mode</span>
              </button>

              <button
                onClick={() => onSelectStudioMode("FURNITURE")}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeStudioMode === "FURNITURE"
                    ? "bg-cyan-400 text-neutral-950 shadow-lg font-black"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <span>🛋️ Furniture Mode</span>
              </button>
            </div>

            {/* DORMANT PAINT ENGINE STATUS BANNER */}
            {activeStudioMode === "FURNITURE" && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-cyan-400 text-xs font-bold">🔒 Paint Dormant</span>
                <span className="text-[9px] font-mono text-cyan-200/80 leading-tight">
                  Wall painting paused. Click & transform 3D furniture models freely!
                </span>
              </div>
            )}

            {/* 📂 PANEL SECTION TABS */}
            <div className="flex items-center gap-1 border-b border-neutral-800/80 pb-2">
              <button
                onClick={() => setActiveTab("CATALOG")}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-xl transition-all ${
                  activeTab === "CATALOG"
                    ? "bg-neutral-800 text-cyan-400 border border-cyan-500/30 font-black shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                🛋️ Furniture ({dynamicAssets.length})
              </button>
              <button
                onClick={() => setActiveTab("ROOMS")}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-xl transition-all ${
                  activeTab === "ROOMS"
                    ? "bg-neutral-800 text-cyan-400 border border-cyan-500/30 font-black shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                🏠 Rooms ({dynamicRooms.length})
              </button>
              <button
                onClick={() => setActiveTab("SCENE")}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-xl transition-all ${
                  activeTab === "SCENE"
                    ? "bg-neutral-800 text-cyan-400 border border-cyan-500/30 font-black shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                📦 Placed ({placedAssets.length})
              </button>
            </div>

            {/* 🏠 TAB 1: ROOM SHELL SELECTION */}
            {activeTab === "ROOMS" && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wide block">
                  Select Architectural Room Shell
                </span>
                {dynamicRooms.map((room: RoomModelItem) => {
                  const isActive = activeRoomModelUrl === room.modelUrl;
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        if (isActive) return;
                        setPendingRoomItem(room);
                      }}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isActive
                          ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md"
                          : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold shadow"
                        style={{ backgroundColor: room.thumbnailColor }}
                      >
                        🏠
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-200 truncate">{room.name}</span>
                          {isActive && <span className="text-[9px] font-bold text-cyan-400 uppercase">ACTIVE</span>}
                        </div>
                        <p className="text-[9px] font-mono text-neutral-400 leading-tight line-clamp-2 mt-0.5">
                          {room.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 🏠 ROOM CHANGE CONFIRMATION MODAL OVERLAY */}
            <RoomChangeConfirmationModal
              isOpen={pendingRoomItem !== null}
              targetRoomName={pendingRoomItem?.name || ""}
              onKeepChanges={() => {
                if (pendingRoomItem) {
                  onSelectRoomModel(pendingRoomItem.modelUrl, true);
                  setPendingRoomItem(null);
                }
              }}
              onDiscardChanges={() => {
                if (pendingRoomItem) {
                  onSelectRoomModel(pendingRoomItem.modelUrl, false);
                  setPendingRoomItem(null);
                }
              }}
              onCancel={() => setPendingRoomItem(null)}
            />

            {/* 🛋️ TAB 2: FURNITURE CATALOG */}
            {activeTab === "CATALOG" && (
              <div className="space-y-2">
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Search 3D models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50"
                />

                {/* Category Filters */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {(["ALL", "SEATING", "TABLES", "DECOR"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-lg shrink-0 transition-all ${
                        categoryFilter === cat
                          ? "bg-cyan-400 text-neutral-950 font-black shadow"
                          : "bg-neutral-900 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Asset Cards Grid */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                  {filteredAssets.map((asset: FurnishItAssetItem) => (
                    <div
                      key={asset.id}
                      className="p-2 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl flex items-center justify-between hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow shrink-0"
                          style={{ backgroundColor: asset.thumbnailColor }}
                        >
                          {asset.icon}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-neutral-200 block truncate">{asset.name}</span>
                          <span className="text-[9px] font-mono text-neutral-400 block truncate">
                            {asset.description}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectStudioMode("FURNITURE");
                          onAddFurnitureAsset(asset);
                        }}
                        className="px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-[9px] font-black uppercase rounded-xl shrink-0 transition-all shadow active:scale-95 flex items-center gap-1"
                      >
                        <span>➕ Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📦 TAB 3: PLACED SCENE INSTANCES */}
            {activeTab === "SCENE" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                    Placed Items ({placedAssets.length})
                  </span>
                  {placedAssets.length > 0 && (
                    <button
                      onClick={onClearAllFurniture}
                      className="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wide"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {placedAssets.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-neutral-800 rounded-2xl">
                    <span className="text-2xl block mb-1">📦</span>
                    <span className="text-xs font-mono text-neutral-500">No 3D furniture placed in room.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                    {placedAssets.map((item) => {
                      const isSelected = selectedFurnitureId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            onSelectStudioMode("FURNITURE");
                            onSelectFurnitureInstance(item.id);
                          }}
                          className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md"
                              : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs">🛋️</span>
                            <span className="text-xs font-bold text-neutral-200 truncate">{item.name}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFurnitureInstance(item.id);
                            }}
                            className="p-1 text-neutral-500 hover:text-rose-400 transition-all text-xs"
                            title="Delete Asset"
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 🎛️ SELECTED 3D MODEL TRANSFORM & GLIDE CONTROLS (INSIDE PANEL!) */}
                {selectedFurnitureAsset && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 space-y-3 mt-2 text-left">
                    <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                        <span>🎯 Active Asset:</span>
                        <span className="text-white truncate max-w-[130px]">{selectedFurnitureAsset.name}</span>
                      </span>
                      <button
                        onClick={() => onDeleteFurnitureInstance(selectedFurnitureAsset.id)}
                        className="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase px-2 py-0.5 bg-rose-500/10 rounded border border-rose-500/20"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    {/* 🧩 SUB-MESH MATERIAL INSPECTOR CHIPS (BLENDER MULTI-MATERIAL) */}
                    <div className="space-y-1 bg-neutral-950 p-2 rounded-xl border border-neutral-850">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
                        Sub-Mesh Materials (Blender Tree):
                      </span>
                      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                        <span className="px-2 py-0.5 bg-neutral-900 rounded border border-neutral-800 text-[9px] font-mono text-cyan-300">
                          🛋️ Primary Mesh
                        </span>
                        <span className="px-2 py-0.5 bg-neutral-900 rounded border border-neutral-800 text-[9px] font-mono text-neutral-400">
                          🪵 Base Finish
                        </span>
                      </div>
                    </div>

                    {/* Transform Mode Switcher Pills */}
                    <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                      <button
                        onClick={() => onTransformModeChange?.("translate")}
                        className={`py-1 text-[9px] font-mono font-black uppercase rounded-lg transition-all ${
                          transformMode === "translate"
                            ? "bg-cyan-400 text-neutral-950 shadow"
                            : "text-neutral-400 hover:text-white"
                        }`}
                        title="Glide XZ Floor Plane"
                      >
                        ↔️ Glide
                      </button>

                      <button
                        onClick={() => onTransformModeChange?.("rotate")}
                        className={`py-1 text-[9px] font-mono font-black uppercase rounded-lg transition-all ${
                          transformMode === "rotate"
                            ? "bg-cyan-400 text-neutral-950 shadow"
                            : "text-neutral-400 hover:text-white"
                        }`}
                        title="Rotate Model"
                      >
                        🔄 Rotate
                      </button>

                      <button
                        onClick={() => onTransformModeChange?.("scale")}
                        className={`py-1 text-[9px] font-mono font-black uppercase rounded-lg transition-all ${
                          transformMode === "scale"
                            ? "bg-cyan-400 text-neutral-950 shadow"
                            : "text-neutral-400 hover:text-white"
                        }`}
                        title="Scale Model Size"
                      >
                        📐 Scale
                      </button>
                    </div>

                    {/* 🎚️ DYNAMIC SEEK / GLIDE LINES RESPONDING TO ACTIVE TRANSFORM TAB */}
                    <div className="space-y-3 text-[10px] font-mono text-neutral-300">
                      {/* 🟢 1. POSITION / GLIDE TAB SLIDERS */}
                      {transformMode === "translate" && (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-[9px] text-neutral-400 font-bold uppercase border-b border-neutral-850 pb-1">
                            <span>↔️ Floor Position Seek (XZ Plane)</span>
                            <button
                              onClick={() => {
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  position: [0, selectedFurnitureAsset.position[1], 0],
                                });
                              }}
                              className="text-cyan-400 hover:underline text-[9px]"
                            >
                              Center Floor (0, 0)
                            </button>
                          </div>

                          {/* Position X Glide Line */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Position X (East / West):</span>
                              <span className="text-cyan-300 font-bold">
                                {selectedFurnitureAsset.position[0].toFixed(2)}m
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-5.0"
                              max="5.0"
                              step="0.02"
                              value={selectedFurnitureAsset.position[0]}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  position: [val, selectedFurnitureAsset.position[1], selectedFurnitureAsset.position[2]],
                                });
                              }}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Position Z Glide Line */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Position Z (North / South):</span>
                              <span className="text-cyan-300 font-bold">
                                {selectedFurnitureAsset.position[2].toFixed(2)}m
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-5.0"
                              max="5.0"
                              step="0.02"
                              value={selectedFurnitureAsset.position[2]}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  position: [selectedFurnitureAsset.position[0], selectedFurnitureAsset.position[1], val],
                                });
                              }}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>
                        </div>
                      )}

                      {/* 🔄 2. ROTATION TAB SLIDERS (ALL 3 AXES) */}
                      {transformMode === "rotate" && (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-[9px] text-neutral-400 font-bold uppercase border-b border-neutral-850 pb-1">
                            <span>🔄 3D Rotation Seek (X, Y, Z Degrees)</span>
                            <button
                              onClick={() => {
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  rotation: [0, 0, 0],
                                });
                              }}
                              className="text-cyan-400 hover:underline text-[9px]"
                            >
                              ↺ Reset (0°, 0°, 0°)
                            </button>
                          </div>

                          {/* Rotation Y (Yaw / Floor Spin) */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Rotation Y (Floor Turn):</span>
                              <span className="text-cyan-300 font-bold">
                                {Math.round(((selectedFurnitureAsset.rotation[1] || 0) * 180) / Math.PI)}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              step="1"
                              value={Math.round(((selectedFurnitureAsset.rotation[1] || 0) * 180) / Math.PI)}
                              onChange={(e) => {
                                const deg = parseFloat(e.target.value);
                                const rad = (deg * Math.PI) / 180;
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  rotation: [selectedFurnitureAsset.rotation[0], rad, selectedFurnitureAsset.rotation[2]],
                                });
                              }}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Rotation X (Pitch / Tilt) */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Rotation X (Forward Pitch):</span>
                              <span className="text-cyan-300 font-bold">
                                {Math.round(((selectedFurnitureAsset.rotation[0] || 0) * 180) / Math.PI)}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              step="1"
                              value={Math.round(((selectedFurnitureAsset.rotation[0] || 0) * 180) / Math.PI)}
                              onChange={(e) => {
                                const deg = parseFloat(e.target.value);
                                const rad = (deg * Math.PI) / 180;
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  rotation: [rad, selectedFurnitureAsset.rotation[1], selectedFurnitureAsset.rotation[2]],
                                });
                              }}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Rotation Z (Roll / Bank) */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Rotation Z (Side Roll):</span>
                              <span className="text-cyan-300 font-bold">
                                {Math.round(((selectedFurnitureAsset.rotation[2] || 0) * 180) / Math.PI)}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              step="1"
                              value={Math.round(((selectedFurnitureAsset.rotation[2] || 0) * 180) / Math.PI)}
                              onChange={(e) => {
                                const deg = parseFloat(e.target.value);
                                const rad = (deg * Math.PI) / 180;
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  rotation: [selectedFurnitureAsset.rotation[0], selectedFurnitureAsset.rotation[1], rad],
                                });
                              }}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>
                        </div>
                      )}

                      {/* 📐 3. SCALE TAB SLIDERS (GENERAL ALL-DIRECTION UNIFIED + INDIVIDUAL AXES) */}
                      {transformMode === "scale" && (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-[9px] text-neutral-400 font-bold uppercase border-b border-neutral-850 pb-1">
                            <span>📐 Mesh Scale & Proportions</span>
                            <button
                              onClick={() => {
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  scale: [1.8, 1.8, 1.8],
                                });
                              }}
                              className="text-cyan-400 hover:underline text-[9px]"
                            >
                              Reset Scale (1.8x)
                            </button>
                          </div>

                          {/* 🌐 GENERAL PROPORTIONAL UNIFIED SCALE SLIDER (ALL DIRECTIONS) */}
                          <div className="p-2 bg-neutral-950 rounded-xl border border-cyan-500/30 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-cyan-300 font-bold flex items-center gap-1">
                                <span>🌐</span> General Unified Scale (All Directions):
                              </span>
                              <span className="text-cyan-300 font-black">
                                {(selectedFurnitureAsset.scale[0] || 1.8).toFixed(2)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.2"
                              max="6.0"
                              step="0.05"
                              value={selectedFurnitureAsset.scale[0] || 1.8}
                              onChange={(e) => {
                                const s = parseFloat(e.target.value);
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  scale: [s, s, s],
                                });
                              }}
                              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Individual Scale X (Width) */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Scale X (Width Proportions):</span>
                              <span className="text-cyan-300 font-bold">
                                {(selectedFurnitureAsset.scale[0] || 1.8).toFixed(2)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.2"
                              max="6.0"
                              step="0.05"
                              value={selectedFurnitureAsset.scale[0] || 1.8}
                              onChange={(e) => {
                                const s = parseFloat(e.target.value);
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  scale: [s, selectedFurnitureAsset.scale[1], selectedFurnitureAsset.scale[2]],
                                });
                              }}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Individual Scale Y (Height) */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Scale Y (Height Proportions):</span>
                              <span className="text-cyan-300 font-bold">
                                {(selectedFurnitureAsset.scale[1] || 1.8).toFixed(2)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.2"
                              max="6.0"
                              step="0.05"
                              value={selectedFurnitureAsset.scale[1] || 1.8}
                              onChange={(e) => {
                                const s = parseFloat(e.target.value);
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  scale: [selectedFurnitureAsset.scale[0], s, selectedFurnitureAsset.scale[2]],
                                });
                              }}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Individual Scale Z (Depth) */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Scale Z (Depth Proportions):</span>
                              <span className="text-cyan-300 font-bold">
                                {(selectedFurnitureAsset.scale[2] || 1.8).toFixed(2)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.2"
                              max="6.0"
                              step="0.05"
                              value={selectedFurnitureAsset.scale[2] || 1.8}
                              onChange={(e) => {
                                const s = parseFloat(e.target.value);
                                onUpdateTransform?.(selectedFurnitureAsset.id, {
                                  scale: [selectedFurnitureAsset.scale[0], selectedFurnitureAsset.scale[1], s],
                                });
                              }}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
