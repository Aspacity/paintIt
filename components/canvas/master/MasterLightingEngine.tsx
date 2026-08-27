"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { Sky, TransformControls } from "@react-three/drei";
import { BulbState } from "@/components/canvas/LightControls";
import {
  LightingPresetKey,
  MASTER_LIGHTING_PRESETS,
  calculateSunPosition,
} from "@/config/lightingPresets";

export interface MasterLightingEngineProps {
  timeOfDay?: LightingPresetKey | "day";
  sunAzimuthOverride?: number;
  sunElevationOverride?: number;
  sunIntensityOverride?: number;
  sunColorOverride?: string;
  ambientIntensityOverride?: number;
  bulbs?: BulbState[];
  setBulbs?: React.Dispatch<React.SetStateAction<BulbState[]>>;
  selectedBulbId?: string | null;
  onSelectBulb?: (id: string | null) => void;
  isAdmin?: boolean;
}

export default function MasterLightingEngine({
  timeOfDay = "morning",
  sunAzimuthOverride,
  sunElevationOverride,
  sunIntensityOverride,
  sunColorOverride,
  ambientIntensityOverride,
  bulbs = [],
  setBulbs,
  selectedBulbId = null,
  onSelectBulb,
  isAdmin = false,
}: MasterLightingEngineProps) {
  const bulbRefs = useRef<Record<string, THREE.Group | null>>({});
  const [selectedMesh, setSelectedMesh] = useState<THREE.Group | null>(null);

  // Normalize preset key (map legacy "day" -> "morning")
  const activePresetKey: LightingPresetKey =
    timeOfDay === "day" ? "morning" : (timeOfDay as LightingPresetKey) || "morning";

  const preset = MASTER_LIGHTING_PRESETS[activePresetKey] || MASTER_LIGHTING_PRESETS.morning;

  // Resolve custom overrides over active preset
  const azimuth = sunAzimuthOverride ?? preset.sun.azimuthDeg;
  const elevation = sunElevationOverride ?? preset.sun.elevationDeg;
  const intensity = (sunIntensityOverride ?? preset.sun.intensity) * 1.6;
  const sunColor = sunColorOverride ?? preset.sun.color;
  const ambientIntensity = (ambientIntensityOverride ?? preset.environment.ambientIntensity) * 2.2;

  // Calculate 3D Cartesian sun position vector
  const sunPosition = useMemo(() => {
    return calculateSunPosition(elevation, azimuth, 15);
  }, [elevation, azimuth]);

  // Sync selected mesh for TransformControls when selectedBulbId changes
  useEffect(() => {
    if (selectedBulbId && bulbRefs.current[selectedBulbId] && isAdmin) {
      setSelectedMesh(bulbRefs.current[selectedBulbId]);
    } else {
      setSelectedMesh(null);
    }
  }, [selectedBulbId, bulbs, isAdmin]);

  const activeBulbs = bulbs.filter((b) => b.visible !== false && b.enabled !== false);

  return (
    <>
      {/* ☀️ 1. GLOBAL WORLD DAYLIGHT & ATMOSPHERE ENGINE */}
      {activePresetKey !== "night" ? (
        <>
          <directionalLight
            position={sunPosition}
            intensity={intensity}
            color={sunColor}
            castShadow
            shadow-mapSize-width={preset.sun.shadowMapSize}
            shadow-mapSize-height={preset.sun.shadowMapSize}
            shadow-camera-far={preset.sun.shadowCameraFar}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
            shadow-bias={preset.sun.shadowBias}
          />
          <ambientLight intensity={ambientIntensity} color={preset.environment.ambientColor} />
          <hemisphereLight
            args={[
              preset.environment.skySkyColor,
              preset.environment.skyGroundColor,
              preset.environment.skyIntensity * 1.8,
            ]}
          />
          <Sky
            distance={450000}
            sunPosition={sunPosition}
            turbidity={preset.environment.skyTurbidity}
            rayleigh={preset.environment.skyRayleigh}
            mieCoefficient={preset.environment.skyMieCoefficient}
            mieDirectionalG={preset.environment.skyMieDirectionalG}
          />
        </>
      ) : (
        <>
          {/* 🌙 NIGHT MODE MOONLIGHT & ATMOSPHERE */}
          <directionalLight
            position={[sunPosition[0], Math.max(8, sunPosition[1]), sunPosition[2]]}
            intensity={0.8}
            color="#9bb8e8"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0005}
          />
          <ambientLight intensity={Math.max(0.4, ambientIntensity)} color="#2c3a54" />
          <hemisphereLight args={["#354b73", "#111827", 0.4]} />
        </>
      )}

      {/* 💡 2. INTERIOR BULBS ENGINE */}
      {activeBulbs.map((bulb) => {
        const isSelected = isAdmin && selectedBulbId === bulb.id;
        return (
          <group
            key={bulb.id}
            ref={(el) => {
              bulbRefs.current[bulb.id] = el;
            }}
            position={bulb.position}
            onClick={(e) => {
              if (!isAdmin) return;
              e.stopPropagation();
              onSelectBulb?.(bulb.id);
            }}
          >
            {/* Visual Bulb Marker Mesh (Only visible in Master Admin mode) */}
            {isAdmin && (
              <mesh castShadow={false} receiveShadow={false}>
                <sphereGeometry args={[0.08, 24, 24]} />
                <meshStandardMaterial
                  color={bulb.color}
                  emissive={bulb.color}
                  emissiveIntensity={isSelected ? 2.5 : 1.2}
                  wireframe={isSelected}
                />
              </mesh>
            )}

            {bulb.type === "spot" ? (
              <spotLight
                position={[0, 0, 0]}
                rotation={bulb.rotation}
                intensity={(bulb.intensity || 2.5) * 6.0}
                color={bulb.color}
                angle={Math.PI / 3}
                penumbra={0.85}
                distance={bulb.distance || 20}
                castShadow={false}
              />
            ) : (
              <pointLight
                position={[0, 0, 0]}
                intensity={(bulb.intensity || 1.5) * 5.0}
                color={bulb.color}
                distance={bulb.distance || 20}
                decay={1.5}
                castShadow={false}
              />
            )}
          </group>
        );
      })}

      {/* 🎯 3D LEVA / TRANSFORM GIZMO FOR MASTER ADMIN ONLY */}
      {isAdmin && selectedBulbId && selectedMesh && (
        <TransformControls
          object={selectedMesh}
          mode="translate"
          size={0.6}
          onObjectChange={() => {
            if (selectedMesh && setBulbs) {
              const pos = selectedMesh.position;
              setBulbs((prev) =>
                prev.map((b) =>
                  b.id === selectedBulbId ? { ...b, position: [pos.x, pos.y, pos.z] } : b
                )
              );
            }
          }}
        />
      )}
    </>
  );
}
