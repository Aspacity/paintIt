"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MasterPaintSplashRippleProps {
  position: THREE.Vector3;
  normal?: THREE.Vector3;
  wallKey?: string;
  color: string;
  onAnimationComplete?: () => void;
}

export default function MasterPaintSplashRipple({
  position,
  normal,
  wallKey,
  color,
  onAnimationComplete,
}: MasterPaintSplashRippleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringMeshRef = useRef<THREE.Mesh>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const dropletsGroupRef = useRef<THREE.Group>(null);
  const progress = useRef(0);

  // Align splash group flush with wall surface face based on wallKey or normal vector
  useEffect(() => {
    if (!groupRef.current) return;

    if (normal && (normal.x !== 0 || normal.y !== 0 || normal.z !== 0)) {
      const targetPos = position.clone().add(normal);
      groupRef.current.lookAt(targetPos);
    } else if (wallKey) {
      const key = wallKey.toLowerCase();
      if (key.includes("left")) {
        groupRef.current.rotation.set(0, Math.PI / 2, 0);
      } else if (key.includes("right")) {
        groupRef.current.rotation.set(0, -Math.PI / 2, 0);
      } else if (key.includes("back")) {
        groupRef.current.rotation.set(0, 0, 0);
      } else if (key.includes("front")) {
        groupRef.current.rotation.set(0, Math.PI, 0);
      } else if (key.includes("ceiling") || key.includes("roof")) {
        groupRef.current.rotation.set(Math.PI / 2, 0, 0);
      }
    }
  }, [position, normal, wallKey]);

  // Generate 10 organic directional paint droplet vectors
  const droplets = useMemo(() => {
    const arr: { angle: number; speed: number; radius: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const pseudoRand1 = ((i * 17 + 7) % 23) / 23;
      const pseudoRand2 = ((i * 31 + 13) % 29) / 29;
      const pseudoRand3 = ((i * 13 + 3) % 19) / 19;
      arr.push({
        angle: (i * Math.PI) / 5 + (pseudoRand1 * 0.2 - 0.1),
        speed: 0.22 + pseudoRand2 * 0.18,
        radius: 0.02 + pseudoRand3 * 0.02,
      });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !ringMeshRef.current || !coreMeshRef.current || !dropletsGroupRef.current) return;

    // Smooth fluid animation curve (~0.65s duration)
    progress.current += delta * 1.5;
    const p = Math.min(progress.current, 1);
    const eased = Math.sin(p * (Math.PI / 2)); // Smooth ease-out

    // Scale main group outward across wall face
    const scale = 0.2 + eased * 1.25;
    groupRef.current.scale.set(scale, scale, scale);

    // Fade outer shockwave ring smoothly
    const ringMat = ringMeshRef.current.material as THREE.MeshBasicMaterial;
    ringMat.opacity = Math.max(0, (1.0 - p) * 0.9);

    // Fade center paint core
    const coreMat = coreMeshRef.current.material as THREE.MeshBasicMaterial;
    coreMat.opacity = Math.max(0, (1.0 - p) * 0.8);

    // Animate outer paint droplets spreading outward along wall surface
    dropletsGroupRef.current.children.forEach((child, index) => {
      const drop = droplets[index];
      if (drop && child instanceof THREE.Mesh) {
        const dist = eased * drop.speed;
        child.position.x = Math.cos(drop.angle) * dist;
        child.position.y = Math.sin(drop.angle) * dist;
        const mat = child.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, (1.0 - p) * 0.85);
      }
    });

    if (progress.current >= 1.0) {
      onAnimationComplete?.();
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 🌊 1. Expanding Outer Paint Shockwave Ring resting flush on wall */}
      <mesh ref={ringMeshRef} position={[0, 0, 0.008]}>
        <ringGeometry args={[0.06, 0.26, 32]} />
        <meshBasicMaterial color={color} transparent opacity={1.0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* 🎨 2. Central Liquid Paint Patch Core */}
      <mesh ref={coreMeshRef} position={[0, 0, 0.01]}>
        <circleGeometry args={[0.14, 32]} />
        <meshBasicMaterial color={color} transparent opacity={1.0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* 💧 3. Directional Fluid Paint Droplets Flying Outward across wall face */}
      <group ref={dropletsGroupRef} position={[0, 0, 0.012]}>
        {droplets.map((drop, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <circleGeometry args={[drop.radius, 16]} />
            <meshBasicMaterial color={color} transparent opacity={1.0} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
