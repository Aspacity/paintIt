// // components/studio/PaintItCanvas.tsx
// "use client";

// import React, { useState } from "react";

// export interface ColorSwatch {
//   name: string;
//   hex: string;
//   finish: "Satin" | "Silk Matte" | "Velvet Stucco" | "High Gloss";
//   priceModifier: string;
// }

// // ✅ FIX 1: Clearly defined interface parameters instead of using 'any'
// export interface SwatchActionMeta {
//   surface: "WALL_A" | "WALL_B" | "CEILING";
//   color: ColorSwatch;
// }

// interface PaintItCanvasProps {
//   mode: "PUBLIC" | "CLIENT" | "PAINTER";
//   onActionTrigger?: (actionType: string, meta: SwatchActionMeta | Record<string, unknown>) => void;
// }

// export default function PaintItCanvas({ mode, onActionTrigger }: PaintItCanvasProps) {
//   // 🎨 EXPANDED LUXURY COLOR SPECTRUM
//   const luxuryColors: ColorSwatch[] = [
//     { name: "Emerald Royale", hex: "#10b981", finish: "Velvet Stucco", priceModifier: "Premium" },
//     { name: "Obsidian Core", hex: "#171717", finish: "Silk Matte", priceModifier: "Standard" },
//     { name: "Akoko Clay", hex: "#b45309", finish: "Velvet Stucco", priceModifier: "Premium" },
//     { name: "Ibadan Slate", hex: "#4b5563", finish: "Satin", priceModifier: "Standard" },
//     { name: "SaaS Mint", hex: "#a7f3d0", finish: "High Gloss", priceModifier: "Premium" },
//     { name: "Champagne Silk", hex: "#fef3c7", finish: "Satin", priceModifier: "Standard" },
//     { name: "Nordic Frost", hex: "#e0f2fe", finish: "Silk Matte", priceModifier: "Standard" },
//     { name: "Crimson Accent", hex: "#991b1b", finish: "High Gloss", priceModifier: "Premium" },
//   ];

//   // 📐 INTERACTIVE MESH SURFACES SELECTOR
//   const [activeSurface, setActiveSurface] = useState<"WALL_A" | "WALL_B" | "CEILING">("WALL_A");

//   // SURFACE COLOR assignment states
//   const [surfaceColors, setSurfaceColors] = useState({
//     WALL_A: luxuryColors[0], // Emerald Royale
//     WALL_B: luxuryColors[3], // Ibadan Slate
//     CEILING: luxuryColors[5], // Champagne Silk
//   });

//   const [isDaylight, setIsDaylight] = useState(true);
//   const [showConfigPanel, setShowConfigPanel] = useState(true);

//   const applyColorToActiveSurface = (color: ColorSwatch) => {
//     setSurfaceColors((prev) => ({ ...prev, [activeSurface]: color }));
//     if (onActionTrigger) {
//       onActionTrigger("SWATCH_CHANGE", { surface: activeSurface, color });
//     }
//   };

//   return (
//     <div className="w-full h-full relative bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">

//       {/* 🏙️ THE 3D VIEWPORT LAYER */}
//       <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-4 transition-colors duration-700 select-none overflow-hidden"
//         style={{ backgroundColor: isDaylight ? "#0b0f17" : "#05070a" }}>

//         {/* Glow Ambient Lights */}
//         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700"
//           style={{ backgroundColor: `${surfaceColors[activeSurface].hex}15` }} />

//         {/* 🏢 THE THREE-WALL WIREFRAME PERSPECTIVE SCENE */}
//         <div className="relative w-full max-w-sm aspect-square sm:max-w-md md:max-w-xl flex items-center justify-center scale-90 sm:scale-100 transition-transform duration-300">

//           {/* CEILING LAYER */}
//           <div
//             onClick={() => setActiveSurface("CEILING")}
//             style={{ backgroundColor: surfaceColors.CEILING.hex }}
//             className={`absolute top-0 w-[80%] h-[25%] rounded-t-xl border transition-all duration-500 cursor-pointer flex flex-col items-center justify-center transform -skew-x-12 ${activeSurface === "CEILING" ? "border-emerald-400 shadow-lg scale-[102%] z-20" : "border-neutral-800/40 opacity-70 z-10"
//               }`}
//           >
//             <span className="text-[9px] font-mono font-black uppercase text-black bg-white/85 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-md">
//               Ceiling [{surfaceColors.CEILING.finish}]
//             </span>
//           </div>

//           {/* LEFT INTERIOR WALL (WALL A) */}
//           <div
//             onClick={() => setActiveSurface("WALL_A")}
//             style={{ backgroundColor: surfaceColors.WALL_A.hex }}
//             className={`absolute left-0 bottom-0 w-[48%] h-[72%] rounded-bl-2xl border transition-all duration-500 cursor-pointer flex flex-col items-center justify-center ${activeSurface === "WALL_A" ? "border-emerald-400 shadow-2xl scale-[102%] z-20" : "border-neutral-800/40 opacity-80 z-10"
//               }`}
//           >
//             <span className="text-[9px] font-mono font-black uppercase text-black bg-white/85 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-md text-center max-w-[85%] truncate">
//               {surfaceColors.WALL_A.name}
//             </span>
//           </div>

//           {/* RIGHT INTERIOR WALL (WALL B) */}
//           <div
//             onClick={() => setActiveSurface("WALL_B")}
//             style={{ backgroundColor: surfaceColors.WALL_B.hex }}
//             className={`absolute right-0 bottom-0 w-[48%] h-[72%] rounded-br-2xl border transition-all duration-500 cursor-pointer flex flex-col items-center justify-center ${activeSurface === "WALL_B" ? "border-emerald-400 shadow-2xl scale-[102%] z-20" : "border-neutral-800/40 opacity-80 z-10"
//               }`}
//           >
//             <span className="text-[9px] font-mono font-black uppercase text-black bg-white/85 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-md text-center max-w-[85%] truncate">
//               {surfaceColors.WALL_B.name}
//             </span>
//           </div>

//         </div>

//         {/* Floating Controls Overlay */}
//         <div className="absolute top-4 right-4 z-30 flex items-center gap-2 select-none">
//           <button
//             type="button"
//             onClick={() => setIsDaylight(!isDaylight)}
//             className="p-2.5 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs transition-colors shadow-xl"
//           >
//             {isDaylight ? "☀️ Studio Day" : "🌙 Ambient Night"}
//           </button>
//           <button
//             type="button"
//             onClick={() => setShowConfigPanel(!showConfigPanel)}
//             className="px-3 py-2.5 bg-neutral-100 hover:bg-white text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-xl"
//           >
//             {showConfigPanel ? "Hide Deck ✕" : "Open Deck ☰"}
//           </button>
//         </div>
//       </div>

//       {/* 🎛️ FLOATING CONFIGURATION CONTROL PANEL DECK */}
//       <div className={`w-full z-10 transition-all duration-300 select-none ${showConfigPanel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
//         }`}>
//         <div className="mx-auto max-w-xl m-4 p-4 sm:p-5 bg-neutral-950/85 backdrop-blur-xl border border-neutral-900 rounded-2xl space-y-4 shadow-2xl">

//           {/* Surface Toggle Bar Layer */}
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
//             <div>
//               <span className="text-[8px] font-mono font-black text-neutral-600 uppercase tracking-widest block">Mesh Selection Target</span>
//               <h4 className="text-xs font-black uppercase text-neutral-200 tracking-wide mt-0.5">
//                 Active Surface: <span className="text-emerald-400 font-mono">{activeSurface}</span>
//               </h4>
//             </div>

//             <div className="flex bg-neutral-900/60 p-0.5 rounded-lg border border-neutral-850 self-end sm:self-auto w-full sm:w-auto">
//               {(["WALL_A", "WALL_B", "CEILING"] as const).map((surf) => (
//                 <button
//                   key={surf}
//                   type="button"
//                   onClick={() => setActiveSurface(surf)}
//                   className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all w-full sm:w-auto text-center ${activeSurface === surf
//                       ? "bg-neutral-950 text-emerald-400 border border-neutral-800"
//                       : "text-neutral-500 hover:text-neutral-400"
//                     }`}
//                 >
//                   {surf === "CEILING" ? "Ceiling" : surf === "WALL_A" ? "Wall A" : "Wall B"}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Color Grid Options Scroller */}
//           <div className="space-y-1.5">
//             <span className="text-[8px] font-mono font-black text-neutral-600 uppercase tracking-widest block">Luxury Swatch Swapper</span>
//             <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 overflow-y-visible max-h-24 sm:max-h-none p-0.5">
//               {luxuryColors.map((color, index) => (
//                 <button
//                   key={index}
//                   type="button"
//                   onClick={() => applyColorToActiveSurface(color)}
//                   className={`aspect-square rounded-xl relative border transition-all duration-150 transform active:scale-95 flex items-center justify-center shadow-lg group/btn ${surfaceColors[activeSurface].name === color.name
//                       ? "border-emerald-400 ring-2 ring-emerald-500/20 scale-105"
//                       : "border-neutral-850 hover:border-neutral-700"
//                     }`}
//                   style={{ backgroundColor: color.hex }}
//                   title={`${color.name} - ${color.finish}`}
//                 >
//                   <span className="absolute bottom-full mb-2 bg-neutral-950 border border-neutral-800 text-[9px] font-black uppercase tracking-wider text-neutral-200 px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl z-50">
//                     {color.name} ({color.finish})
//                   </span>
//                   {surfaceColors[activeSurface].name === color.name && (
//                     <span className="text-[10px] text-neutral-950 font-black bg-white w-4 h-4 rounded-full flex items-center justify-center shadow-md">✓</span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Context Dynamic Footer Handle */}
//           <div className="pt-3 border-t border-neutral-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
//             <div className="text-left w-full sm:w-auto">
//               <span className="text-[9px] font-medium text-neutral-500 block">Active Specification Profile:</span>
//               <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide">
//                 🎨 {surfaceColors[activeSurface].name} — <span className="text-emerald-400 font-mono text-[10px]">{surfaceColors[activeSurface].finish} ({surfaceColors[activeSurface].priceModifier})</span>
//               </span>
//             </div>

//             {mode === "PUBLIC" && (
//               <button
//                 type="button"
//                 onClick={() => onActionTrigger?.("UPSELL_CLICK", surfaceColors)}
//                 className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-[99%]"
//               >
//                 Save Scheme Structure ➔
//               </button>
//             )}

//             {mode === "CLIENT" && (
//               <button
//                 type="button"
//                 onClick={() => onActionTrigger?.("CLIENT_SAVE", surfaceColors)}
//                 className="w-full sm:w-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
//               >
//                 Attach To Job Request Brief
//               </button>
//             )}

//             {mode === "PAINTER" && (
//               <div className="text-[10px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-850 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider text-center w-full sm:w-auto select-none">
//                 ⚙️ Spec Inspector Module
//               </div>
//             )}
//           </div>

//         </div>
//       </div>

//     </div>
//   );
// }

// components/studio/PaintItCanvas.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export interface ColorSwatch {
  name: string;
  hex: string;
  finish: "Satin" | "Silk Matte" | "Velvet Stucco" | "High Gloss";
  priceModifier: string;
}

export interface SwatchActionMeta {
  surface: "WALL_A" | "WALL_B" | "CEILING";
  color: ColorSwatch;
}

interface PaintItCanvasProps {
  mode: "PUBLIC" | "CLIENT" | "PAINTER";
  onActionTrigger?: (actionType: string, meta: SwatchActionMeta | Record<string, unknown>) => void;
}

// 🎨 LUXURY COLOR INVENTORY DECK
const LUXURY_COLORS: ColorSwatch[] = [
  { name: "Emerald Royale", hex: "#10b981", finish: "Velvet Stucco", priceModifier: "Premium" },
  { name: "Obsidian Core", hex: "#171717", finish: "Silk Matte", priceModifier: "Standard" },
  { name: "Akoko Clay", hex: "#b45309", finish: "Velvet Stucco", priceModifier: "Premium" },
  { name: "Ibadan Slate", hex: "#4b5563", finish: "Satin", priceModifier: "Standard" },
  { name: "SaaS Mint", hex: "#a7f3d0", finish: "High Gloss", priceModifier: "Premium" },
  { name: "Champagne Silk", hex: "#fef3c7", finish: "Satin", priceModifier: "Standard" },
  { name: "Nordic Frost", hex: "#e0f2fe", finish: "Silk Matte", priceModifier: "Standard" },
  { name: "Crimson Accent", hex: "#991b1b", finish: "High Gloss", priceModifier: "Premium" },
];

// 💡 HIGH-FIDELITY PBR LIGHTING PIPELINE
function SceneLighting({ isDaylight }: { isDaylight: boolean }) {
  return (
    <>
      {/* ☀️ Main Key Directional Sunlight */}
      <directionalLight
        position={isDaylight ? [5, 8, 5] : [2, 4, 2]}
        intensity={isDaylight ? 1.8 : 0.25}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* 🛋️ Soft Ground Contact Shadows */}
      <ContactShadows
        position={[0, -1.99, 0]}
        opacity={isDaylight ? 0.65 : 0.3}
        scale={15}
        blur={1.8}
        far={4.5}
      />

      {/* 🌐 IBL Environment Reflection Probes */}
      <Environment preset={isDaylight ? "apartment" : "night"}>
        <Lightformer
          form="rect"
          intensity={isDaylight ? 1.5 : 0.3}
          position={[0, 4, -4]}
          scale={[8, 4, 1]}
          color="#ffffff"
        />
      </Environment>

      {/* 💡 Ambient Fill Light */}
      <ambientLight intensity={isDaylight ? 0.45 : 0.15} />
    </>
  );
}

// 🏢 INTERACTIVE 3D ROOM MESHES
function InteractiveRoom({
  surfaceColors,
  activeSurface,
  onSelectSurface,
}: {
  surfaceColors: Record<"WALL_A" | "WALL_B" | "CEILING", ColorSwatch>;
  activeSurface: "WALL_A" | "WALL_B" | "CEILING";
  onSelectSurface: (surface: "WALL_A" | "WALL_B" | "CEILING") => void;
}) {
  // PBR Materials with Finish Roughness Adjustments
  const matWallA = useMemo(() => {
    const isGloss = surfaceColors.WALL_A.finish === "High Gloss";
    return new THREE.MeshStandardMaterial({
      color: surfaceColors.WALL_A.hex,
      roughness: isGloss ? 0.2 : 0.8,
      metalness: 0.05,
    });
  }, [surfaceColors.WALL_A]);

  const matWallB = useMemo(() => {
    const isGloss = surfaceColors.WALL_B.finish === "High Gloss";
    return new THREE.MeshStandardMaterial({
      color: surfaceColors.WALL_B.hex,
      roughness: isGloss ? 0.2 : 0.8,
      metalness: 0.05,
    });
  }, [surfaceColors.WALL_B]);

  const matCeiling = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: surfaceColors.CEILING.hex,
      roughness: 0.9,
      metalness: 0.0,
    });
  }, [surfaceColors.CEILING]);

  const matFloor = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#1c1917",
      roughness: 0.4,
      metalness: 0.1,
    });
  }, []);

  return (
    <group position={[0, -0.5, 0]}>
      {/* 🧱 LEFT WALL (WALL A) */}
      <mesh
        position={[-2.5, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        material={matWallA}
        onClick={(e) => {
          e.stopPropagation();
          onSelectSurface("WALL_A");
        }}
        receiveShadow
      >
        <planeGeometry args={[5, 4]} />
      </mesh>

      {/* 🧱 BACK WALL (WALL B) */}
      <mesh
        position={[0, 0, -2.5]}
        material={matWallB}
        onClick={(e) => {
          e.stopPropagation();
          onSelectSurface("WALL_B");
        }}
        receiveShadow
      >
        <planeGeometry args={[5, 4]} />
      </mesh>

      {/* 🏠 CEILING */}
      <mesh
        position={[0, 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={matCeiling}
        onClick={(e) => {
          e.stopPropagation();
          onSelectSurface("CEILING");
        }}
      >
        <planeGeometry args={[5, 5]} />
      </mesh>

      {/* 🪵 FLOOR */}
      <mesh
        position={[0, -2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={matFloor}
        receiveShadow
      >
        <planeGeometry args={[5, 5]} />
      </mesh>

      {/* 🎯 SELECTION HIGHLIGHT INDICATOR */}
      {activeSurface === "WALL_A" && (
        <mesh position={[-2.48, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.95, 3.95]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      {activeSurface === "WALL_B" && (
        <mesh position={[0, 0, -2.48]}>
          <planeGeometry args={[4.95, 3.95]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      {activeSurface === "CEILING" && (
        <mesh position={[0, 1.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.95, 4.95]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

export default function PaintItCanvas({ mode, onActionTrigger }: PaintItCanvasProps) {
  const [activeSurface, setActiveSurface] = useState<"WALL_A" | "WALL_B" | "CEILING">("WALL_A");

  const [surfaceColors, setSurfaceColors] = useState<Record<"WALL_A" | "WALL_B" | "CEILING", ColorSwatch>>({
    WALL_A: LUXURY_COLORS[0], // Emerald Royale
    WALL_B: LUXURY_COLORS[3], // Ibadan Slate
    CEILING: LUXURY_COLORS[5], // Champagne Silk
  });

  const [isDaylight, setIsDaylight] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(true);

  const applyColorToActiveSurface = (color: ColorSwatch) => {
    setSurfaceColors((prev) => ({ ...prev, [activeSurface]: color }));
    if (onActionTrigger) {
      onActionTrigger("SWATCH_CHANGE", { surface: activeSurface, color });
    }
  };

  return (
    <div className="w-full h-full relative bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">

      {/* 🏙️ THE REAL-TIME 3D WEBGL VIEWPORT */}
      <div className="absolute inset-0 z-0 select-none">
        <Canvas
          shadows
          gl={{
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: isDaylight ? 1.1 : 0.6,
            outputColorSpace: THREE.SRGBColorSpace,
            antialias: true,
          }}
          camera={{ position: [2.5, 0.5, 3.8], fov: 50 }}
        >
          <SceneLighting isDaylight={isDaylight} />

          <InteractiveRoom
            surfaceColors={surfaceColors}
            activeSurface={activeSurface}
            onSelectSurface={setActiveSurface}
          />

          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={6.0}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>

        {/* Floating Day/Night & Deck Toggle Controls */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 select-none">
          <button
            type="button"
            onClick={() => setIsDaylight(!isDaylight)}
            className="p-2.5 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs transition-colors shadow-xl text-neutral-200 font-medium"
          >
            {isDaylight ? "☀️ Studio Day" : "🌙 Ambient Night"}
          </button>
          <button
            type="button"
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className="px-3 py-2.5 bg-neutral-100 hover:bg-white text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-xl"
          >
            {showConfigPanel ? "Hide Deck ✕" : "Open Deck ☰"}
          </button>
        </div>
      </div>

      {/* 🎛️ FLOATING CONFIGURATION CONTROL PANEL DECK */}
      <div
        className={`w-full z-10 transition-all duration-300 select-none mt-auto ${showConfigPanel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        <div className="mx-auto max-w-xl m-4 p-4 sm:p-5 bg-neutral-950/85 backdrop-blur-xl border border-neutral-900 rounded-2xl space-y-4 shadow-2xl">

          {/* Surface Toggle Bar Layer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
            <div>
              <span className="text-[8px] font-mono font-black text-neutral-600 uppercase tracking-widest block">
                Mesh Selection Target
              </span>
              <h4 className="text-xs font-black uppercase text-neutral-200 tracking-wide mt-0.5">
                Active Surface: <span className="text-emerald-400 font-mono">{activeSurface}</span>
              </h4>
            </div>

            <div className="flex bg-neutral-900/60 p-0.5 rounded-lg border border-neutral-850 self-end sm:self-auto w-full sm:w-auto">
              {(["WALL_A", "WALL_B", "CEILING"] as const).map((surf) => (
                <button
                  key={surf}
                  type="button"
                  onClick={() => setActiveSurface(surf)}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all w-full sm:w-auto text-center ${activeSurface === surf
                      ? "bg-neutral-950 text-emerald-400 border border-neutral-800"
                      : "text-neutral-500 hover:text-neutral-400"
                    }`}
                >
                  {surf === "CEILING" ? "Ceiling" : surf === "WALL_A" ? "Wall A" : "Wall B"}
                </button>
              ))}
            </div>
          </div>

          {/* Color Grid Options Scroller */}
          <div className="space-y-1.5">
            <span className="text-[8px] font-mono font-black text-neutral-600 uppercase tracking-widest block">
              Luxury Swatch Swapper
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 overflow-y-visible max-h-24 sm:max-h-none p-0.5">
              {LUXURY_COLORS.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyColorToActiveSurface(color)}
                  className={`aspect-square rounded-xl relative border transition-all duration-150 transform active:scale-95 flex items-center justify-center shadow-lg group/btn ${surfaceColors[activeSurface].name === color.name
                      ? "border-emerald-400 ring-2 ring-emerald-500/20 scale-105"
                      : "border-neutral-850 hover:border-neutral-700"
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name} - ${color.finish}`}
                >
                  <span className="absolute bottom-full mb-2 bg-neutral-950 border border-neutral-800 text-[9px] font-black uppercase tracking-wider text-neutral-200 px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl z-50">
                    {color.name} ({color.finish})
                  </span>
                  {surfaceColors[activeSurface].name === color.name && (
                    <span className="text-[10px] text-neutral-950 font-black bg-white w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Context Dynamic Footer Handle */}
          <div className="pt-3 border-t border-neutral-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left w-full sm:w-auto">
              <span className="text-[9px] font-medium text-neutral-500 block">
                Active Specification Profile:
              </span>
              <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide">
                🎨 {surfaceColors[activeSurface].name} —{" "}
                <span className="text-emerald-400 font-mono text-[10px]">
                  {surfaceColors[activeSurface].finish} ({surfaceColors[activeSurface].priceModifier})
                </span>
              </span>
            </div>

            {mode === "PUBLIC" && (
              <button
                type="button"
                onClick={() => onActionTrigger?.("UPSELL_CLICK", surfaceColors)}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-[99%]"
              >
                Save Scheme Structure ➔
              </button>
            )}

            {mode === "CLIENT" && (
              <button
                type="button"
                onClick={() => onActionTrigger?.("CLIENT_SAVE", surfaceColors)}
                className="w-full sm:w-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
              >
                Attach To Job Request Brief
              </button>
            )}

            {mode === "PAINTER" && (
              <div className="text-[10px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-850 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider text-center w-full sm:w-auto select-none">
                ⚙️ Spec Inspector Module
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}