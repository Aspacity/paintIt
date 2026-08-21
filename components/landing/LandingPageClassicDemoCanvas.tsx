"use client";

import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { WallFinishType } from "@/components/canvas/PaintItMasterCanvas";

interface PaintColorItem {
  name: string;
  code: string;
  hex: string;
}

const CLASSIC_SWATCHES: PaintColorItem[] = [
  { name: "Desert Sand", code: "PT-101", hex: "#C4B199" },
  { name: "Soft Bone", code: "PT-102", hex: "#F2F1E9" },
  { name: "Sage Green", code: "PT-103", hex: "#9BA498" },
  { name: "Charcoal", code: "PT-104", hex: "#383E42" },
  { name: "Terracotta", code: "PT-105", hex: "#B85B43" },
  { name: "Deep Navy", code: "PT-106", hex: "#2B3A4A" },
  { name: "Warm Cream", code: "PT-107", hex: "#E8DFD1" },
];

function ClassicDemoRoomMesh({
  activeColor,
  activeFinish,
  activeWallKey,
  onSelectWall,
}: {
  activeColor: string;
  activeFinish: WallFinishType;
  activeWallKey: string;
  onSelectWall: (wallKey: string) => void;
}) {
  const { scene } = useGLTF("/models/shells/spacious-lux.glb") as unknown as { scene: THREE.Group };
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const wallMaterialsMap = useMemo(() => ({}) as Record<string, THREE.MeshStandardMaterial>, []);

  useMemo(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const nameLower = child.name.toLowerCase();
        const isGlass = nameLower.includes("glass") || nameLower.includes("pane");
        const isCurtainOrFixture =
          nameLower.includes("curtain") ||
          nameLower.includes("door") ||
          nameLower.includes("lamp") ||
          nameLower.includes("strip") ||
          nameLower.includes("led") ||
          nameLower.includes("bulb") ||
          nameLower.includes("spot") ||
          nameLower.includes("light");

        if (isGlass) {
          child.castShadow = false;
          child.receiveShadow = false;
          if (child.material) {
            const mat = child.material as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = 0.05;
          }
          return;
        }

        if (isCurtainOrFixture) {
          child.castShadow = false;
          child.receiveShadow = true;
          return;
        }

        const isWall = nameLower.includes("wall") || nameLower.includes("back") || nameLower.includes("left") || nameLower.includes("right");
        const isCeiling = nameLower.includes("ceiling") || nameLower.includes("roof");

        if (isWall || isCeiling) {
          child.castShadow = true;
          child.receiveShadow = true;

          const wallKey = nameLower.includes("left")
            ? "wall_left"
            : nameLower.includes("right")
            ? "wall_right"
            : nameLower.includes("ceiling")
            ? "ceiling"
            : "wall_back";

          if (!wallMaterialsMap[wallKey]) {
            // eslint-disable-next-line react-hooks/immutability
            wallMaterialsMap[wallKey] = new THREE.MeshStandardMaterial({
              side: THREE.DoubleSide,
            });
          }

          const mat = wallMaterialsMap[wallKey];
          // eslint-disable-next-line react-hooks/immutability
          mat.map = null;

          if (wallKey === activeWallKey || (activeWallKey === "ALL" && isWall)) {
            mat.color.set(activeColor);
          } else if (!mat.color.getHexString()) {
            mat.color.set(isCeiling ? "#FFFFFF" : "#C4B199");
          }

          let roughness = 0.85;
          let metalness = 0.0;
          if (activeFinish === "SATIN") {
            roughness = 0.35;
            metalness = 0.04;
          } else if (activeFinish === "GLOSS") {
            roughness = 0.15;
            metalness = 0.12;
          }

          mat.roughness = roughness;
          mat.metalness = metalness;
          child.material = mat;
        }
      }
    });
  }, [clonedScene, activeColor, activeFinish, activeWallKey, wallMaterialsMap]);

  return (
    <primitive
      object={clonedScene}
      onClick={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
        e.stopPropagation();
        if (e.object instanceof THREE.Mesh) {
          const nameLower = e.object.name.toLowerCase();
          const key = nameLower.includes("left")
            ? "wall_left"
            : nameLower.includes("right")
            ? "wall_right"
            : nameLower.includes("ceiling")
            ? "ceiling"
            : "wall_back";
          onSelectWall(key);
        }
      }}
    />
  );
}

export default function LandingPageClassicDemoCanvas() {
  const [activeColor, setActiveColor] = useState<string>("#C4B199");
  const [activeFinish, setActiveFinish] = useState<WallFinishType>("EMULSION");
  const [activeWallKey, setActiveWallKey] = useState<string>("ALL");
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isLampOn, setIsLampOn] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  const selectedSwatch = CLASSIC_SWATCHES.find((s) => s.hex === activeColor) || CLASSIC_SWATCHES[0];

  return (
    <div className="w-full h-full relative flex flex-col bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-neutral-850 select-none">
      {/* 3D RENDER CANVAS VIEWPORT WITH PHOTOREALISTIC LIGHTING */}
      <div className="flex-1 relative bg-neutral-950 overflow-hidden">
        <Canvas
          shadows
          camera={{ position: [0, 1.6, 4.2], fov: 52 }}
          className="cursor-grab active:cursor-grabbing"
        >
          {/* ☀️ SUNLIGHT & NIGHT SKY AMBIENCE */}
          <ambientLight intensity={isNightMode ? 0.35 : 1.6} color={isNightMode ? "#6b8abf" : "#ffffff"} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={isNightMode ? 0.4 : 2.8}
            color={isNightMode ? "#84a5e3" : "#fff7ec"}
            castShadow
            shadow-mapSize={1024}
          />
          <hemisphereLight args={[isNightMode ? "#1a2536" : "#ffffff", "#223344", isNightMode ? 0.2 : 0.6]} />

          {/* 💡 INTERIOR LAMP FIXTURE */}
          {isLampOn && (
            <pointLight position={[0, 2.4, 0]} intensity={3.5} color="#fffaed" distance={10} castShadow />
          )}

          <ClassicDemoRoomMesh
            activeColor={activeColor}
            activeFinish={activeFinish}
            activeWallKey={activeWallKey}
            onSelectWall={(wallKey) => {
              setActiveWallKey(wallKey);
            }}
          />

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            screenSpacePanning={true}
            autoRotate={isAutoRotating}
            autoRotateSpeed={0.8}
            minDistance={1.5}
            maxDistance={8.0}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.1}
            onStart={() => setIsAutoRotating(false)}
          />
        </Canvas>

        {/* 🚀 FLOATING TOP DEMO CONTROLS (DAY/NIGHT + LAMP ON/OFF TOGGLE ONLY) */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          {/* Active Swatch Badge */}
          <div className="pointer-events-auto flex items-center gap-2 bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-neutral-800 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
              {selectedSwatch.name} • {activeFinish}
            </span>
          </div>

          {/* Controls: Day/Night & Lamp ON/OFF Toggles ONLY */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-neutral-950/85 backdrop-blur-md p-1 rounded-2xl border border-neutral-800 shadow-xl">
            {/* Day / Night Toggle */}
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-xl border transition-all ${
                isNightMode
                  ? "bg-indigo-950 text-indigo-300 border-indigo-500/50"
                  : "bg-amber-950 text-amber-300 border-amber-500/50"
              }`}
              title="Toggle Day / Night Lighting"
            >
              {isNightMode ? "🌙 Night" : "☀️ Day"}
            </button>

            {/* Lamp ON / OFF Toggle */}
            <button
              onClick={() => setIsLampOn(!isLampOn)}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-xl border transition-all ${
                isLampOn
                  ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                  : "bg-neutral-900 text-neutral-500 border-neutral-800"
              }`}
              title="Toggle Interior Lamp ON / OFF"
            >
              {isLampOn ? "💡 Lamp: ON" : "💡 Lamp: OFF"}
            </button>

            {/* Pause Rotation */}
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="px-2.5 py-1 bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl transition-all"
            >
              {isAutoRotating ? "⏸ Pause" : "🔄 Rotate"}
            </button>
          </div>
        </div>

        {/* 📢 REGISTER CTA BENCHMARK BANNER */}
        <div className="absolute bottom-16 left-4 right-4 z-10 pointer-events-auto flex items-center justify-between bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 px-3.5 py-2 rounded-2xl shadow-2xl">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider truncate">
            ⚡ Full Studio Workspace: PBR Textures, Color Mixer & 3D Assembly
          </span>
          <Link
            href="/register"
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow transition-all shrink-0 active:scale-95"
          >
            Register for Free ➔
          </Link>
        </div>
      </div>

      {/* 🎨 BOTTOM PAINT & FINISH SELECTION ONLY */}
      <div className="bg-neutral-900/95 backdrop-blur-2xl border-t border-neutral-850 p-3 sm:p-4 z-20 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Paint Swatches Row */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest shrink-0 pr-1">
            PAINTS:
          </span>
          {CLASSIC_SWATCHES.map((swatch) => {
            const isSelected = activeColor === swatch.hex;
            return (
              <button
                key={swatch.hex}
                onClick={() => setActiveColor(swatch.hex)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all shrink-0 ${
                  isSelected
                    ? "bg-neutral-800 border-emerald-400 ring-2 ring-emerald-400/20 shadow-lg scale-105"
                    : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="text-[10px] font-bold text-neutral-200">{swatch.name}</span>
              </button>
            );
          })}
        </div>

        {/* Finish Selector Pills */}
        <div className="flex items-center gap-1 shrink-0 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          {(["EMULSION", "SATIN", "GLOSS"] as const).map((finish) => (
            <button
              key={finish}
              onClick={() => setActiveFinish(finish)}
              className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${
                activeFinish === finish
                  ? "bg-emerald-500 text-neutral-950 font-black shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {finish}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
