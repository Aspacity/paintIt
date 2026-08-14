"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Sky, ContactShadows, SoftShadows } from "@react-three/drei";
import * as THREE from "three";
import { generateWallNormalMap } from "@/utils/generateWallNormalMaps";
import { TEXTURE_PRESETS, getMeshCategory } from "@/utils/generateFloorTextures";
import PaintItMasterCanvas from "@/components/canvas/PaintItMasterCanvas";

// Realism Testbench Configuration Interface
interface RealismConfig {
  // Environment & Tone Mapping
  hdriPreset: "studio" | "apartment" | "city" | "dawn" | "sunset" | "night";
  hdriIntensity: number;
  exposure: number;
  isNightMode: boolean;
  shadowOpacity: number;
  shadowBlur: number;

  // Wall PBR & Finishes
  wallColor: string;
  wallFinish: "EMULSION" | "GLOSS" | "SATIN";
  bumpScale: number;

  // Modular Ceiling System
  ceilingType: "Ceiling_Cove" | "Ceiling_FlatModern" | "Ceiling_Tray" | "Ceiling_POP" | "Ceiling_Linear";

  // Floor PBR Materials
  floorTextureId: string;
  floorRoughness: number;
  floorMetalness: number;

  // Model Selection
  modelUrl: string;
}

const DEFAULT_REALISM_CONFIG: RealismConfig = {
  hdriPreset: "apartment",
  hdriIntensity: 1.2,
  exposure: 1.0,
  isNightMode: false,
  shadowOpacity: 0.65,
  shadowBlur: 2.0,

  wallColor: "#C4B199",
  wallFinish: "SATIN",
  bumpScale: 0.015,

  ceilingType: "Ceiling_Cove",

  floorTextureId: "floor_oak",
  floorRoughness: 0.35,
  floorMetalness: 0.05,

  modelUrl: "/models/shells/spacious-lux.glb",
};

function TestbenchRoomMesh({ config }: { config: RealismConfig }) {
  const { scene, materials } = useGLTF(config.modelUrl) as any;
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const wallNormalMap = useMemo(() => generateWallNormalMap(512, 512), []);

  useEffect(() => {
    clonedScene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) {
        node.receiveShadow = true;
        node.castShadow = true;

        const meshName = node.name;
        const category = getMeshCategory(meshName);

        // Modular Ceiling Visibility Toggle for Master Architectural Shell
        if (meshName.startsWith("Ceiling_") || meshName.startsWith("Cove_Lights_")) {
          if (config.ceilingType === "Ceiling_FlatModern") {
            node.visible = meshName.includes("Flat");
          } else if (config.ceilingType === "Ceiling_Tray") {
            node.visible = meshName.includes("Tray");
          } else if (config.ceilingType === "Ceiling_POP") {
            node.visible = meshName.includes("POP");
          } else if (config.ceilingType === "Ceiling_Cove") {
            node.visible = meshName.includes("Cove");
          } else if (config.ceilingType === "Ceiling_Linear") {
            node.visible = meshName.includes("Linear");
          }
        }

        // 1. Photorealistic Floor Texture Mapping
        if (category === "FLOOR" || config.floorTextureId !== "original") {
          const preset = TEXTURE_PRESETS.find((p) => p.id === config.floorTextureId);
          if (preset) {
            const mat = new THREE.MeshStandardMaterial({
              map: preset.generateTexture(),
              roughness: config.floorRoughness,
              metalness: config.floorMetalness,
              side: THREE.DoubleSide,
            });
            if (preset.clearcoat) (mat as any).clearcoat = preset.clearcoat;
            node.material = mat;
            node.material.needsUpdate = true;
            return;
          }
        }

        // 2. Photorealistic Wall Paint & Sheen Mapping
        if (node.material instanceof THREE.MeshStandardMaterial) {
          node.material = node.material.clone();
          node.material.side = THREE.DoubleSide;

          if (meshName.startsWith("wall") || category === "WALL") {
            node.material.color.set(config.wallColor);

            let roughness = 0.85;
            let metalness = 0.0;
            let bumpScale = config.bumpScale;

            if (config.wallFinish === "SATIN") {
              roughness = 0.35;
              metalness = 0.04;
              bumpScale = config.bumpScale * 0.6;
            } else if (config.wallFinish === "GLOSS") {
              roughness = 0.15;
              metalness = 0.12;
              bumpScale = config.bumpScale * 0.2;
            }

            node.material.bumpMap = wallNormalMap;
            node.material.bumpScale = bumpScale;
            node.material.roughness = roughness;
            node.material.metalness = metalness;
          } else {
            // Preserve GLB embedded Blender multi-textures!
            if (node.material.map) {
              node.material.color.set("#ffffff");
              node.material.map.colorSpace = THREE.SRGBColorSpace;
            }
          }

          node.material.needsUpdate = true;
        }
      }
    });
  }, [clonedScene, materials, config, wallNormalMap]);

  return <primitive object={clonedScene} />;
}

export default function RealismTestStudioPage() {
  const [activeTab, setActiveTab] = useState<"lighting" | "walls" | "floors" | "models">("lighting");
  const [panelWidth, setPanelWidth] = useState<number>(380);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const isResizingRef = useRef<boolean>(false);

  const [config, setConfig] = useState<RealismConfig>(DEFAULT_REALISM_CONFIG);

  const handleMouseDownResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - moveEvent.clientX;
      if (newWidth >= 260 && newWidth <= 600) {
        setPanelWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  // 📸 1-Click High-Res 4K Snapshot Render Capture
  const handleCaptureSnapshot = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `paintit-master-render-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-white select-none overflow-hidden font-sans">
      {/* 📱 TOP HEADER RESPONSIVE BAR */}
      <header className="h-14 bg-neutral-950 border-b border-neutral-900 px-4 lg:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-sm font-black uppercase tracking-wider text-white">PaintIt Studio 2.0 Realism</h1>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-neutral-900 border border-neutral-800 text-neutral-400">
            Engine v2.4
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCaptureSnapshot}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>📸 Capture 4K Photo Render</span>
          </button>
        </div>
      </header>

      {/* Main Realism Test Surface Layout */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* 3D Realtime WebGL Viewport powered by PaintItMasterCanvas */}
        <div className="flex-1 h-[60vh] lg:h-auto relative bg-neutral-950">
          <PaintItMasterCanvas
            config={{
              mode: "admin",
              modelUrl: config.modelUrl,
              timeOfDay: config.isNightMode ? "night" : "day",
              activeWallColor: config.wallColor,
              activeWallFinish: config.wallFinish,
              activeCeilingType: config.ceilingType,
              activeFloorTextureId: config.floorTextureId,
              wallSurfaceStates: (config as any).wallSurfaceStates,
              bumpScale: config.bumpScale,
              shadowOpacity: config.shadowOpacity,
              enableAutoCutaway: true,
            }}
            onConfigChange={(newCfg) => {
              setConfig((prev) => ({
                ...prev,
                ...(newCfg.wallSurfaceStates && { wallSurfaceStates: newCfg.wallSurfaceStates }),
                ...(newCfg.activeWallColor && { wallColor: newCfg.activeWallColor }),
                ...(newCfg.activeWallFinish && { wallFinish: newCfg.activeWallFinish }),
                ...(newCfg.timeOfDay && {
                  isNightMode: newCfg.timeOfDay === "night",
                }),
              }));
            }}
            onSurfaceSelect={(meshName, category, point) => {
              console.log("🎯 1-Tap Surface Select:", meshName, category, point);
            }}
          />
        </div>

        {/* 📱 DESKTOP RESIZE DRAG HANDLE */}
        <div
          onMouseDown={handleMouseDownResize}
          className="hidden lg:block w-1.5 hover:w-2 hover:bg-emerald-500/50 cursor-col-resize transition-all shrink-0 bg-neutral-900 border-l border-neutral-850"
          title="Drag to resize panel width"
        />

        {/* 📱 RESIZABLE & COLLAPSIBLE RIGHT-SIDE PANEL (Desktop & Mobile First Sheet) */}
        <div
          className={`relative bg-neutral-950 border-t lg:border-t-0 border-neutral-900 p-4 lg:p-6 space-y-5 overflow-y-auto max-h-[45vh] lg:max-h-none shrink-0 transition-all duration-200 ${
            isCollapsed ? "hidden lg:block lg:!w-0 lg:p-0 lg:overflow-hidden" : ""
          }`}
          style={{ width: typeof window !== "undefined" && window.innerWidth >= 1024 ? (isCollapsed ? 0 : panelWidth) : "100%" }}
        >
          {/* FLOATING COLLAPSE TOGGLE BUTTON */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute top-4 -left-4 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 text-white items-center justify-center shadow-2xl hover:border-emerald-500 z-30 transition-all text-xs"
            title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
          >
            {isCollapsed ? "◀" : "▶"}
          </button>

          {/* Tab Selection Row */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-900 border border-neutral-850 rounded-2xl">
            {(["lighting", "walls", "floors", "models"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === tab ? "bg-emerald-500 text-neutral-950 shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: LIGHTING & HDRI TONE MAPPING */}
          {activeTab === "lighting" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">☀️ Environment & HDRI Probe</h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">HDRI Preset</label>
                <select
                  value={config.hdriPreset}
                  onChange={(e) => setConfig({ ...config, hdriPreset: e.target.value as any })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="apartment">🛋️ Apartment Interior HDRI</option>
                  <option value="studio">💡 Studio Pro Daylight HDRI</option>
                  <option value="city">🏙️ City Ambient HDRI</option>
                  <option value="dawn">🌅 Warm Dawn HDRI</option>
                  <option value="sunset">🌇 Golden Sunset HDRI</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400">
                  <span>HDRI Light Intensity</span>
                  <span className="font-mono text-emerald-400">{config.hdriIntensity}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={config.hdriIntensity}
                  onChange={(e) => setConfig({ ...config, hdriIntensity: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400">
                  <span>ACESFilmic Exposure</span>
                  <span className="font-mono text-emerald-400">{config.exposure}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={config.exposure}
                  onChange={(e) => setConfig({ ...config, exposure: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400">
                  <span>Contact Shadow Opacity</span>
                  <span className="font-mono text-emerald-400">{config.shadowOpacity}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.shadowOpacity}
                  onChange={(e) => setConfig({ ...config, shadowOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">Night Ambiance Mode</span>
                <input
                  type="checkbox"
                  checked={config.isNightMode}
                  onChange={(e) => setConfig({ ...config, isNightMode: e.target.checked })}
                  className="w-5 h-5 accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: WALL PAINT & CEILING SYSTEMS */}
          {activeTab === "walls" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">🎨 Wall Paint & Modular Ceilings</h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Modular Ceiling Design</label>
                <select
                  value={config.ceilingType}
                  onChange={(e) => setConfig({ ...config, ceilingType: e.target.value as any })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="Ceiling_Cove">✨ Ceiling 04 — Luxury Cove Ceiling (Indirect Light Trough)</option>
                  <option value="Ceiling_FlatModern">🏢 Ceiling 01 — Flat Modern Ceiling</option>
                  <option value="Ceiling_Tray">📦 Ceiling 02 — Simple Tray Ceiling</option>
                  <option value="Ceiling_POP">📐 Ceiling 03 — Modern POP Layered Ceiling</option>
                  <option value="Ceiling_Linear">📏 Ceiling 05 — Minimal Linear Architectural Ceiling</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Paint Color Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.wallColor}
                    onChange={(e) => setConfig({ ...config, wallColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={config.wallColor}
                    onChange={(e) => setConfig({ ...config, wallColor: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Paint Finish Sheen</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["EMULSION", "GLOSS", "SATIN"] as const).map((finish) => (
                    <button
                      key={finish}
                      onClick={() => setConfig({ ...config, wallFinish: finish })}
                      className={`py-2.5 px-2 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${
                        config.wallFinish === finish
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400">
                  <span>Wall Micro-Normal Bump Scale</span>
                  <span className="font-mono text-emerald-400">{config.bumpScale}</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.05"
                  step="0.002"
                  value={config.bumpScale}
                  onChange={(e) => setConfig({ ...config, bumpScale: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>
          )}

          {/* TAB 3: FLOOR PBR MATERIALS */}
          {activeTab === "floors" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">🪵 Photorealistic PBR Flooring</h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Floor Texture Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEXTURE_PRESETS.filter((p) => p.category === "FLOOR").map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setConfig({ ...config, floorTextureId: preset.id })}
                      className={`p-2.5 bg-neutral-900 border rounded-xl flex items-center gap-2.5 transition-all text-left ${
                        config.floorTextureId === preset.id
                          ? "border-emerald-400 text-white"
                          : "border-neutral-850 text-neutral-400 hover:text-white"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: preset.thumbnailColor }} />
                      <span className="text-[10px] font-bold truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400">
                  <span>Floor Roughness Sheen</span>
                  <span className="font-mono text-emerald-400">{config.floorRoughness}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.9"
                  step="0.05"
                  value={config.floorRoughness}
                  onChange={(e) => setConfig({ ...config, floorRoughness: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MODEL INSPECTOR */}
          {activeTab === "models" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">🛋️ Model & Mesh Testbench</h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
                Select any exported 3D room shell model to test real-time PBR material rendering.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">3D Room Model File</label>
                <select
                  value={config.modelUrl}
                  onChange={(e) => setConfig({ ...config, modelUrl: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="/models/shells/master_room_shell.glb">🏆 Master Architectural Room Shell (8.0m x 6.5m x 3.2m)</option>
                  <option value="/models/shells/spacious_room_shell.glb">🏠 Spacious Room Shell (6.0m x 5.0m x 3.0m)</option>
                  <option value="/models/shells/livingroom-shell(window).glb">🪟 Living Room Shell (Window)</option>
                  <option value="/models/shells/living-room-shell(no-window).glb">🧱 Living Room Shell (No Window)</option>
                  <option value="/models/selfcon.glb">🛋️ Self-Contained Suite</option>
                </select>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs font-mono text-neutral-300">
                Active GLB: <span className="text-emerald-400 font-bold">{config.modelUrl}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
