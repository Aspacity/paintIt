"use client";

import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import { LightingPresetKey, MASTER_LIGHTING_PRESETS } from "@/config/lightingPresets";
import { TEXTURE_PRESETS } from "@/utils/generateFloorTextures";
import { REAL_PAINTS_CATALOG } from "@/config/paints";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";

import MasterLightingEngine from "./master/MasterLightingEngine";
import MasterCameraRig, { CameraConfigPayload } from "./master/MasterCameraRig";
import MasterPaintSplashRipple from "./master/MasterPaintSplashRipple";
import LightControls, { BulbState } from "@/components/canvas/LightControls";
import { MasterModelAssemblyPanel } from "./master/MasterModelAssemblyPanel";
import { ModularAssetInstance } from "./ModularAssetInstance";
import { FurnishItAssetItem } from "@/config/furnishItAssets";
import { PlacedObjectTransform } from "@/types/modular";

import { Leva } from "leva";
import { CanvasTopStatusBar, CameraViewPreset } from "./master/CanvasTopStatusBar";
import { CanvasMobileToolsDrawer } from "./master/CanvasMobileToolsDrawer";
import { threeCache } from "@/utils/threeCacheManager";
import { paintitApi } from "@/lib/apiClient";

export type WallFinishType = "EMULSION" | "SATIN" | "GLOSS";
export type TimeOfDayPreset = LightingPresetKey | "day";

export interface SurfaceState {
  color: string;
  finish: WallFinishType;
}

export interface MasterCanvasConfig {
  mode: "demo" | "painter" | "sandbox" | "admin";
  modelUrl: string;
  timeOfDay: TimeOfDayPreset;
  sunAzimuthOverride?: number;
  sunElevationOverride?: number;
  sunIntensityOverride?: number;
  ambientIntensityOverride?: number;
  sunColorOverride?: string;
  bulbs?: BulbState[];
  activeWallColor: string;
  activeWallFinish: WallFinishType;
  activeCeilingType: "Ceiling_FlatModern" | "Ceiling_Tray" | "Ceiling_POP" | "Ceiling_Cove" | "Ceiling_Linear";
  activeFloorTextureId: string;
  wallSurfaceStates?: Record<string, SurfaceState>;
  bumpScale?: number;
  shadowOpacity?: number;
  enableAutoCutaway?: boolean;
  isCeilingCutaway?: boolean;
  isAdmin?: boolean;
  hideLightingTab?: boolean;
  hideFloorTab?: boolean;
  hideAssemblyPanel?: boolean;
}

export interface PaintItMasterCanvasProps {
  config: MasterCanvasConfig;
  savedCameraConfig?: CameraConfigPayload | null;
  onConfigChange?: (newConfig: Partial<MasterCanvasConfig>) => void;
  onSurfaceSelect?: (meshName: string, category: string, point: THREE.Vector3) => void;
  onSaveLightingConfig?: (data: any) => void;
  onSaveCameraConfig?: (camConfig: CameraConfigPayload) => void;
  isSavingLocally?: boolean;
  lastSavedTimestamp?: number | null;
}

function getMeshIdentifiers(meshOrName: THREE.Object3D | string): { allNames: string; primaryName: string } {
  const namesToTest: string[] = [];
  let primaryName = "";

  if (typeof meshOrName === "string") {
    namesToTest.push(meshOrName);
    primaryName = meshOrName;
  } else if (meshOrName) {
    primaryName = meshOrName.name || "";
    if (meshOrName.name) namesToTest.push(meshOrName.name);
    if (meshOrName.parent?.name) namesToTest.push(meshOrName.parent.name);
    if ((meshOrName as THREE.Mesh).material) {
      const mat = (meshOrName as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.name && namesToTest.push(m.name));
      } else if (mat.name) {
        namesToTest.push(mat.name);
      }
    }
  }

  return {
    allNames: namesToTest.join(" ").toLowerCase(),
    primaryName,
  };
}

function getMeshCategory(meshOrName: THREE.Object3D | string): "WALL" | "FLOOR" | "CEILING" | "OTHER" {
  const { allNames } = getMeshIdentifiers(meshOrName);
  if (
    allNames.includes("wall") ||
    allNames.includes("toilet") ||
    allNames.includes("restroom") ||
    allNames.includes("bath") ||
    allNames.includes("partition") ||
    allNames.includes("cube.016") ||
    allNames.includes("cube.034") ||
    allNames.includes("cube.035") ||
    allNames.includes("cube.036") ||
    allNames.includes("cube.037")
  ) {
    return "WALL";
  }
  if (allNames.includes("floor") || allNames.includes("ground") || allNames.includes("base") || allNames.includes("wood floor")) return "FLOOR";
  if (allNames.includes("ceiling") || allNames.includes("roof")) return "CEILING";
  return "OTHER";
}

function resolveWallKey(meshOrName: THREE.Object3D | string): string {
  const { allNames } = getMeshIdentifiers(meshOrName);
  if (allNames.includes("toilet") || allNames.includes("restroom") || allNames.includes("bath") || allNames.includes("cube.016")) return "toilet";
  if (allNames.includes("back") || allNames.includes("cube.036")) return "wall_back";
  if (allNames.includes("left") || allNames.includes("cube.035")) return "wall_left";
  if (allNames.includes("right") || allNames.includes("cube.037")) return "wall_right";
  if (allNames.includes("front") || allNames.includes("accent") || allNames.includes("cube.034")) return "wall_front";
  if (allNames.includes("ceiling") || allNames.includes("cube.038")) return "ceiling";
  return "wall_back";
}

function CanvasSceneMeshEngine({
  config,
  onSurfaceSelect,
  onDoubleClickSurface,
  selectedSurfacePoint,
  isPaintDormant,
  cameraPreset,
}: {
  config: MasterCanvasConfig;
  onSurfaceSelect?: (rawName: string, category: string, point: THREE.Vector3) => void;
  onDoubleClickSurface?: (rawName: string, category: string, point: THREE.Vector3) => void;
  selectedSurfacePoint: THREE.Vector3 | null;
  isPaintDormant: boolean;
  cameraPreset: CameraViewPreset | null;
}) {
  const lastTapRef = useRef<{ time: number; meshName: string }>({ time: 0, meshName: "" });
  const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let active = true;
    const { GLTFLoader } = require("three/examples/jsm/loaders/GLTFLoader.js");
    const { DRACOLoader } = require("three/examples/jsm/loaders/DRACOLoader.js");

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      config.modelUrl,
      (gltf: any) => {
        if (active) setGltfScene(gltf.scene);
      },
      undefined,
      (err: any) => console.error("Error loading 3D GLTF model:", err)
    );
    return () => {
      active = false;
      dracoLoader.dispose();
    };
  }, [config.modelUrl]);

  const clonedScene = React.useMemo(() => {
    if (!gltfScene) return null;
    return gltfScene.clone(true);
  }, [gltfScene]);

  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const meshName = node.name;
        const nameLower = meshName.toLowerCase();
        const category = getMeshCategory(node);

        const isGlassPane =
          (nameLower.includes("glass") || nameLower.includes("window") || nameLower.includes("pane") || nameLower.includes("glazing")) &&
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
                m.opacity = 0.05;
                m.roughness = 0.01;
                m.metalness = 0.9;
                m.depthWrite = false;
                m.needsUpdate = true;
              }
            });
          }
        } else {
          node.receiveShadow = true;
          node.castShadow = true;
        }

        if (meshName.startsWith("Ceiling_") || meshName.startsWith("Cove_Lights_")) {
          if (config.activeCeilingType === "Ceiling_FlatModern") node.visible = meshName.includes("Flat");
          else if (config.activeCeilingType === "Ceiling_Tray") node.visible = meshName.includes("Tray");
          else if (config.activeCeilingType === "Ceiling_POP") node.visible = meshName.includes("POP");
          else if (config.activeCeilingType === "Ceiling_Cove") node.visible = meshName.includes("Cove");
          else if (config.activeCeilingType === "Ceiling_Linear") node.visible = meshName.includes("Linear");
        }

        // 1. Photorealistic Floor PBR Texture Mapping with Caching
        if (category === "FLOOR") {
          if (config.activeFloorTextureId && config.activeFloorTextureId !== "original") {
            const preset = TEXTURE_PRESETS.find((p) => p.id === config.activeFloorTextureId);
            if (preset) {
              const texture = threeCache.getOrCreateTexture(`texture_${preset.id}`, () => preset.generateTexture());
              const mat = threeCache.getOrCreateMaterial(`mat_floor_${preset.id}`, () => {
                return new THREE.MeshStandardMaterial({
                  map: texture,
                  roughness: preset.roughness,
                  metalness: preset.metalness,
                  side: THREE.DoubleSide,
                });
              });
              node.material = mat;
              node.material.needsUpdate = true;
              return;
            }
          }
        }

        // 2. Pure Architectural Wall Paint & Sheen Engine
        const isWall = category === "WALL";
        const isCeiling = category === "CEILING";

        if (isWall || isCeiling) {
          const key = resolveWallKey(node);
          const wallState = config.wallSurfaceStates?.[key];
          const wallColor = wallState?.color || (isCeiling ? "#FFFFFF" : config.activeWallColor);
          const wallFinish = wallState?.finish || config.activeWallFinish;

          const matCacheKey = `mat_wall_${key}_${wallColor}_${wallFinish}`;
          const mat = threeCache.getOrCreateMaterial(matCacheKey, () => {
            const m = new THREE.MeshStandardMaterial({
              side: THREE.DoubleSide,
              shadowSide: THREE.DoubleSide,
            });
            m.color.set(wallColor);
            if (isCeiling) {
              m.roughness = 0.95;
              m.metalness = 0.0;
            } else {
              m.roughness = wallFinish === "SATIN" ? 0.35 : wallFinish === "GLOSS" ? 0.15 : 0.85;
              m.metalness = wallFinish === "SATIN" ? 0.04 : wallFinish === "GLOSS" ? 0.12 : 0.0;
            }
            return m;
          });

          mat.color.set(wallColor);
          mat.needsUpdate = true;
          node.material = mat;
        }
      }
    });
  }, [clonedScene, config]);

  useFrame(({ camera }) => {
    if (!clonedScene) return;
    const shouldCutawayCeiling = Boolean(config.isCeilingCutaway);

    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const meshName = node.name.toLowerCase();
        if (
          meshName.includes("ceiling") ||
          meshName.includes("roof") ||
          meshName.includes("cove")
        ) {
          node.visible = !shouldCutawayCeiling;
        }
      }
    });
  });

  if (!clonedScene) return null;

  return (
    <group>
      <primitive
        object={clonedScene}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (isPaintDormant) return;
          if (e.object instanceof THREE.Mesh) {
            const category = getMeshCategory(e.object);
            const key = resolveWallKey(e.object);
            const rawName = e.object.name || e.object.parent?.name || key;
            const now = Date.now();
            const isDoubleTap =
              lastTapRef.current.meshName === rawName && now - lastTapRef.current.time < 350;

            lastTapRef.current = { time: now, meshName: rawName };

            if (isDoubleTap) {
              onDoubleClickSurface?.(rawName, category, e.point);
            } else {
              onSurfaceSelect?.(rawName, category, e.point);
            }
          }
        }}
        onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (isPaintDormant) return;
          if (e.object instanceof THREE.Mesh) {
            const category = getMeshCategory(e.object);
            const key = resolveWallKey(e.object);
            const rawName = e.object.name || e.object.parent?.name || key;
            onDoubleClickSurface?.(rawName, category, e.point);
          }
        }}
      />

      {selectedSurfacePoint && (
        <mesh position={selectedSurfacePoint}>
          <ringGeometry args={[0.08, 0.12, 32]} />
          <meshBasicMaterial color="#FF8C38" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export default function PaintItMasterCanvas({
  config,
  savedCameraConfig,
  onConfigChange,
  onSurfaceSelect,
  onSaveLightingConfig,
  onSaveCameraConfig,
  isSavingLocally,
  lastSavedTimestamp,
}: PaintItMasterCanvasProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedPoint, setSelectedPoint] = useState<THREE.Vector3 | null>(null);
  const [activeSelectedWall, setActiveSelectedWall] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset | null>(null);

  const [studioMode, setStudioMode] = useState<"PAINT" | "FURNITURE" | "ROOM">("PAINT");
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [furnitureTransformMode, setFurnitureTransformMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [placedFurnitureAssets, setPlacedFurnitureAssets] = useState<
    Array<{ id: string; asset: FurnishItAssetItem; transform: PlacedObjectTransform }>
  >([]);

  const [bulbs, setBulbs] = useState<BulbState[]>(config.bulbs || []);
  const [selectedBulbId, setSelectedBulbId] = useState<string | null>(null);

  const [rightPos, setRightPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(true);
  const [rightTab, setRightTab] = useState<"sun" | "lighting">("sun");
  const [paintSplashes, setPaintSplashes] = useState<
    Array<{ id: string; position: THREE.Vector3; color: string }>
  >([]);

  const [paintsList, setPaintsList] = useState<any[]>(REAL_PAINTS_CATALOG);

  useEffect(() => {
    let isMounted = true;
    const fetchDatabasePaints = async () => {
      try {
        const data = await paintitApi.get<{ paints: any[] }>("/api/paints");
        if (isMounted && data.paints && data.paints.length > 0) {
          setPaintsList(data.paints);
        }
      } catch {
        // Maintain config/paints.ts defaults when offline or unconfigured
      }
    };
    fetchDatabasePaints();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSurfaceSelect = (rawName: string, category: string, point: THREE.Vector3) => {
    setSelectedPoint(point);
    const key = resolveWallKey(rawName);
    setActiveSelectedWall(key);
    onSurfaceSelect?.(rawName, category, point);
  };

  const handleDoubleClickSurface = (rawName: string, category: string, point: THREE.Vector3) => {
    const key = resolveWallKey(rawName);
    setSelectedPoint(point);
    setActiveSelectedWall(key);

    const currentStates = config.wallSurfaceStates || {
      wall_back: { color: "#C4B199", finish: "EMULSION" },
      wall_left: { color: "#C4B199", finish: "EMULSION" },
      wall_right: { color: "#C4B199", finish: "EMULSION" },
      wall_front: { color: "#C4B199", finish: "EMULSION" },
      toilet: { color: "#C4B199", finish: "EMULSION" },
      ceiling: { color: "#FFFFFF", finish: "EMULSION" },
    };

    const currentColorOnWall = currentStates[key]?.color || config.activeWallColor || "#C4B199";

    // 🎨 Locate current color index and cycle to the NEXT color on the paint list
    const catalogList = paintsList && paintsList.length > 0 ? paintsList : REAL_PAINTS_CATALOG;
    const currentIndex = catalogList.findIndex(
      (p) => (p.code || p.hex)?.toLowerCase() === currentColorOnWall.toLowerCase()
    );

    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % catalogList.length : 0;
    const nextPaint = catalogList[nextIndex];
    const nextColor = nextPaint?.code || nextPaint?.hex || "#FF8C38";

    const currentFinish = currentStates[key]?.finish || config.activeWallFinish || "EMULSION";
    const updatedStates = {
      ...currentStates,
      [key]: { color: nextColor, finish: currentFinish },
    };

    setPaintSplashes((prev) => [
      ...prev,
      { id: `splash-${Date.now()}`, position: point.clone(), color: nextColor },
    ]);

    onConfigChange?.({
      activeWallColor: nextColor,
      wallSurfaceStates: updatedStates,
    });
  };

  const handleColorChange = (colorHex: string) => {
    const targetKey = activeSelectedWall || "wall_back";
    const currentStates = config.wallSurfaceStates || {
      wall_back: { color: "#C4B199", finish: "EMULSION" },
      wall_left: { color: "#C4B199", finish: "EMULSION" },
      wall_right: { color: "#C4B199", finish: "EMULSION" },
      wall_front: { color: "#C4B199", finish: "EMULSION" },
      toilet: { color: "#C4B199", finish: "EMULSION" },
      ceiling: { color: "#FFFFFF", finish: "EMULSION" },
    };

    const currentFinish = currentStates[targetKey]?.finish || config.activeWallFinish || "EMULSION";
    const updatedStates = {
      ...currentStates,
      [targetKey]: { color: colorHex, finish: currentFinish },
    };

    if (selectedPoint) {
      setPaintSplashes((prev) => [
        ...prev,
        { id: `splash-${Date.now()}`, position: selectedPoint.clone(), color: colorHex },
      ]);
    }

    onConfigChange?.({
      activeWallColor: colorHex,
      wallSurfaceStates: updatedStates,
    });
  };

  const handleFinishChange = (finish: WallFinishType) => {
    const targetKey = activeSelectedWall || "wall_back";
    const currentStates = config.wallSurfaceStates || {
      wall_back: { color: "#C4B199", finish: "EMULSION" },
      wall_left: { color: "#C4B199", finish: "EMULSION" },
      wall_right: { color: "#C4B199", finish: "EMULSION" },
      wall_front: { color: "#C4B199", finish: "EMULSION" },
      toilet: { color: "#C4B199", finish: "EMULSION" },
      ceiling: { color: "#FFFFFF", finish: "EMULSION" },
    };

    const currentColor = currentStates[targetKey]?.color || config.activeWallColor || "#C4B199";
    const updatedStates = {
      ...currentStates,
      [targetKey]: { color: currentColor, finish },
    };

    onConfigChange?.({
      activeWallFinish: finish,
      wallSurfaceStates: updatedStates,
    });
  };

  const handleApplyFinishToAllWalls = (finish: WallFinishType) => {
    const currentStates = config.wallSurfaceStates || {};
    const keys = ["wall_back", "wall_left", "wall_right", "wall_front", "toilet"];
    const updatedStates = { ...currentStates };

    keys.forEach((k) => {
      const c = currentStates[k]?.color || config.activeWallColor || "#C4B199";
      updatedStates[k] = { color: c, finish };
    });

    onConfigChange?.({
      activeWallFinish: finish,
      wallSurfaceStates: updatedStates,
    });
  };

  const handleAddFurnitureAsset = (asset: FurnishItAssetItem) => {
    const newInstance = {
      id: `furn-${Date.now()}`,
      asset,
      transform: {
        position: [0, 0.5, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      },
    };
    setPlacedFurnitureAssets((prev) => [...prev, newInstance]);
    setSelectedFurnitureId(newInstance.id);
    setStudioMode("FURNITURE");
  };

  return (
    <div className={`w-full h-full relative overflow-hidden select-none flex flex-col transition-colors duration-300 ${
      isDark ? "bg-black" : "bg-[#FAF8F5]"
    }`}>
      {/* Global Leva GUI Controller (Hidden for Painters and Homeowners) */}
      <Leva hidden={!config.isAdmin} />

      {/* 3D R3F CANVAS ENGINE */}
      <div className="w-full h-full relative flex-1">
        <Canvas
          shadows
          camera={{ position: [0, 1.8, 4.5], fov: 45 }}
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
          className="w-full h-full"
        >
          <MasterCameraRig
            targetPreset={cameraPreset}
            isAdmin={config.isAdmin}
            savedCameraConfig={savedCameraConfig}
            onSaveCameraConfig={onSaveCameraConfig}
          />
          <MasterLightingEngine
            timeOfDay={config.timeOfDay}
            sunAzimuthOverride={config.sunAzimuthOverride}
            sunElevationOverride={config.sunElevationOverride}
            sunIntensityOverride={config.sunIntensityOverride}
            sunColorOverride={config.sunColorOverride}
            ambientIntensityOverride={config.ambientIntensityOverride}
            bulbs={bulbs}
            isAdmin={config.isAdmin}
          />

          <CanvasSceneMeshEngine
            config={config}
            onSurfaceSelect={handleSurfaceSelect}
            onDoubleClickSurface={handleDoubleClickSurface}
            selectedSurfacePoint={selectedPoint}
            isPaintDormant={studioMode === "FURNITURE"}
            cameraPreset={cameraPreset}
          />

          {placedFurnitureAssets.map((item) => (
            <ModularAssetInstance
              key={item.id}
              objectData={{
                instance_id: item.id,
                asset_id: item.asset.id,
                model_url: item.asset.modelUrl || (item.asset as any).gltfPath,
                name: item.asset.name,
                category: item.asset.category as any,
                transform: item.transform,
              }}
              isSelected={selectedFurnitureId === item.id}
              transformMode={furnitureTransformMode}
              onSelect={() => {
                setSelectedFurnitureId(item.id);
                setStudioMode("FURNITURE");
              }}
              onTransformChange={(updates) => {
                setPlacedFurnitureAssets((prev) =>
                  prev.map((it) => (it.id === item.id ? { ...it, transform: updates } : it))
                );
              }}
            />
          ))}

          {paintSplashes.map((splash) => (
            <MasterPaintSplashRipple key={splash.id} position={splash.position} color={splash.color} />
          ))}
        </Canvas>

        {/* 📱 TOP CENTER FLOATING CAMERA & STATUS BAR */}
        <CanvasTopStatusBar
          activeSelectedWall={activeSelectedWall}
          activeWallFinish={config.activeWallFinish}
          isSavingLocally={isSavingLocally}
          lastSavedTimestamp={lastSavedTimestamp}
          isAdmin={config.isAdmin}
          onSyncToLiveServer={async () => {
            if (onConfigChange && config.wallSurfaceStates) {
              onConfigChange(config);
            }
          }}
          onSelectCameraPreset={(preset) => setCameraPreset(preset)}
        />

        {/* 🛠️ LEFT FLOATING ADMIN ASSEMBLY & CATALOG PANEL */}
        {!config.hideAssemblyPanel && config.isAdmin && (
          <div className="hidden md:flex absolute top-36 left-3 z-30 pointer-events-auto">
            <MasterModelAssemblyPanel
              activeRoomModelUrl={config.modelUrl}
              activeStudioMode={studioMode}
              selectedFurnitureId={selectedFurnitureId}
              placedAssets={placedFurnitureAssets.map((f) => ({
                id: f.id,
                assetId: f.asset.id,
                name: f.asset.name,
                modelUrl: f.asset.modelUrl || (f.asset as any).gltfPath,
                position: f.transform.position,
                rotation: f.transform.rotation,
                scale: f.transform.scale,
              }))}
              transformMode={furnitureTransformMode}
              onTransformModeChange={setFurnitureTransformMode}
              onSelectRoomModel={(url) => onConfigChange?.({ modelUrl: url })}
              onSelectStudioMode={setStudioMode}
              onAddFurnitureAsset={handleAddFurnitureAsset}
              onSelectFurnitureInstance={setSelectedFurnitureId}
              onDeleteFurnitureInstance={(id) => {
                setPlacedFurnitureAssets((prev) => prev.filter((p) => p.id !== id));
                if (selectedFurnitureId === id) setSelectedFurnitureId(null);
              }}
              onClearAllFurniture={() => {
                setPlacedFurnitureAssets([]);
                setSelectedFurnitureId(null);
              }}
            />
          </div>
        )}

        {/* ☀️ RIGHT FLOATING PANEL (Lighting & Sky) */}
        {!config.hideLightingTab && (
          <div
            className="hidden md:flex absolute top-16 right-3 z-30 pointer-events-none items-start justify-end"
            style={{ transform: `translate3d(${rightPos.x}px, ${rightPos.y}px, 0)` }}
          >
            {isRightCollapsed ? (
              <button
                onClick={() => setIsRightCollapsed(false)}
                className="pointer-events-auto bg-neutral-950/90 hover:bg-neutral-900 backdrop-blur-xl border border-neutral-800 text-white px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <span className="text-[#FF8C38]">◀</span>
                <span>☀️ Lighting & Sky</span>
              </button>
            ) : (
              <div className="pointer-events-auto w-80 max-h-[70vh] bg-neutral-950/95 backdrop-blur-2xl border border-neutral-850 rounded-3xl p-3.5 flex flex-col space-y-3 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-850">
                  <button
                    onClick={() => setIsRightCollapsed(true)}
                    className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#FF8C38] text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all"
                  >
                    ▶
                  </button>
                  <span className="text-xs font-bold uppercase text-white tracking-wider">☀️ Daylight & Sky</span>
                </div>

                <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-900/90 rounded-2xl border border-neutral-850">
                  <button
                    onClick={() => setRightTab("sun")}
                    className={`py-1.5 text-[10px] font-bold uppercase rounded-xl transition-all ${
                      rightTab === "sun" ? "bg-[#FF8C38] text-black shadow-md font-extrabold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    ☀️ Sun & Sky
                  </button>
                  <button
                    onClick={() => setRightTab("lighting")}
                    className={`py-1.5 text-[10px] font-bold uppercase rounded-xl transition-all ${
                      rightTab === "lighting" ? "bg-[#FF8C38] text-black shadow-md font-extrabold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    💡 Bulbs
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {rightTab === "sun" && (
                    <div className="space-y-3">
                      <span className="text-[9px] font-bold uppercase text-neutral-400 block">Daylight Presets</span>
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
                                  ? "bg-[#FF8C38] text-black border-[#FF8C38] font-extrabold shadow-md"
                                  : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>

                      {config.isAdmin && (
                        <div className="space-y-2.5 pt-2 border-t border-neutral-850">
                          <span className="text-[9px] font-mono uppercase text-[#FF8C38] font-bold block">
                            👑 Admin Sun Positioning Controls
                          </span>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-neutral-300">
                              <span>Sun Azimuth Angle (°)</span>
                              <span className="font-bold text-white">{config.sunAzimuthOverride ?? 145}°</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={360}
                              step={1}
                              value={config.sunAzimuthOverride ?? 145}
                              onChange={(e) => onConfigChange?.({ sunAzimuthOverride: parseFloat(e.target.value) })}
                              className="w-full accent-[#FF8C38] bg-neutral-900 h-1.5 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-neutral-300">
                              <span>Sun Elevation Height (°)</span>
                              <span className="font-bold text-white">{config.sunElevationOverride ?? 45}°</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={90}
                              step={1}
                              value={config.sunElevationOverride ?? 45}
                              onChange={(e) => onConfigChange?.({ sunElevationOverride: parseFloat(e.target.value) })}
                              className="w-full accent-[#FF8C38] bg-neutral-900 h-1.5 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-neutral-300">
                              <span>Sunlight Intensity</span>
                              <span className="font-bold text-white">{config.sunIntensityOverride ?? 2.5}</span>
                            </div>
                            <input
                              type="range"
                              min={0.1}
                              max={10.0}
                              step={0.1}
                              value={config.sunIntensityOverride ?? 2.5}
                              onChange={(e) => onConfigChange?.({ sunIntensityOverride: parseFloat(e.target.value) })}
                              className="w-full accent-[#FF8C38] bg-neutral-900 h-1.5 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-neutral-300">
                              <span>Ambient Fill Brightness</span>
                              <span className="font-bold text-white">{config.ambientIntensityOverride ?? 1.2}</span>
                            </div>
                            <input
                              type="range"
                              min={0.1}
                              max={5.0}
                              step={0.1}
                              value={config.ambientIntensityOverride ?? 1.2}
                              onChange={(e) => onConfigChange?.({ ambientIntensityOverride: parseFloat(e.target.value) })}
                              className="w-full accent-[#FF8C38] bg-neutral-900 h-1.5 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {rightTab === "lighting" && (
                    <div className="space-y-3">
                      <LightControls
                        bulbs={bulbs}
                        setBulbs={setBulbs}
                        isNightMode={config.timeOfDay === "night"}
                        setIsNightMode={(isNight) => onConfigChange?.({ timeOfDay: isNight ? "night" : "morning" })}
                        selectedBulbId={selectedBulbId}
                        onSelectBulb={setSelectedBulbId}
                        isPainterMode={!config.isAdmin}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 📱 MOBILE BOTTOM TOOLS DRAWER */}
        <CanvasMobileToolsDrawer
          config={config}
          paintsList={paintsList}
          activeSelectedWall={activeSelectedWall}
          bulbs={bulbs}
          setBulbs={setBulbs}
          selectedBulbId={selectedBulbId}
          setSelectedBulbId={setSelectedBulbId}
          studioMode={studioMode}
          setStudioMode={setStudioMode}
          selectedFurnitureId={selectedFurnitureId}
          setSelectedFurnitureId={setSelectedFurnitureId}
          placedFurnitureAssets={placedFurnitureAssets}
          setPlacedFurnitureAssets={setPlacedFurnitureAssets}
          furnitureTransformMode={furnitureTransformMode}
          setFurnitureTransformMode={setFurnitureTransformMode}
          handleAddFurnitureAsset={handleAddFurnitureAsset}
          handleColorChange={handleColorChange}
          handleFinishChange={handleFinishChange}
          handleApplyFinishToAllWalls={handleApplyFinishToAllWalls}
          onConfigChange={onConfigChange}
        />
      </div>
    </div>
  );
}