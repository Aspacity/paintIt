// 'use client';
// import { Environment } from '@react-three/drei';

// export default function SceneLighting() {
//   return (
//     <>
//       {/* Explicitly point to your local public folder asset */}
//       {/* Force it to use the standard unpkg repository directly if the default basement studio CDN is down */}
//       <Environment
//         preset="apartment"
//         path="https://unpkg.com/@react-three/drei@latest/assets/hdri/"
//       />
//       <ambientLight intensity={0.6} />

//       <directionalLight
//         castShadow
//         position={[5, 6, 4]}
//         intensity={2.0}
//         shadow-mapSize={[2048, 2048]}
//         shadow-bias={-0.0001}
//       />
//     </>
//   );
// }

// components/canvas/SceneLighting.tsx
"use client";

import React from "react";
import { Environment, ContactShadows, Lightformer } from "@react-three/drei";

interface LightingProps {
  timeOfDay?: "day" | "sunset" | "night";
  intensity?: number;
}

export const SceneLighting: React.FC<LightingProps> = ({
  timeOfDay = "day",
  intensity = 1.0,
}) => {
  return (
    <>
      {/* ☀️ 1. Main Sun Directional Light (Soft Key Light) */}
      <directionalLight
        position={timeOfDay === "sunset" ? [8, 4, 5] : [5, 10, 5]}
        intensity={timeOfDay === "night" ? 0.1 : 1.8 * intensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-10, 10, 10, -10, 0.1, 50]}
        />
      </directionalLight>

      {/* 🛋️ 2. Soft Contact Shadows under Furniture & Baseboards */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.65}
        scale={20}
        blur={1.5}
        far={4.5}
      />

      {/* 🌐 3. Soft Ambient Environment Fill (IBL Probe) */}
      <Environment preset={timeOfDay === "night" ? "night" : "apartment"}>
        {/* Custom Lightformers for soft window reflections on walls/floors */}
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[0, 5, -5]}
          scale={[10, 5, 1]}
          color="#ffffff"
        />
      </Environment>

      {/* 💡 4. Soft Ceiling Bounce (Fill Light) */}
      <ambientLight intensity={timeOfDay === "night" ? 0.15 : 0.45 * intensity} />
    </>
  );
};