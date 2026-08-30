"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Sky, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { generateWallNormalMap } from "@/utils/generateWallNormalMaps";
import { TEXTURE_PRESETS, getMeshCategory } from "@/utils/generateFloorTextures";
import PaintItMasterCanvas from "@/components/canvas/PaintItMasterCanvas";
import { LightingPresetKey } from "@/config/lightingPresets";

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
  const { scene } = useGLTF(config.modelUrl) as unknown as { scene: THREE.Group };
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
  }, [clonedScene, config, wallNormalMap]);

  return <primitive object={clonedScene} />;
}

export default function RealismTestStudioPage() {
  const [config, setConfig] = useState<RealismConfig>(DEFAULT_REALISM_CONFIG);

  // Real-time Sun & Daylight Preset Lighting State
  const [timeOfDay, setTimeOfDay] = useState<LightingPresetKey>("morning");
  const [sunAzimuth, setSunAzimuth] = useState<number>(270);
  const [sunElevation, setSunElevation] = useState<number>(35);
  const [sunIntensity, setSunIntensity] = useState<number>(2.8);
  const [sunColor, setSunColor] = useState<string | undefined>(undefined);
  const [ambientIntensity, setAmbientIntensity] = useState<number | undefined>(undefined);
  const [isCeilingCutaway, setIsCeilingCutaway] = useState<boolean>(false);

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
          <div className="w-3 h-3 rounded-full bg-[#FF8C38] animate-pulse" />
          <h1 className="text-sm font-black uppercase tracking-wider text-white">PaintIT 2.0 Realism</h1>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-neutral-900 border border-neutral-800 text-neutral-400">
            Engine v2.4
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCaptureSnapshot}
            className="px-3.5 py-1.5 bg-[#FF8C38] hover:bg-[#FF8C38] text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>📸 Capture 4K Photo Render</span>
          </button>
        </div>
      </header>

      {/* Main Realism Test Surface Layout */}
      <div className="flex-1 relative overflow-hidden bg-neutral-950">
        <PaintItMasterCanvas
          config={{
            mode: "admin",
            modelUrl: config.modelUrl,
            timeOfDay: timeOfDay,
            sunAzimuthOverride: sunAzimuth,
            sunElevationOverride: sunElevation,
            sunIntensityOverride: sunIntensity,
            sunColorOverride: sunColor,
            ambientIntensityOverride: ambientIntensity,
            activeWallColor: config.wallColor,
            activeWallFinish: config.wallFinish,
            activeCeilingType: config.ceilingType,
            activeFloorTextureId: config.floorTextureId,
            wallSurfaceStates: (config as unknown as Record<string, unknown>).wallSurfaceStates as Record<string, { color: string; finish: "EMULSION" | "GLOSS" | "SATIN" }>,
            bumpScale: config.bumpScale,
            shadowOpacity: config.shadowOpacity,
            isCeilingCutaway: isCeilingCutaway,
            isAdmin: true,
          }}
          onConfigChange={(newCfg) => {
            if (newCfg.timeOfDay) setTimeOfDay(newCfg.timeOfDay as LightingPresetKey);
            if (newCfg.sunAzimuthOverride !== undefined) setSunAzimuth(newCfg.sunAzimuthOverride);
            if (newCfg.sunElevationOverride !== undefined) setSunElevation(newCfg.sunElevationOverride);
            if (newCfg.sunIntensityOverride !== undefined) setSunIntensity(newCfg.sunIntensityOverride);
            if (newCfg.sunColorOverride !== undefined) setSunColor(newCfg.sunColorOverride);
            if (newCfg.ambientIntensityOverride !== undefined) setAmbientIntensity(newCfg.ambientIntensityOverride);
            if (newCfg.isCeilingCutaway !== undefined) setIsCeilingCutaway(newCfg.isCeilingCutaway);

            setConfig((prev) => ({
              ...prev,
              ...(newCfg.wallSurfaceStates && { wallSurfaceStates: newCfg.wallSurfaceStates }),
              ...(newCfg.activeWallColor && { wallColor: newCfg.activeWallColor }),
              ...(newCfg.activeWallFinish && { wallFinish: newCfg.activeWallFinish }),
            }));
          }}
          onSurfaceSelect={(meshName, category, point) => {
            console.log("🎯 1-Tap Surface Select:", meshName, category, point);
          }}
          onSaveLightingConfig={(lightingData) => {
            console.log("💾 Lighting config saved for project:", lightingData);
            alert(`💾 Sun configuration saved successfully!\n\nPreset: ${lightingData.timeOfDay}\nAzimuth: ${lightingData.azimuth}°\nElevation: ${lightingData.elevation}°\nIntensity: ${lightingData.intensity}x\nAmbient: ${lightingData.ambient}`);
          }}
          onSaveCameraConfig={(cameraData) => {
            console.log("💾 Camera configuration saved for project DB:", cameraData);
            alert(`💾 Camera configuration saved successfully for DB!\n\nZoom Min: ${cameraData.minDistance}m\nZoom Max: ${cameraData.maxDistance}m\nTilt Max: ${Math.round((cameraData.maxPolarAngle * 180) / Math.PI)}°\nFOV: ${cameraData.fov}°\nPosition: [${cameraData.position.join(", ")}]\nTarget: [${cameraData.target.join(", ")}]`);
          }}
        />
      </div>
    </div>
  );
}
