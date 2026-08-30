"use client";

import React, { useState, useEffect } from "react";
import { AssetCategory, CatalogAsset, PlacedObject, ComponentSubMeshMaterial } from "@/types/modular";
import { REAL_PAINTS_CATALOG, RealPaint } from "@/config/paints";
import { TEXTURE_PRESETS } from "@/utils/generateFloorTextures";
import { BulbState } from "@/components/canvas/LightControls";

export type StudioTab = "catalog" | "paint" | "lighting" | "camera" | "inspector";

interface ModularAssetDrawerProps {
  activeStudioTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  onAddAsset: (asset: CatalogAsset) => void;
  onSelectShell?: (shellUrl: string) => void;

  // Room Shell Dimension Expansion Scale
  roomShellScale: number;
  onRoomShellScaleChange: (val: number) => void;

  // Active Placed Components List & Selector
  placedObjects: PlacedObject[];
  onSelectObject: (instanceId: string) => void;

  // Selected 3D Component Inspector Props
  selectedObject: PlacedObject | null;
  selectedSubMaterials: ComponentSubMeshMaterial[];
  onUpdateTransform: (property: "position" | "rotation" | "scale", value: [number, number, number]) => void;
  onUpdateComponentMaterial: (meshName: string, colorHex: string) => void;
  onUpdateComponentTexture?: (meshName: string, textureId: string) => void;
  onDuplicateObject: () => void;
  onDeleteObject: (instanceId?: string) => void;

  // Surface & Paint Props
  roomColors: Record<string, string>;
  onColorChange: (surface: string, color: string) => void;
  activeSurface: string;
  onSurfaceSelect: (surface: string) => void;
  activeTextures: Record<string, string>;
  onTextureSelect: (meshName: string, textureId: string) => void;

  // Dynamic Lighting Props
  isNightMode: boolean;
  onToggleNightMode: (isNight: boolean) => void;
  bulbs: BulbState[];
  onAddLight: () => void;
  onDeleteLight: (id: string) => void;
  onToggleBulb: (id: string) => void;
  onBulbIntensityChange: (id: string, intensity: number) => void;
  onBulbColorChange: (id: string, color: string) => void;
  onBulbPositionChange?: (id: string, position: [number, number, number]) => void;
  selectedLightId: string | null;
  onSelectLight: (id: string | null) => void;
  sunlightIntensity: number;
  onSunlightIntensityChange: (val: number) => void;

  // Transform Controls & Save
  transformMode: "translate" | "rotate" | "scale";
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void;
  onSaveTemplate: () => void;
  isSaving?: boolean;

  isOpen: boolean;
  onClose: () => void;
}

export function ModularAssetDrawer({
  activeStudioTab,
  onTabChange,
  onAddAsset,
  onSelectShell,
  roomShellScale,
  onRoomShellScaleChange,
  placedObjects,
  onSelectObject,
  selectedObject,
  selectedSubMaterials,
  onUpdateTransform,
  onUpdateComponentMaterial,
  onUpdateComponentTexture,
  onDuplicateObject,
  onDeleteObject,
  roomColors,
  onColorChange,
  activeSurface,
  onSurfaceSelect,
  activeTextures,
  onTextureSelect,
  isNightMode,
  onToggleNightMode,
  bulbs,
  onAddLight,
  onDeleteLight,
  onToggleBulb,
  onBulbIntensityChange,
  onBulbColorChange,
  onBulbPositionChange,
  selectedLightId,
  onSelectLight,
  sunlightIntensity,
  onSunlightIntensityChange,
  transformMode,
  onTransformModeChange,
  onSaveTemplate,
  isSaving = false,
  isOpen,
  onClose,
}: ModularAssetDrawerProps) {
  const [activeAssetCategory, setActiveAssetCategory] = useState<AssetCategory>("seating");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [availableAssets, setAvailableAssets] = useState<CatalogAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(true);
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>("ALL");

  // VS Code Style Resizable Sidebar Width (Min 300px, Max 720px)
  const [drawerWidth, setDrawerWidth] = useState<number>(380);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 300), 720);
      setDrawerWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Load GLB Catalog Assets
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch("/api/models");
        if (res.ok) {
          const data = await res.json();
          const rawModels: string[] = data.models || [];

          const parsedAssets: CatalogAsset[] = rawModels.map((path) => {
            const filename = path.split("/").pop() || path;
            const name = filename
              .replace(".glb", "")
              .replace(/[-_]/g, " ")
              .replace(/\(.*\)/g, "")
              .trim();

            let category: AssetCategory = "seating";
            if (path.includes("shells/") || filename.includes("shell")) {
              category = "shells";
            } else if (path.includes("tables/") || filename.includes("table")) {
              category = "tables";
            } else if (path.includes("decor/") || filename.includes("cotton") || filename.includes("vase")) {
              category = "decor";
            } else if (path.includes("storage/") || filename.includes("wardrobe") || filename.includes("cabinet")) {
              category = "storage";
            } else if (path.includes("wall_panels/")) {
              category = "wall_panels";
            } else if (filename.includes("light") || filename.includes("bulb")) {
              category = "lighting";
            }

            return {
              id: path,
              name: name.charAt(0).toUpperCase() + name.slice(1),
              category,
              model_url: `/models/${path}`,
            };
          });

          setAvailableAssets(parsedAssets);
        }
      } catch (err) {
        console.error("Failed loading catalog assets:", err);
      } finally {
        setLoadingAssets(false);
      }
    }

    if (isOpen) loadCatalog();
  }, [isOpen]);

  const assetCategories: { id: AssetCategory; label: string; icon: string }[] = [
    { id: "shells", label: "Room Shells", icon: "🏠" },
    { id: "seating", label: "Seating", icon: "🪑" },
    { id: "tables", label: "Tables", icon: "🪵" },
    { id: "decor", label: "Decor & Curtains", icon: "🌿" },
    { id: "storage", label: "Storage", icon: "🗄️" },
    { id: "wall_panels", label: "Wall Panels", icon: "🖼️" },
    { id: "lighting", label: "Lighting", icon: "💡" },
  ];

  const studioTabs: { id: StudioTab; label: string; icon: string }[] = [
    { id: "catalog", label: "3D Assets", icon: "📦" },
    { id: "paint", label: "Paint & PBR", icon: "🎨" },
    { id: "inspector", label: selectedObject ? "Inspector" : "Component", icon: "🧩" },
    { id: "lighting", label: "Lighting", icon: "💡" },
    { id: "camera", label: "Controls", icon: "🎥" },
  ];

  const filteredAssets = availableAssets.filter((asset) => {
    const matchesCategory = asset.category === activeAssetCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const brands = ["ALL", "Sherwin-Williams", "Benjamin Moore", "Dulux"];
  const filteredPaints = REAL_PAINTS_CATALOG.filter(
    (paint: RealPaint) => activeBrandFilter === "ALL" || paint.brand === activeBrandFilter
  );

  // Helper to get paint metadata name from hex code
  const currentWallHex = roomColors[activeSurface] || "#F2EFE9";
  const activePaintMeta = REAL_PAINTS_CATALOG.find(
    (p) => p.code.toLowerCase() === currentWallHex.toLowerCase()
  );

  if (!isOpen) return null;

  return (
    <div
      style={{ width: `${drawerWidth}px` }}
      className={`fixed inset-y-0 left-0 bg-neutral-950/95 border-r border-neutral-850 shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-fade-in text-white font-sans ${
        isResizing ? "select-none" : ""
      }`}
    >
      {/* VS Code Style Resizable Drag Handle */}
      <div
        onMouseDown={startResizing}
        className={`absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-[#FF8C38]/60 transition-colors z-50 group flex items-center justify-center ${
          isResizing ? "bg-[#FF8C38]" : "bg-transparent"
        }`}
        title="Drag to resize sidebar"
      >
        <div className="w-0.5 h-8 rounded-full bg-neutral-700 group-hover:bg-orange-300 transition-colors" />
      </div>

      {/* Primary Studio Header */}
      <div className="p-4 border-b border-neutral-900 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-[#FF8C38] flex items-center gap-2">
            <span>🧱 Admin Studio Control Panel</span>
          </h2>
          <p className="text-[10px] text-neutral-500 font-medium mt-0.5">
            Assemble 3D components, paint surfaces & publish templates
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="grid grid-cols-5 p-1.5 bg-neutral-950 border-b border-neutral-900 gap-1">
        {studioTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 ${
              activeStudioTab === tab.id
                ? "bg-[#FF8C38] text-neutral-950 font-black shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            <span className="truncate max-w-full">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: 3D COMPONENT CATALOG */}
      {activeStudioTab === "catalog" && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Room Shell Enlarger Slider Banner */}
          <div className="p-3.5 bg-neutral-900 border-b border-neutral-850 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#FF8C38] font-black flex items-center gap-1.5">
                <span>🏠 Room Shell Expansion:</span>
              </span>
              <span className="text-amber-400 font-mono">{roomShellScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={roomShellScale}
              onChange={(e) => onRoomShellScaleChange(parseFloat(e.target.value))}
              className="w-full accent-orange-500 bg-neutral-800 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-neutral-500">
              <span>0.8x (Compact)</span>
              <span>1.5x (Standard)</span>
              <span>2.5x (Penthouse Suite)</span>
            </div>
          </div>

          {/* Active Room Components Quick Manager Bar */}
          {placedObjects.length > 0 && (
            <div className="p-3 border-b border-neutral-900 bg-neutral-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#FF8C38] tracking-wider">
                  📋 Placed Room Components ({placedObjects.length})
                </span>
                <span className="text-[9px] font-mono text-neutral-500">Click to Select</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {placedObjects.map((obj) => (
                  <div
                    key={obj.instance_id}
                    onClick={() => {
                      onSelectObject(obj.instance_id);
                      onTabChange("inspector");
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 border shrink-0 ${
                      selectedObject?.instance_id === obj.instance_id
                        ? "bg-[#FF8C38] text-neutral-950 border-[#FF8C38] font-black shadow-md"
                        : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white"
                    }`}
                  >
                    <span>{obj.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteObject(obj.instance_id);
                      }}
                      className="text-rose-400 hover:text-rose-300 font-bold ml-1"
                      title="Delete Component"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="p-3 border-b border-neutral-900">
            <input
              type="text"
              placeholder="🔍 Search chairs, tables, curtains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#FF8C38] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Category Tabs */}
          <div className="p-2.5 border-b border-neutral-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {assetCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveAssetCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  activeAssetCategory === cat.id
                    ? "bg-[#FF8C38] text-neutral-950 shadow-md font-black"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-850"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Asset List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
            {loadingAssets ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                Scanning 3D Asset Library...
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 space-y-2">
                <p>No 3D assets found in this category.</p>
              </div>
            ) : (
              filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 bg-neutral-900 border border-neutral-800 hover:border-[#FF8C38]/50 rounded-2xl flex items-center justify-between gap-3 transition-all group"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-100 truncate group-hover:text-[#FF8C38] transition-colors">
                      {asset.name}
                    </h4>
                    <span className="text-[9px] font-mono text-neutral-500 block truncate">
                      {asset.id}
                    </span>
                  </div>

                  {asset.category === "shells" ? (
                    <button
                      onClick={() => onSelectShell?.(asset.model_url)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-white text-neutral-950 text-[10px] font-mono font-bold rounded-xl shadow-md shrink-0"
                    >
                      Load Shell ➔
                    </button>
                  ) : (
                    <button
                      onClick={() => onAddAsset(asset)}
                      className="px-3 py-1.5 bg-[#FF8C38] hover:bg-[#FF8C38] text-neutral-950 text-[10px] font-mono font-bold rounded-xl shadow-md shrink-0"
                    >
                      + Add to Room
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAINT & PBR TEXTURES */}
      {activeStudioTab === "paint" && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
          {/* Active Surface & Applied Color Inspection Banner */}
          <div className="p-3.5 bg-neutral-900 border border-[#FF8C38]/50 rounded-2xl space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#FF8C38] font-black tracking-wider flex items-center gap-1.5">
                <span>🎯 Selected Surface:</span>
              </span>
              <span className="text-xs font-black uppercase text-orange-300 bg-neutral-950 px-2.5 py-1 rounded-lg border border-[#FF8C38]/40">
                {activeSurface.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-neutral-850">
              <div
                className="w-10 h-10 rounded-xl border border-white/20 shadow-md shrink-0"
                style={{ backgroundColor: currentWallHex }}
              />
              <div className="min-w-0">
                <span className="text-xs font-black text-white block truncate">
                  {activePaintMeta?.name || "Custom Surface Color"}
                </span>
                <span className="text-[10px] font-mono text-[#FF8C38] font-bold block truncate">
                  {activePaintMeta?.brand ? `${activePaintMeta.brand} • ` : ""}{currentWallHex}
                </span>
              </div>
            </div>
          </div>

          {/* Active Surface Selector Dropdown */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1.5">
              Select Surface to Target
            </label>
            <select
              value={activeSurface}
              onChange={(e) => onSurfaceSelect(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-[#FF8C38] focus:outline-none"
            >
              <option value="wallFront">Wall Front</option>
              <option value="wallBack">Wall Back</option>
              <option value="wallLeft">Wall Left</option>
              <option value="wallRight">Wall Right</option>
              <option value="ceiling">Ceiling</option>
              <option value="floor">Floor Surface</option>
            </select>
          </div>

          {/* Brand Filter Switcher */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1.5">
              Paint Brand Decks
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {brands.map((brand: string) => (
                <button
                  key={brand}
                  onClick={() => setActiveBrandFilter(brand)}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
                    activeBrandFilter === brand
                      ? "bg-[#FF8C38]/25 border border-[#FF8C38]/50 text-[#FF8C38]"
                      : "bg-neutral-900 border border-neutral-850 text-neutral-400 hover:text-white"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Color Swatch Grid */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1.5">
              Color Catalog ({filteredPaints.length})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {filteredPaints.map((paint: RealPaint, idx: number) => {
                const isSelectedPaint = currentWallHex.toLowerCase() === paint.code.toLowerCase();
                return (
                  <button
                    key={`${paint.id}_${idx}`}
                    onClick={() => onColorChange(activeSurface, paint.code)}
                    className={`p-2 bg-neutral-900 border rounded-xl flex flex-col items-center gap-1.5 text-center group transition-all ${
                      isSelectedPaint
                        ? "border-[#FF8C38] bg-[#FF8C38]/15 shadow-lg shadow-orange-500/20"
                        : "border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg shadow-md border border-white/10 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: paint.code }}
                    />
                    <span className={`text-[9px] font-bold truncate max-w-full ${isSelectedPaint ? "text-orange-300 font-black" : "text-neutral-200"}`}>
                      {paint.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PBR Texture Presets for Floors & Surfaces */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1.5">
              PBR Surface Textures
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEXTURE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onTextureSelect(activeSurface, preset.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    activeTextures[activeSurface] === preset.id
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold"
                      : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white"
                  }`}
                >
                  <span className="text-xs block font-bold">{preset.name}</span>
                  <span className="text-[9px] text-neutral-500 uppercase font-mono">{preset.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE COMPONENT INSPECTOR */}
      {activeStudioTab === "inspector" && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
          {/* Active Room Components Selector Bar */}
          {placedObjects.length > 0 && (
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-[#FF8C38] tracking-wider block">
                📋 All Placed Room Components ({placedObjects.length})
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                {placedObjects.map((obj) => {
                  const isCurSelected = selectedObject?.instance_id === obj.instance_id;
                  return (
                    <div
                      key={obj.instance_id}
                      onClick={() => onSelectObject(obj.instance_id)}
                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isCurSelected
                          ? "bg-[#FF8C38]/25 border-[#FF8C38] text-orange-300 font-bold"
                          : "bg-neutral-950 border-neutral-850 text-neutral-300 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold truncate max-w-[170px]">{obj.name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteObject(obj.instance_id);
                          }}
                          className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 text-[10px] font-bold"
                          title="Delete Component"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!selectedObject ? (
            <div className="py-12 text-center space-y-2">
              <span className="text-3xl block">🖱️</span>
              <p className="text-xs font-bold text-neutral-400 uppercase">No Component Selected</p>
              <p className="text-[10px] text-neutral-500">
                Click any 3D furniture item in the room or select one from the components list above!
              </p>
            </div>
          ) : (
            <>
              {/* Component Header Metadata Card */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-[#FF8C38] truncate">
                    {selectedObject.name}
                  </h3>
                  <span className="text-[9px] font-mono uppercase bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-neutral-400">
                    {selectedObject.category}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-neutral-500 truncate">{selectedObject.instance_id}</p>
              </div>

              {/* Transform Mode Toggles */}
              <div>
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1.5">
                  Gizmo Mode
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onTransformModeChange("translate")}
                    className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all ${
                      transformMode === "translate"
                        ? "bg-[#FF8C38]/25 border-[#FF8C38]/50 text-[#FF8C38] font-black"
                        : "bg-neutral-900 border-neutral-850 text-neutral-400"
                    }`}
                  >
                    MOVE (W)
                  </button>
                  <button
                    onClick={() => onTransformModeChange("rotate")}
                    className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all ${
                      transformMode === "rotate"
                        ? "bg-[#FF8C38]/25 border-[#FF8C38]/50 text-[#FF8C38] font-black"
                        : "bg-neutral-900 border-neutral-850 text-neutral-400"
                    }`}
                  >
                    ROTATE (E)
                  </button>
                  <button
                    onClick={() => onTransformModeChange("scale")}
                    className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all ${
                      transformMode === "scale"
                        ? "bg-[#FF8C38]/25 border-[#FF8C38]/50 text-[#FF8C38] font-black"
                        : "bg-neutral-900 border-neutral-850 text-neutral-400"
                    }`}
                  >
                    SCALE (R)
                  </button>
                </div>
              </div>

              {/* Numeric Position & Scale Inputs */}
              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Scale (X, Y, Z):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((axisIdx) => (
                      <input
                        key={axisIdx}
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="5.0"
                        value={selectedObject.transform.scale[axisIdx]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1;
                          const newScale = [...selectedObject.transform.scale] as [number, number, number];
                          newScale[axisIdx] = val;
                          onUpdateTransform("scale", newScale);
                        }}
                        className="bg-neutral-950 border border-neutral-800 text-xs font-mono text-center rounded-xl p-1.5 focus:border-[#FF8C38] text-white"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">Position (X, Y, Z):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((axisIdx) => (
                      <input
                        key={axisIdx}
                        type="number"
                        step="0.1"
                        value={selectedObject.transform.position[axisIdx]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const newPos = [...selectedObject.transform.position] as [number, number, number];
                          newPos[axisIdx] = val;
                          onUpdateTransform("position", newPos);
                        }}
                        className="bg-neutral-950 border border-neutral-800 text-xs font-mono text-center rounded-xl p-1.5 focus:border-[#FF8C38] text-white"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sub-Mesh Materials & Color Recolor List */}
              {selectedSubMaterials.length > 0 && (
                <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-[#FF8C38]">
                    🎨 Component Detected Sub-Parts
                  </h4>

                  <div className="space-y-2">
                    {selectedSubMaterials.map((subMat) => (
                      <div
                        key={subMat.meshName}
                        className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-neutral-200 font-bold truncate max-w-[170px]">
                            {subMat.meshName}
                          </span>
                          <input
                            type="color"
                            value={selectedObject.materials?.[subMat.meshName] || subMat.currentColor}
                            onChange={(e) => onUpdateComponentMaterial(subMat.meshName, e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                            title="Color Overlay Picker"
                          />
                        </div>
                        <span className="text-[9px] font-mono text-neutral-500 block truncate">
                          {subMat.materialName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicate & Delete Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={onDuplicateObject}
                  className="py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-800 transition-all"
                >
                  📋 Duplicate
                </button>
                <button
                  onClick={() => onDeleteObject(selectedObject.instance_id)}
                  className="py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 transition-all"
                >
                  🗑️ Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: LIGHTING & DYNAMIC FIXTURES */}
      {activeStudioTab === "lighting" && (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
          {/* Add Light Fixture Button */}
          <button
            onClick={onAddLight}
            className="w-full py-2.5 bg-[#FF8C38] hover:bg-[#FF8C38] text-neutral-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>💡 ➕ Add New Light Fixture</span>
          </button>

          {/* Day / Night Mode Switch */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-neutral-100 flex items-center gap-2">
              <span>🌅 Atmosphere Mode</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleNightMode(false)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  !isNightMode
                    ? "bg-amber-500 text-neutral-950 border-amber-400 font-black shadow-lg"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <span>☀️ DAY MODE</span>
              </button>
              <button
                onClick={() => onToggleNightMode(true)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  isNightMode
                    ? "bg-indigo-500 text-white border-indigo-400 font-black shadow-lg"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <span>🌙 NIGHT MODE</span>
              </button>
            </div>
          </div>

          {/* Full Range Sunlight Brightness Control (0.0x to 5.0x) */}
          {!isNightMode && (
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>☀️ Direct Sunlight Intensity</span>
                <span className="text-amber-400 font-mono">{sunlightIntensity.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.05"
                value={sunlightIntensity}
                onChange={(e) => onSunlightIntensityChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-neutral-800 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                <span>0.0 (Off / Pitch Dark)</span>
                <span>5.0 (Ultra Bright)</span>
              </div>
            </div>
          )}

          {/* Dynamic Light Fixtures List */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-100">
                Active Light Fixtures ({bulbs.length})
              </h3>
            </div>

            {bulbs.length === 0 ? (
              <p className="text-[10px] text-neutral-500 text-center py-4">
                No light fixtures placed yet. Click ➕ Add New Light Fixture above!
              </p>
            ) : (
              <div className="space-y-3">
                {bulbs.map((bulb) => {
                  const isOn = bulb.visible !== undefined ? bulb.visible : bulb.enabled;
                  const isSelected = selectedLightId === bulb.id;

                  return (
                    <div
                      key={bulb.id}
                      onClick={() => onSelectLight(bulb.id)}
                      className={`p-3 rounded-xl border space-y-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-neutral-900 border-cyan-400 shadow-lg shadow-cyan-500/10"
                          : isOn
                          ? "bg-neutral-950 border-[#FF8C38]/50 text-neutral-100"
                          : "bg-neutral-950/60 border-neutral-850 text-neutral-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate max-w-[150px]">{bulb.name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBulb(bulb.id);
                            }}
                            className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg transition-all ${
                              isOn
                                ? "bg-[#FF8C38] text-neutral-950"
                                : "bg-neutral-850 text-neutral-400 hover:text-white"
                            }`}
                          >
                            {isOn ? "ON 💡" : "OFF 🔌"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLight(bulb.id);
                            }}
                            className="p-1 px-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 text-[10px] font-bold"
                            title="Delete Light"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Light Position Coordinates Controls */}
                      {isSelected && (
                        <div className="pt-2 border-t border-neutral-850 space-y-2" onClick={(e) => e.stopPropagation()}>
                          <label className="text-[9px] font-mono text-cyan-400 font-bold block">
                            3D Position (X, Y, Z):
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[0, 1, 2].map((axisIdx) => (
                              <input
                                key={axisIdx}
                                type="number"
                                step="0.1"
                                value={bulb.position[axisIdx]}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const newPos = [...bulb.position] as [number, number, number];
                                  newPos[axisIdx] = val;
                                  onBulbPositionChange?.(bulb.id, newPos);
                                }}
                                className="bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-center rounded-lg p-1 text-white focus:border-cyan-400"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {isOn && (
                        <div className="space-y-2 pt-1 border-t border-neutral-900" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                            <span>Intensity:</span>
                            <span className="text-[#FF8C38] font-bold">{bulb.intensity} lm</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="60"
                            step="1"
                            value={bulb.intensity}
                            onChange={(e) => onBulbIntensityChange(bulb.id, parseFloat(e.target.value))}
                            className="w-full accent-orange-500 bg-neutral-800 cursor-pointer"
                          />
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1">
                            <span>Bulb Color Tone:</span>
                            <input
                              type="color"
                              value={bulb.color}
                              onChange={(e) => onBulbColorChange(bulb.id, e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CAMERA & SAVE TEMPLATE */}
      {activeStudioTab === "camera" && (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
          {/* Room Shell Expansion Slider */}
          <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#FF8C38] font-black">🏠 Room Shell Expansion:</span>
              <span className="text-amber-400 font-mono">{roomShellScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={roomShellScale}
              onChange={(e) => onRoomShellScaleChange(parseFloat(e.target.value))}
              className="w-full accent-orange-500 bg-neutral-800 cursor-pointer"
            />
          </div>

          {/* Master Template Commit Button */}
          <div className="pt-4 border-t border-neutral-900">
            <button
              onClick={onSaveTemplate}
              disabled={isSaving}
              className="w-full py-3.5 bg-[#FF8C38] hover:bg-[#FF8C38] text-neutral-950 text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>💾 Publish Master Room Template</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
