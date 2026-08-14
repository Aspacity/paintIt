"use client";

import React, { useState } from "react";
import { Environment, Sky, TransformControls } from "@react-three/drei";
import { BulbState } from "@/components/canvas/LightControls";
import { LIGHTING_CONTROLS } from "../PaintItMasterCanvas";
import * as THREE from "three";

interface MasterLightingEngineProps {
  timeOfDay: "day" | "night";
  bulbs?: BulbState[];
  setBulbs?: React.Dispatch<React.SetStateAction<BulbState[]>>;
  selectedBulbId?: string | null;
  onSelectBulb?: (id: string | null) => void;
}

function sunVectorFromElevationAzimuth(elevationDeg: number, azimuthDeg: number, radius = 100): [number, number, number] {
  const phi = (90 - elevationDeg) * (Math.PI / 180);
  const theta = (azimuthDeg - 90) * (Math.PI / 180);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

export default function MasterLightingEngine({
  timeOfDay,
  bulbs = [],
  setBulbs,
  selectedBulbId,
  onSelectBulb,
}: MasterLightingEngineProps) {
  const profile = LIGHTING_CONTROLS[timeOfDay] || LIGHTING_CONTROLS.day;
  const isDay = timeOfDay === "day";
  const activeBulbs = bulbs.filter((b) => (b.visible !== undefined ? b.visible : b.enabled));

  const sunPosition = sunVectorFromElevationAzimuth(profile.sunElevationDeg, profile.sunAzimuthDeg, 100);

  const [selectedMesh, setSelectedMesh] = useState<THREE.Group | null>(null);

  return (
    <>
      {/* ☀️ DAYTIME SKY / NIGHTTIME DARKNESS */}
      {isDay ? (
        <Sky
          distance={450000}
          sunPosition={sunPosition}
          turbidity={profile.skyTurbidity}
          rayleigh={profile.skyRayleigh}
          mieCoefficient={profile.skyMieCoefficient}
          mieDirectionalG={profile.skyMieDirectionalG}
        />
      ) : (
        <color attach="background" args={["#050912"]} />
      )}

      {/* 🌐 EXTERNAL HDRI ENVIRONMENT MAP */}
      <Environment
        preset={profile.envPreset as React.ComponentProps<typeof Environment>["preset"]}
        background={false}
        environmentIntensity={profile.envIntensity}
      />

      {/* 🌤️ HEMISPHERE FILL */}
      <hemisphereLight
        color={profile.hemisphereSkyColor}
        groundColor={profile.hemisphereGroundColor}
        intensity={profile.hemisphereIntensity}
      />

      {/* 💡 DYNAMIC USER LIGHTBULBS & SPOTLIGHTS */}
      {activeBulbs.map((bulb) => {
        const isSelected = bulb.id === selectedBulbId;

        return (
          <group
            key={bulb.id}
            ref={isSelected ? (node: THREE.Group | null) => setSelectedMesh(node) : undefined}
            position={bulb.position}
          >
            {/* 3D Visual Glowing Bulb Sphere Marker */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectBulb?.(bulb.id);
              }}
            >
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial color={bulb.color} />
            </mesh>

            {bulb.type === "spot" ? (
              <spotLight
                position={[0, 0, 0]}
                rotation={bulb.rotation}
                intensity={bulb.intensity * 2}
                color={bulb.color}
                angle={Math.PI / 3}
                penumbra={0.5}
                distance={bulb.distance || 15}
                castShadow
              />
            ) : (
              <pointLight
                position={[0, 0, 0]}
                intensity={bulb.intensity * 2}
                color={bulb.color}
                distance={bulb.distance || 15}
                decay={1.1}
                castShadow
              />
            )}
          </group>
        );
      })}

      {/* 🎯 3D LEVA / TRANSFORM GIZMO FOR SELECTED BULB */}
      {selectedBulbId && selectedMesh && (
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
