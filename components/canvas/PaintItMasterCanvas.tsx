"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { LightingPresetKey, MASTER_LIGHTING_PRESETS } from "@/config/lightingPresets";
import { TEXTURE_PRESETS, getMeshCategory } from "@/utils/generateFloorTextures";

// ============================================================================
// 1. UNIFIED MASTER CANVAS TYPES & SCHEMAS
// ============================================================================
export type TimeOfDayPreset = LightingPresetKey | "day";
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
  sunAzimuthOverride?: number;
  sunElevationOverride?: number;
  sunIntensityOverride?: number;
  sunColorOverride?: string;
  ambientIntensityOverride?: number;
  activeWallColor: string;
  activeWallFinish: WallFinishType;
  activeCeilingType: CeilingType;
  activeFloorTextureId: string;
  wallSurfaceStates?: Record<string, { color: string; finish: WallFinishType }>;
  bumpScale?: number;
  shadowOpacity?: number;
  isCeilingCutaway?: boolean;
  enableAutoCutaway?: boolean;
  enableZoom?: boolean;
  hideLightingTab?: boolean;
  isAdmin?: boolean;
}

import { CameraConfigPayload } from "./master/MasterCameraRig";

interface PaintItMasterCanvasProps {
  config: MasterCanvasConfig;
  savedCameraConfig?: Partial<CameraConfigPayload> | null;
  onConfigChange?: (newConfig: Partial<MasterCanvasConfig>) => void;
  onSurfaceSelect?: (meshName: string, category: string, point: THREE.Vector3) => void;
  onSaveLightingConfig?: (lightingData: {
    timeOfDay: LightingPresetKey;
    azimuth: number;
    elevation: number;
    intensity: number;
    ambient: number;
    color?: string;
  }) => void;
  onSaveCameraConfig?: (cameraData: CameraConfigPayload) => void;
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
  cameraPreset,
  selectedSurfacePoint,
  activeSelectedWall: _activeSelectedWall,
  onSurfaceSelect,
  onDoubleClickSurface,
}: {
  config: MasterCanvasConfig;
  cameraPreset?: CameraViewPreset | null;
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
        const meshName = node.name;
        const nameLower = meshName.toLowerCase();
        const category = getMeshCategory(meshName);

        // 🛋️ 1. ARCHITECTURAL FIXTURES, BULBS & CURTAINS PROTECTION (NEVER paint or cast shadow stencils!)
        const isFixtureOrCurtain =
          nameLower.includes("curtain") ||
          nameLower.includes("drape") ||
          nameLower.includes("blind") ||
          nameLower.includes("lamp") ||
          nameLower.includes("light") ||
          nameLower.includes("strip") ||
          nameLower.includes("led") ||
          nameLower.includes("cove") ||
          nameLower.includes("bulb") ||
          nameLower.includes("spot") ||
          nameLower.includes("housing") ||
          nameLower.includes("downlight") ||
          nameLower.includes("tube") ||
          nameLower.includes("recessed") ||
          nameLower.includes("furniture") ||
          nameLower.includes("sofa") ||
          nameLower.includes("chair") ||
          nameLower.includes("table") ||
          nameLower.includes("door") ||
          nameLower.includes("wood");

        if (isFixtureOrCurtain) {
          // ☀️ Ceiling LED strips, bulbs & light fixtures MUST NOT cast dark shadow stencils onto floor/walls!
          const isCeilingLightOrLED =
            nameLower.includes("strip") ||
            nameLower.includes("led") ||
            nameLower.includes("cove") ||
            nameLower.includes("bulb") ||
            nameLower.includes("spot") ||
            nameLower.includes("housing") ||
            nameLower.includes("downlight") ||
            nameLower.includes("tube") ||
            nameLower.includes("light") ||
            nameLower.includes("fixture") ||
            nameLower.includes("recessed") ||
            nameLower.includes("chandelier") ||
            nameLower.includes("pendant");

          if (isCeilingLightOrLED) {
            node.castShadow = false;
            node.receiveShadow = false;
          } else {
            node.castShadow = true;
            node.receiveShadow = true;
          }
          return;
        }

        // ☀️ 2. CRYSTAL CLEAR WINDOW GLASS PANES ONLY
        const isGlassPane =
          (nameLower.includes("glass") || nameLower.includes("pane") || nameLower.includes("glazing")) &&
          !nameLower.includes("frame") &&
          !nameLower.includes("sash");

        if (isGlassPane) {
          node.castShadow = false;
          node.receiveShadow = false;
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((m) => {
              if (m instanceof THREE.MeshStandardMaterial) {
                m.transparent = true;
                m.opacity = 0.05; // ☀️ Ultra crystal clear window glass!
                m.roughness = 0.01;
                m.metalness = 0.9;
                m.depthWrite = false; // ☀️ Sunlight streams straight into room!
                m.needsUpdate = true;
              }
            });
          }
        } else {
          node.receiveShadow = true;
          node.castShadow = true;
        }

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
        const isWall = (meshName.toLowerCase().includes("wall") || category === "WALL") && !isFixtureOrCurtain;
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
            mat.emissive = new THREE.Color("#000000");
            mat.emissiveIntensity = 0.0;
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

  // Ceiling & Ceiling Light Cutaway Loop (Allows 100% Unobstructed Interior Raycast Interaction!)
  useFrame(({ camera }) => {
    const isHighAngle = camera.position.y > 3.8;
    const shouldCutawayCeiling = config.isCeilingCutaway || cameraPreset === "TOP_DOWN" || isHighAngle;

    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const meshName = node.name.toLowerCase();
        const isCeilingOrCeilingLight =
          meshName.includes("ceiling") ||
          meshName.includes("roof") ||
          meshName.includes("cove") ||
          meshName.includes("strip") ||
          meshName.includes("led") ||
          meshName.includes("bulb") ||
          meshName.includes("spot") ||
          meshName.includes("housing") ||
          meshName.includes("downlight") ||
          meshName.includes("tube") ||
          meshName.includes("light") ||
          meshName.includes("fixture") ||
          meshName.includes("chandelier") ||
          meshName.includes("pendant") ||
          meshName.includes("recessed");

        if (isCeilingOrCeilingLight) {
          node.visible = !shouldCutawayCeiling;
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
export default function PaintItMasterCanvas({
  config,
  savedCameraConfig,
  onConfigChange,
  onSurfaceSelect,
  onSaveLightingConfig,
  onSaveCameraConfig,
}: PaintItMasterCanvasProps) {
  const [selectedPoint, setSelectedPoint] = useState<THREE.Vector3 | null>(null);
  const [activeSelectedWall, setActiveSelectedWall] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset | null>(null);

  // Dual Sidebar States (Default COLLAPSED on Mobile screens!)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") return window.innerWidth < 768;
    return false;
  });
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") return window.innerWidth < 768;
    return false;
  });

  const [leftTab, setLeftTab] = useState<"colors" | "finishes" | "textures">("colors");
  const [rightTab, setRightTab] = useState<"lighting" | "sun">("sun");

  // Draggable Positions
  const [leftPos, setLeftPos] = useState({ x: 0, y: 0 });
  const [rightPos, setRightPos] = useState({ x: 0, y: 0 });
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handlePointerDownLeft = (e: React.PointerEvent) => {
    isDraggingLeft.current = true;
    dragStartRef.current = { x: e.clientX - leftPos.x, y: e.clientY - leftPos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveLeft = (e: React.PointerEvent) => {
    if (!isDraggingLeft.current) return;
    setLeftPos({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };

  const handlePointerUpLeft = (e: React.PointerEvent) => {
    isDraggingLeft.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handlePointerDownRight = (e: React.PointerEvent) => {
    isDraggingRight.current = true;
    dragStartRef.current = { x: e.clientX - rightPos.x, y: e.clientY - rightPos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveRight = (e: React.PointerEvent) => {
    if (!isDraggingRight.current) return;
    setRightPos({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };

  const handlePointerUpRight = (e: React.PointerEvent) => {
    isDraggingRight.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // 3D Paint Splash Ripple animation state
  const [splashPoint, setSplashPoint] = useState<{ point: THREE.Vector3; wallKey?: string; color: string; id: number } | null>(null);

  const [selectedBulbId, setSelectedBulbId] = useState<string | null>("ceiling-light-1");

  // Dynamic User Interactive Lightbulbs State (Starts with 1 default ceiling lamp in Admin mode)
  const [bulbs, setBulbs] = useState<BulbState[]>([
    {
      id: "ceiling-light-1",
      name: "Central Ceiling Lamp",
      type: "point",
      position: [0, 2.6, 0],
      color: "#fffaed",
      intensity: 3.5,
      enabled: true,
      visible: true,
    },
  ]);

  const handleAddBulb = (type: "point" | "spot") => {
    const newId = `bulb-${Date.now()}`;
    const newBulb: BulbState = {
      id: newId,
      name: type === "spot" ? `Spotlight #${bulbs.length + 1}` : `Ceiling Lamp #${bulbs.length + 1}`,
      type,
      position: [0, 2.4, 0],
      color: type === "spot" ? "#ffeedd" : "#fffaed",
      intensity: 3.0,
      enabled: true,
      visible: true,
    };
    setBulbs((prev) => [...prev, newBulb]);
    setSelectedBulbId(newId);
  };

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
            {/* 💡 MODULAR LIGHTING ENGINE (Window sunlight + Dynamic lightbulbs + 3D Gizmos for Master Admin) */}
            <MasterLightingEngine
              timeOfDay={config.timeOfDay}
              sunAzimuthOverride={config.sunAzimuthOverride}
              sunElevationOverride={config.sunElevationOverride}
              sunIntensityOverride={config.sunIntensityOverride}
              ambientIntensityOverride={config.ambientIntensityOverride}
              bulbs={bulbs}
              setBulbs={setBulbs}
              selectedBulbId={selectedBulbId}
              onSelectBulb={setSelectedBulbId}
              isAdmin={config.isAdmin}
            />

            {/* 3D ROOM MODEL */}
            <MasterRoomMesh
              config={config}
              cameraPreset={cameraPreset}
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

            {/* 🎥 MODULAR LEVA CAMERA CONTROL RIG */}
            <MasterCameraRig
              targetPreset={cameraPreset}
              activeSurface={activeSelectedWall}
              enableZoom={config.enableZoom !== false}
              isAdmin={config.isAdmin}
              savedCameraConfig={savedCameraConfig}
              onSaveCameraConfig={onSaveCameraConfig}
            />
          </Suspense>
        </Canvas>

        {/* 📱 TOP CENTER FLOATING CAMERA & STATUS BAR */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {/* Active Wall Status Pill */}
          <div className="bg-neutral-950/85 backdrop-blur-xl border border-neutral-800 px-3 py-1.5 rounded-2xl pointer-events-auto flex items-center gap-2 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wide">
              {activeSelectedWall ? activeSelectedWall.toUpperCase() : "SELECT SURFACE"}
              {activeSelectedWall &&
              (activeSelectedWall.toLowerCase().includes("curtain") ||
                activeSelectedWall.toLowerCase().includes("window") ||
                activeSelectedWall.toLowerCase().includes("door") ||
                activeSelectedWall.toLowerCase().includes("lamp"))
                ? " • NATIVE FIXTURE"
                : ` • ${config.activeWallFinish}`}
            </span>
          </div>

          {/* Camera View Preset Pills */}
          <div className="flex items-center gap-1 bg-neutral-950/85 backdrop-blur-xl border border-neutral-800 p-1 rounded-2xl pointer-events-auto shadow-2xl">
            <button
              onClick={() => setCameraPreset("FULL_ROOM")}
              className="px-2.5 py-1 text-[9px] font-black uppercase rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all"
            >
              🏠 Room
            </button>
            <button
              onClick={() => setCameraPreset("SEATING_FOCUS")}
              className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all"
            >
              🛋️ Focus
            </button>
            <button
              onClick={() => setCameraPreset("ACCENT_WALL")}
              className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all"
            >
              🎨 Wall
            </button>
            <button
              onClick={() => setCameraPreset("TOP_DOWN")}
              className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all"
            >
              📐 Plan
            </button>
            <button
              onClick={() => {
                onConfigChange?.({ isCeilingCutaway: !config.isCeilingCutaway });
              }}
              className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                config.isCeilingCutaway
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 font-black shadow-md"
                  : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white"
              }`}
              title="Toggle Ceiling & Ceiling Lights Cutaway"
            >
              {config.isCeilingCutaway ? "✂️ Cutaway: ON" : "✂️ Ceiling Cut"}
            </button>
          </div>
        </div>

        {/* 🎨 1. LEFT COLLAPSIBLE & DRAGGABLE STUDIO FLOATING PANEL (Surface Paints & Finishes) */}
        <div
          className="absolute top-14 left-3 z-30 pointer-events-none flex items-start"
          style={{ transform: `translate3d(${leftPos.x}px, ${leftPos.y}px, 0)` }}
        >
          {isLeftCollapsed ? (
            <button
              onClick={() => setIsLeftCollapsed(false)}
              className="pointer-events-auto bg-neutral-950/90 hover:bg-neutral-900 backdrop-blur-xl border border-neutral-800 text-white px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all"
              title="Expand Surface Styling Dock"
            >
              <span>🎨 Paint & Finishes</span>
              <span className="text-emerald-400">▶</span>
            </button>
          ) : (
            <div className="pointer-events-auto w-72 sm:w-80 max-h-[75vh] bg-neutral-950/95 backdrop-blur-2xl border border-neutral-850 rounded-3xl p-3.5 flex flex-col space-y-3 shadow-2xl overflow-hidden">
              {/* Left Dock Drag Header */}
              <div
                onPointerDown={handlePointerDownLeft}
                onPointerMove={handlePointerMoveLeft}
                onPointerUp={handlePointerUpLeft}
                className="flex items-center justify-between pb-2 border-b border-neutral-850 cursor-grab active:cursor-grabbing select-none"
              >
                <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <span className="text-neutral-500">⋮⋮</span>
                  <span>🎨 Surface Styling</span>
                </span>
                <button
                  onClick={() => setIsLeftCollapsed(true)}
                  className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 hover:border-emerald-500 text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all"
                  title="Collapse Left Dock"
                >
                  ◀
                </button>
              </div>

              {/* Left Dock Sub-Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-900/90 rounded-2xl border border-neutral-850">
                <button
                  onClick={() => setLeftTab("colors")}
                  className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                    leftTab === "colors" ? "bg-emerald-500 text-neutral-950 shadow-md" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  🎨 Paints
                </button>
                <button
                  onClick={() => setLeftTab("finishes")}
                  className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                    leftTab === "finishes" ? "bg-emerald-500 text-neutral-950 shadow-md" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  ✨ Sheen
                </button>
              </div>

              {/* Left Dock Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {leftTab === "colors" && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase text-neutral-400 block tracking-wider">
                      Double-Click Wall to Cycle Paint
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {REAL_PAINTS_CATALOG.map((paint) => {
                        const targetKey = activeSelectedWall || "wall_back";
                        const currentWallColor = config.wallSurfaceStates?.[targetKey]?.color || config.activeWallColor;
                        const isSelected = currentWallColor.toLowerCase() === paint.code.toLowerCase();
                        return (
                          <button
                            key={paint.id}
                            onClick={() => handleColorChange(paint.code)}
                            className={`p-2 rounded-2xl border flex items-center gap-3 transition-all ${
                              isSelected
                                ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500 scale-[1.02]"
                                : "bg-neutral-900/80 border-neutral-850 text-neutral-400 hover:border-neutral-700 hover:text-white"
                            }`}
                          >
                            <span
                              className="w-6 h-6 rounded-full border border-black/30 shadow-inner shrink-0"
                              style={{ backgroundColor: paint.code }}
                            />
                            <div className="text-left min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-white tracking-tight leading-none truncate">{paint.name}</p>
                              <p className="text-[9px] text-neutral-400 font-mono mt-1">{paint.code.toUpperCase()}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {leftTab === "finishes" && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase text-neutral-400 block tracking-wider">
                      Wall Sheen & Specular Reflectivity
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "EMULSION", name: "🛋️ Emulsion Sheen", desc: "Matte Diffuse Finish" },
                        { id: "SATIN", name: "✨ Satin Sheen", desc: "Silk Gloss & Smooth Soft Highlights" },
                        { id: "GLOSS", name: "💎 High Gloss", desc: "Reflective Lacquer Mirror Finish" },
                      ].map((f) => {
                        const targetKey = activeSelectedWall || "wall_back";
                        const currentWallFinish = config.wallSurfaceStates?.[targetKey]?.finish || config.activeWallFinish;
                        const isSelected = currentWallFinish === f.id;
                        return (
                          <button
                            key={f.id}
                            onClick={() => handleFinishChange(f.id as WallFinishType)}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500"
                                : "bg-neutral-900/80 border-neutral-850 text-neutral-400 hover:text-white"
                            }`}
                          >
                            <p className="text-xs font-black uppercase tracking-wider">{f.name}</p>
                            <p className="text-[9px] text-neutral-400 font-mono mt-0.5">{f.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ☀️ 2. RIGHT COLLAPSIBLE & DRAGGABLE STUDIO FLOATING PANEL (Lighting, Atmosphere & Fixtures) */}
        {config.isAdmin && !config.hideLightingTab && (
          <div
            className="absolute top-14 right-3 z-30 pointer-events-none flex items-start justify-end"
            style={{ transform: `translate3d(${rightPos.x}px, ${rightPos.y}px, 0)` }}
          >
            {isRightCollapsed ? (
              <button
                onClick={() => setIsRightCollapsed(false)}
                className="pointer-events-auto bg-neutral-950/90 hover:bg-neutral-900 backdrop-blur-xl border border-neutral-800 text-white px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all"
                title="Expand Lighting & Sky Dock"
              >
                <span className="text-emerald-400">◀</span>
                <span>☀️ Lighting & Sky</span>
              </button>
            ) : (
              <div className="pointer-events-auto w-72 sm:w-80 max-h-[75vh] bg-neutral-950/95 backdrop-blur-2xl border border-neutral-850 rounded-3xl p-3.5 flex flex-col space-y-3 shadow-2xl overflow-hidden">
                {/* Right Dock Drag Header */}
                <div
                  onPointerDown={handlePointerDownRight}
                  onPointerMove={handlePointerMoveRight}
                  onPointerUp={handlePointerUpRight}
                  className="flex items-center justify-between pb-2 border-b border-neutral-850 cursor-grab active:cursor-grabbing select-none"
                >
                  <button
                    onClick={() => setIsRightCollapsed(true)}
                    className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 hover:border-emerald-500 text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all"
                    title="Collapse Right Dock"
                  >
                    ▶
                  </button>
                  <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                    <span className="text-neutral-500">⋮⋮</span>
                    <span>☀️ Daylight & Sky</span>
                  </span>
                </div>

                {/* Right Dock Sub-Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-900/90 rounded-2xl border border-neutral-850">
                  <button
                    onClick={() => setRightTab("sun")}
                    className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                      rightTab === "sun" ? "bg-emerald-500 text-neutral-950 shadow-md" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    ☀️ Sun & Sky
                  </button>
                  <button
                    onClick={() => setRightTab("lighting")}
                    className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                      rightTab === "lighting" ? "bg-emerald-500 text-neutral-950 shadow-md" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    💡 Interior Lamps
                  </button>
                </div>

                {/* Right Dock Content */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {rightTab === "sun" && (
                    <div className="space-y-3">
                      {/* Global Daylight Presets */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider block">
                          Daylight Presets
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
                                onClick={() => onConfigChange?.({ timeOfDay: p.key as LightingPresetKey })}
                                className={`py-1.5 text-[9px] font-bold rounded-xl border text-center transition-all ${
                                  isSelected
                                    ? "bg-emerald-500 text-black border-emerald-400 font-black shadow-md"
                                    : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"
                                }`}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sun Azimuth & Elevation Sliders */}
                      {config.timeOfDay !== "night" && (
                        <div className="space-y-3 bg-neutral-900/60 p-2.5 rounded-2xl border border-neutral-850">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold uppercase text-neutral-400">
                              <span>Sun Azimuth</span>
                              <span className="font-mono text-emerald-400">
                                {config.sunAzimuthOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.sun.azimuthDeg ?? 135}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              step="5"
                              value={config.sunAzimuthOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.sun.azimuthDeg ?? 135}
                              onChange={(e) => onConfigChange?.({ sunAzimuthOverride: parseFloat(e.target.value) })}
                              className="w-full accent-emerald-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold uppercase text-neutral-400">
                              <span>Sun Elevation</span>
                              <span className="font-mono text-emerald-400">
                                {config.sunElevationOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.sun.elevationDeg ?? 35}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="85"
                              step="5"
                              value={config.sunElevationOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.sun.elevationDeg ?? 35}
                              onChange={(e) => onConfigChange?.({ sunElevationOverride: parseFloat(e.target.value) })}
                              className="w-full accent-emerald-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1 pt-2 border-t border-neutral-800/60">
                            <div className="flex justify-between text-[9px] font-bold uppercase text-neutral-400">
                              <span>Sun Intensity</span>
                              <span className="font-mono text-emerald-400">
                                {(config.sunIntensityOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.sun.intensity ?? 2.8).toFixed(1)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="5.0"
                              step="0.1"
                              value={config.sunIntensityOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.sun.intensity ?? 2.8}
                              onChange={(e) => onConfigChange?.({ sunIntensityOverride: parseFloat(e.target.value) })}
                              className="w-full accent-emerald-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {/* 💾 Save Custom Sun Setup per Project */}
                      {onSaveLightingConfig && (
                        <button
                          onClick={() =>
                            onSaveLightingConfig({
                              timeOfDay: (config.timeOfDay as LightingPresetKey) || "morning",
                              azimuth: config.sunAzimuthOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.sun.azimuthDeg ?? 135,
                              elevation: config.sunElevationOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.sun.elevationDeg ?? 35,
                              intensity: config.sunIntensityOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.sun.intensity ?? 2.8,
                              ambient: config.ambientIntensityOverride ?? MASTER_LIGHTING_PRESETS[config.timeOfDay as LightingPresetKey || "morning"]?.environment.ambientIntensity ?? 0.5,
                              color: config.sunColorOverride,
                            })
                          }
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                        >
                          💾 Save Sun Setup
                        </button>
                      )}
                    </div>
                  )}

                  {rightTab === "lighting" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-neutral-900/80 p-2 rounded-xl border border-neutral-800">
                        <span className="text-[9px] font-black uppercase text-white tracking-wider">Add Fixture</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAddBulb("point")}
                            className="px-2 py-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700/50 rounded-lg text-[9px] font-bold uppercase transition-all"
                          >
                            + Lamp
                          </button>
                          <button
                            onClick={() => handleAddBulb("spot")}
                            className="px-2 py-1 bg-amber-950 text-amber-400 hover:bg-amber-900 border border-amber-700/50 rounded-lg text-[9px] font-bold uppercase transition-all"
                          >
                            + Spot
                          </button>
                        </div>
                      </div>

                      <LightControls
                        bulbs={bulbs}
                        setBulbs={setBulbs}
                        isNightMode={config.timeOfDay === "night"}
                        setIsNightMode={(isNight) => onConfigChange?.({ timeOfDay: isNight ? "night" : "morning" })}
                        selectedBulbId={selectedBulbId}
                        onSelectBulb={setSelectedBulbId}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}