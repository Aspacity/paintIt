"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { TEXTURE_PRESETS, getMeshCategory } from "@/utils/generateFloorTextures";

// ============================================================================
// 1. UNIFIED MASTER CANVAS TYPES & SCHEMAS
// ============================================================================
export type TimeOfDayPreset = "day" | "night";
export type WallFinishType = "EMULSION" | "GLOSS" | "SATIN";
export type CeilingType = "Ceiling_Cove" | "Ceiling_FlatModern" | "Ceiling_Tray" | "Ceiling_POP" | "Ceiling_Linear";
export type CameraViewPreset = "FULL_ROOM" | "SEATING_FOCUS" | "ACCENT_WALL" | "TOP_DOWN";

const WALL_MAPPING_PRESETS: Record<string, string> = {
  left: "wall_left",
  right: "wall_right",
  back: "wall_back",
  front: "wall_front",
  roof: "ceiling",
};

function resolveWallKey(meshName: string): string {
  if (!meshName) return "wall_back";
  const name = meshName.toLowerCase();
  if (WALL_MAPPING_PRESETS[name]) return WALL_MAPPING_PRESETS[name];
  if (name.includes("back")) return "wall_back";
  if (name.includes("left")) return "wall_left";
  if (name.includes("right")) return "wall_right";
  if (name.includes("front")) return "wall_front";
  if (name.includes("ceiling") || name.includes("roof")) return "ceiling";
  return meshName;
}

export interface SurfaceState {
  color: string;
  finish: WallFinishType;
  textureId?: string;
}

export interface MasterCanvasConfig {
  mode: "painter" | "client" | "admin" | "sandbox";
  modelUrl: string;
  timeOfDay: TimeOfDayPreset;
  activeWallColor: string;
  activeWallFinish: WallFinishType;
  activeCeilingType: CeilingType;
  activeFloorTextureId: string;
  wallSurfaceStates?: Record<string, { color: string; finish: WallFinishType }>;
  bumpScale?: number;
  shadowOpacity?: number;
  enableAutoCutaway?: boolean;
  enableZoom?: boolean;
  hideLightingTab?: boolean;
}

interface PaintItMasterCanvasProps {
  config: MasterCanvasConfig;
  onConfigChange?: (newConfig: Partial<MasterCanvasConfig>) => void;
  onSurfaceSelect?: (meshName: string, category: string, point: THREE.Vector3) => void;
}

export const LIGHTING_CONTROLS = {
  // ☀️ DAYTIME — equatorial noon, high overhead sun, hazy tropical sky
  day: {
    sunElevationDeg: 82,
    sunAzimuthDeg: 205,
    sunColor: "#FFF7EC",
    sunIntensity: 3.2,

    hemisphereSkyColor: "#cfe3f2",
    hemisphereGroundColor: "#c9b89a",
    hemisphereIntensity: 0.55,

    skyTurbidity: 8,
    skyRayleigh: 1.2,
    skyMieCoefficient: 0.012,
    skyMieDirectionalG: 0.85,

    envPreset: "city" as const,
    envIntensity: 0.35,
    exposure: 0.95,
  },
  // 🌙 NIGHTTIME — short equatorial dusk, warm urban skyglow, faint moon
  night: {
    sunElevationDeg: -8,
    sunAzimuthDeg: 205,
    sunColor: "#9AB4E0",
    sunIntensity: 0.12,

    hemisphereSkyColor: "#0b1330",
    hemisphereGroundColor: "#3a2a1a",
    hemisphereIntensity: 0.22,

    skyTurbidity: 10,
    skyRayleigh: 0.5,
    skyMieCoefficient: 0.01,
    skyMieDirectionalG: 0.9,

    envPreset: "night" as const,
    envIntensity: 0.25,
    exposure: 0.45,
  },
};

// Import Real Paint Swatch Catalog
import { REAL_PAINTS_CATALOG } from "@/config/paints";

// ============================================================================
// 2. INNER 3D ROOM MESH COMPONENT
// ============================================================================
function MasterRoomMesh({
  config,
  selectedSurfacePoint,
  activeSelectedWall,
  onSurfaceSelect,
  onDoubleClickSurface,
}: {
  config: MasterCanvasConfig;
  selectedSurfacePoint: THREE.Vector3 | null;
  activeSelectedWall?: string | null;
  onSurfaceSelect?: (meshName: string, category: string, point: THREE.Vector3) => void;
  onDoubleClickSurface?: (meshName: string, category: string, point: THREE.Vector3) => void;
}) {
  const { scene } = useGLTF(config.modelUrl) as unknown as { scene: THREE.Group };
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Map to hold unique isolated material instances per wall mesh
  const wallMaterialCache = useRef<Record<string, THREE.MeshStandardMaterial>>({});

  // Update Mesh Materials Dynamically (Independent Walls Guaranteed!)
  useEffect(() => {
    clonedScene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) {
        node.receiveShadow = true;
        node.castShadow = true;

        const meshName = node.name;
        const category = getMeshCategory(meshName);

        // Modular Ceiling Visibility Toggle
        if (meshName.startsWith("Ceiling_") || meshName.startsWith("Cove_Lights_")) {
          if (config.activeCeilingType === "Ceiling_FlatModern") {
            node.visible = meshName.includes("Flat");
          } else if (config.activeCeilingType === "Ceiling_Tray") {
            node.visible = meshName.includes("Tray");
          } else if (config.activeCeilingType === "Ceiling_POP") {
            node.visible = meshName.includes("POP");
          } else if (config.activeCeilingType === "Ceiling_Cove") {
            node.visible = meshName.includes("Cove");
          } else if (config.activeCeilingType === "Ceiling_Linear") {
            node.visible = meshName.includes("Linear");
          }
        }

        // 1. Photorealistic Floor PBR Texture Mapping (ONLY for Floor Meshes!)
        if (category === "FLOOR") {
          if (config.activeFloorTextureId && config.activeFloorTextureId !== "original") {
            const preset = TEXTURE_PRESETS.find((p) => p.id === config.activeFloorTextureId);
            if (preset) {
              const mat = new THREE.MeshStandardMaterial({
                map: preset.generateTexture(),
                roughness: preset.roughness,
                metalness: preset.metalness,
                side: THREE.DoubleSide,
              });
              node.material = mat;
              node.material.needsUpdate = true;
              return;
            }
          }
        }

        // 2. Pure Architectural Wall Paint & Sheen Engine (PER-WALL ISOLATED PAINTING!)
        const isWall = meshName.toLowerCase().includes("wall") || category === "WALL";
        const isCeiling = meshName.toLowerCase().includes("ceiling") || meshName.toLowerCase().includes("roof");

        if (isWall || isCeiling) {
          const key = resolveWallKey(meshName);

          // Get or create unique material clone specifically for this surface key
          if (!wallMaterialCache.current[key]) {
            wallMaterialCache.current[key] = new THREE.MeshStandardMaterial({
              side: THREE.DoubleSide,
              shadowSide: THREE.DoubleSide,
            });
          }

          const mat = wallMaterialCache.current[key];
          mat.map = null; // Pure solid paint!
          mat.side = THREE.DoubleSide; // Render both inner and outer face!

          // Resolve wall/ceiling specific color or active fallback
          const wallState = config.wallSurfaceStates?.[key];
          const wallColor = wallState?.color || (isCeiling ? "#FFFFFF" : config.activeWallColor);
          const wallFinish = wallState?.finish || config.activeWallFinish;

          mat.color.set(wallColor);

          if (isCeiling) {
            mat.roughness = 0.95;
            mat.metalness = 0.0;
            // Soft emissive bounce so inner ceiling surface stays clean, bright, and vivid
            mat.emissive = new THREE.Color(wallColor);
            mat.emissiveIntensity = 0.35;
          } else {
            let roughness = 0.85;
            let metalness = 0.0;

            if (wallFinish === "SATIN") {
              roughness = 0.35;
              metalness = 0.04;
            } else if (wallFinish === "GLOSS") {
              roughness = 0.15;
              metalness = 0.12;
            }

            mat.roughness = roughness;
            mat.metalness = metalness;
            mat.emissive = new THREE.Color("#000000");
            mat.emissiveIntensity = 0.0;
          }

          mat.bumpMap = null;
          mat.needsUpdate = true;

          node.material = mat;
        }
      }
    });
  }, [clonedScene, config]);

  // Foyr Neo Style Smart Auto-Cutaway Wall Fading
  useFrame(({ camera }) => {
    if (config.enableAutoCutaway === false) return;

    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const meshName = node.name.toLowerCase();
        const isWallOrCeiling = meshName.includes("wall") || meshName.includes("ceiling") || meshName.includes("roof");

        if (isWallOrCeiling) {
          const worldPosition = new THREE.Vector3();
          node.getWorldPosition(worldPosition);

          const cameraToMesh = new THREE.Vector3().subVectors(camera.position, worldPosition).normalize();
          const roomCenterToMesh = new THREE.Vector3().subVectors(worldPosition, new THREE.Vector3(0, 1.0, 0)).normalize();
          const dot = cameraToMesh.dot(roomCenterToMesh);

          // Top-down ceiling auto-hiding
          if (meshName.includes("ceiling") || meshName.includes("roof")) {
            node.visible = camera.position.y <= 4.8;
            return;
          }

          // Wall cutaway fading when blocking camera lens
          if (dot > 0.25) {
            if (node.material instanceof THREE.Material) {
              node.material.transparent = true;
              node.material.opacity = 0.15;
              node.material.depthWrite = false;
            }
          } else {
            if (node.material instanceof THREE.Material) {
              node.material.transparent = false;
              node.material.opacity = 1.0;
              node.material.depthWrite = true;
            }
          }
        }
      }
    });
  });

  return (
    <group>
      <primitive
        object={clonedScene}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.object instanceof THREE.Mesh) {
            const rawName = e.object.name;
            const category = getMeshCategory(rawName);
            onSurfaceSelect?.(rawName, category, e.point);
          }
        }}
        onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.object instanceof THREE.Mesh) {
            const rawName = e.object.name;
            const category = getMeshCategory(rawName);
            onDoubleClickSurface?.(rawName, category, e.point);
          }
        }}
      />

      {/* 3D 1-Tap Target Surface Ring Marker */}
      {selectedSurfacePoint && (
        <mesh position={selectedSurfacePoint}>
          <ringGeometry args={[0.08, 0.12, 32]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// ============================================================================
import MasterLightingEngine from "./master/MasterLightingEngine";
import MasterCameraRig from "./master/MasterCameraRig";
import MasterPaintSplashRipple from "./master/MasterPaintSplashRipple";
import LightControls, { BulbState } from "@/components/canvas/LightControls";

// ============================================================================
// 4. UNIFIED MASTER CANVAS CONTAINER COMPONENT
// ============================================================================
export default function PaintItMasterCanvas({ config, onConfigChange, onSurfaceSelect }: PaintItMasterCanvasProps) {
  const [selectedPoint, setSelectedPoint] = useState<THREE.Vector3 | null>(null);
  const [activeSelectedWall, setActiveSelectedWall] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset | null>(null);
  const [activeTab, setActiveTab] = useState<"colors" | "finishes" | "lighting">("colors");

  // 3D Paint Splash Ripple animation state
  const [splashPoint, setSplashPoint] = useState<{ point: THREE.Vector3; wallKey?: string; color: string; id: number } | null>(null);

  const [selectedBulbId, setSelectedBulbId] = useState<string | null>(null);

  // Dynamic User Interactive Lightbulbs State (Starts EMPTY - user adds & positions lights!)
  const [bulbs, setBulbs] = useState<BulbState[]>([]);

  const lastTapRef = useRef<{ time: number; wallKey: string }>({ time: 0, wallKey: "" });

  // CORE COLOR CYCLING FUNCTION FOR DOUBLE-CLICK & DOUBLE-TAP
  const triggerColorCycle = useCallback(
    (meshName: string, category: string, point: THREE.Vector3) => {
      setSelectedPoint(point);
      const isWall = meshName.toLowerCase().includes("wall") || category === "WALL" || meshName.toLowerCase().includes("roof") || meshName.toLowerCase().includes("ceiling");
      const wallKey = resolveWallKey(meshName);

      setActiveSelectedWall(wallKey);

      if (isWall) {
        const currentColor = config.wallSurfaceStates?.[wallKey]?.color || config.activeWallColor || "#C4B199";
        const currentIndex = REAL_PAINTS_CATALOG.findIndex(
          (p) => p.code.toLowerCase() === currentColor.toLowerCase()
        );

        const nextIndex = (currentIndex + 1) % REAL_PAINTS_CATALOG.length;
        const nextPaint = REAL_PAINTS_CATALOG[nextIndex];

        const currentStates = config.wallSurfaceStates || {
          wall_back: { color: config.activeWallColor, finish: config.activeWallFinish },
          wall_left: { color: config.activeWallColor, finish: config.activeWallFinish },
          wall_right: { color: config.activeWallColor, finish: config.activeWallFinish },
          wall_front: { color: config.activeWallColor, finish: config.activeWallFinish },
          ceiling: { color: "#FFFFFF", finish: "EMULSION" },
        };

        const updatedStates = {
          ...currentStates,
          [wallKey]: {
            color: nextPaint.code,
            finish: currentStates[wallKey]?.finish || config.activeWallFinish || "EMULSION",
          },
        };

        setSplashPoint({ point, wallKey, color: nextPaint.code, id: Date.now() });
        onConfigChange?.({
          activeWallColor: nextPaint.code,
          wallSurfaceStates: updatedStates,
        });
      }
    },
    [config, onConfigChange]
  );

  // SINGLE TAP / CLICK HANDLER (Selects wall & handles mobile double-tap detection)
  const handleSurfaceClick = useCallback(
    (meshName: string, category: string, point: THREE.Vector3) => {
      setSelectedPoint(point);
      const wallKey = resolveWallKey(meshName);
      const now = Date.now();

      // Mobile & Desktop Double-Tap / Quick Double-Click Detection (< 320ms interval)
      if (now - lastTapRef.current.time < 320 && lastTapRef.current.wallKey === wallKey) {
        lastTapRef.current = { time: 0, wallKey: "" };
        triggerColorCycle(meshName, category, point);
        return;
      }

      lastTapRef.current = { time: now, wallKey };
      setActiveSelectedWall(wallKey);

      const activeColor = config.wallSurfaceStates?.[wallKey]?.color || config.activeWallColor || "#C4B199";
      setSplashPoint({ point, wallKey, color: activeColor, id: Date.now() });
      onSurfaceSelect?.(meshName, category, point);
    },
    [config.wallSurfaceStates, config.activeWallColor, onSurfaceSelect, triggerColorCycle]
  );

  // NATIVE DESKTOP DOUBLE CLICK HANDLER
  const handleSurfaceDoubleClick = useCallback(
    (meshName: string, category: string, point: THREE.Vector3) => {
      triggerColorCycle(meshName, category, point);
    },
    [triggerColorCycle]
  );

  const handleColorChange = (newColor: string) => {
    const targetWall = activeSelectedWall || "wall_back";
    const currentStates = config.wallSurfaceStates || {
      wall_back: { color: config.activeWallColor, finish: config.activeWallFinish },
      wall_left: { color: config.activeWallColor, finish: config.activeWallFinish },
      wall_right: { color: config.activeWallColor, finish: config.activeWallFinish },
      wall_front: { color: config.activeWallColor, finish: config.activeWallFinish },
      ceiling: { color: "#FFFFFF", finish: "EMULSION" },
    };

    const updatedStates = {
      ...currentStates,
      [targetWall]: {
        color: newColor,
        finish: currentStates[targetWall]?.finish || config.activeWallFinish || "EMULSION",
      },
    };

    onConfigChange?.({
      activeWallColor: newColor,
      wallSurfaceStates: updatedStates,
    });
  };

  const handleFinishChange = (newFinish: WallFinishType) => {
    const targetWall = activeSelectedWall || "wall_back";
    const currentStates = config.wallSurfaceStates || {
      wall_back: { color: config.activeWallColor, finish: config.activeWallFinish },
      wall_left: { color: config.activeWallColor, finish: config.activeWallFinish },
      wall_right: { color: config.activeWallColor, finish: config.activeWallFinish },
      wall_front: { color: config.activeWallColor, finish: config.activeWallFinish },
      ceiling: { color: "#FFFFFF", finish: "EMULSION" },
    };

    const updatedStates = {
      ...currentStates,
      [targetWall]: {
        color: currentStates[targetWall]?.color || config.activeWallColor || "#C4B199",
        finish: newFinish,
      },
    };

    onConfigChange?.({
      activeWallFinish: newFinish,
      wallSurfaceStates: updatedStates,
    });
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-neutral-950 select-none flex flex-col">
      {/* 3D RENDER CANVAS VIEWPORT */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          gl={{
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: config.timeOfDay === "night" ? 0.35 : 0.65,
          }}
          camera={{ position: [0, 1.8, 4.6], fov: 54 }}
        >
          <Suspense fallback={null}>
            {/* 💡 MODULAR LIGHTING ENGINE (Window sunlight + Dynamic lightbulbs + 3D Gizmos) */}
            <MasterLightingEngine
              timeOfDay={config.timeOfDay}
              bulbs={bulbs}
              setBulbs={setBulbs}
              selectedBulbId={selectedBulbId}
              onSelectBulb={setSelectedBulbId}
            />

            {/* 3D ROOM MODEL */}
            <MasterRoomMesh
              config={config}
              selectedSurfacePoint={selectedPoint}
              activeSelectedWall={activeSelectedWall}
              onSurfaceSelect={handleSurfaceClick}
              onDoubleClickSurface={handleSurfaceDoubleClick}
            />

            {/* 🎨 3D ANIMATED PAINT SPLASH RIPPLE MARKER */}
            {splashPoint && (
              <MasterPaintSplashRipple
                key={splashPoint.id}
                position={splashPoint.point}
                wallKey={splashPoint.wallKey}
                color={splashPoint.color}
                onAnimationComplete={() => setSplashPoint(null)}
              />
            )}

            {/* GROUND CONTACT SHADOWS */}
            <ContactShadows position={[0, 0.01, 0]} opacity={config.shadowOpacity || 0.65} scale={15} blur={2.0} far={4} />

            {/* 🎥 MODULAR CAMERA CONTROL RIG */}
            <MasterCameraRig
              targetPreset={cameraPreset}
              activeSurface={activeSelectedWall}
              enableZoom={config.enableZoom !== false}
            />
          </Suspense>
        </Canvas>

        {/* 📱 TOP RESPONSIVE HEADER BAR (Hidden on mobile for clean viewport) */}
        <div className="absolute top-3 left-3 right-3 hidden sm:flex items-center justify-between pointer-events-none z-10">
          <div className="bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-white tracking-wide uppercase">
              PaintIt Studio 2.0
            </span>
          </div>

          {/* PRESET CAMERA ANGLE BUTTONS */}
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 p-1 rounded-xl pointer-events-auto">
            <button
              onClick={() => setCameraPreset("FULL_ROOM")}
              className="px-2 py-1 text-[9px] font-bold uppercase rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              🏠 Room
            </button>
            <button
              onClick={() => setCameraPreset("SEATING_FOCUS")}
              className="px-2 py-1 text-[9px] font-bold uppercase rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              🛋️ Seating
            </button>
            <button
              onClick={() => setCameraPreset("ACCENT_WALL")}
              className="px-2 py-1 text-[9px] font-bold uppercase rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              🎨 Wall
            </button>
            <button
              onClick={() => setCameraPreset("TOP_DOWN")}
              className="px-2 py-1 text-[9px] font-bold uppercase rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              📐 Plan
            </button>
          </div>
        </div>
      </div>

      {/* 📱 ERGONOMIC FLOATING MOBILE & DESKTOP COLOR DRAWER PANEL */}
      <div className="bg-neutral-950/95 border-t border-neutral-900 p-3 space-y-3 z-20 shrink-0">
        {/* TAB BUTTON ROW */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-850">
            <button
              onClick={() => setActiveTab("colors")}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "colors" ? "bg-emerald-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              🎨 Colors
            </button>
            <button
              onClick={() => setActiveTab("finishes")}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "finishes" ? "bg-emerald-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              ✨ Finishes
            </button>
            {!config.hideLightingTab && (
              <button
                onClick={() => setActiveTab("lighting")}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === "lighting" ? "bg-emerald-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                💡 Lights & Sky
              </button>
            )}
          </div>

          <div className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-1 bg-emerald-950/40 rounded-lg border border-emerald-900/50">
            {activeSelectedWall ? activeSelectedWall.toUpperCase() : "SELECT WALL"} • {config.activeWallFinish}
          </div>
        </div>

        {/* TAB 1: SWIPEABLE COLOR PALETTE CAROUSEL */}
        {activeTab === "colors" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {REAL_PAINTS_CATALOG.map((paint) => {
              const targetKey = activeSelectedWall || "wall_back";
              const currentWallColor = config.wallSurfaceStates?.[targetKey]?.color || config.activeWallColor;
              const isSelected = currentWallColor.toLowerCase() === paint.code.toLowerCase();
              return (
                <button
                  key={paint.id}
                  onClick={() => handleColorChange(paint.code)}
                  className={`snap-start shrink-0 px-3 py-1.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500 scale-105"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 shadow-inner shrink-0"
                    style={{ backgroundColor: paint.code }}
                  />
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-white tracking-tight leading-none">{paint.name}</p>
                    <p className="text-[9px] text-neutral-400 font-mono mt-0.5">{paint.brand || "Catalog"}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 2: WALL FINISH SHEEN SELECTOR */}
        {activeTab === "finishes" && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "EMULSION", name: "🛋️ Emulsion", desc: "Matte Diffuse" },
              { id: "SATIN", name: "✨ Satin Sheen", desc: "Silk Gloss" },
              { id: "GLOSS", name: "💎 High Gloss", desc: "Reflective" },
            ].map((f) => {
              const targetKey = activeSelectedWall || "wall_back";
              const currentWallFinish = config.wallSurfaceStates?.[targetKey]?.finish || config.activeWallFinish;
              const isSelected = currentWallFinish === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleFinishChange(f.id as WallFinishType)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-wider">{f.name}</p>
                  <p className="text-[9px] text-neutral-500 font-mono">{f.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 3: DYNAMIC LIGHTBULBS & SKY LIGHTING CONTROLS */}
        {activeTab === "lighting" && (
          <div className="max-h-64 overflow-y-auto pr-1">
            <LightControls
              bulbs={bulbs}
              setBulbs={setBulbs}
              isNightMode={config.timeOfDay === "night"}
              setIsNightMode={(isNight) => onConfigChange?.({ timeOfDay: isNight ? "night" : "day" })}
              selectedBulbId={selectedBulbId}
              onSelectBulb={setSelectedBulbId}
            />
          </div>
        )}
      </div>
    </div>
  );
}