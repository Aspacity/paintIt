'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF, OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BulbState } from '@/components/canvas/LightControls';
import { DBCameraConfig } from '@/app/(public)/workspace/page';
import { generateWallNormalMap } from '@/utils/generateWallNormalMaps';
import { TEXTURE_PRESETS, getMeshCategory } from '@/utils/generateFloorTextures';

interface CanvasProps {
  modelUrl: string;
  roomColors: Record<string, string>;
  roomFinishes?: Record<string, string>;
  activeSurface: string;
  onSurfaceSelect: (meshName: string) => void;
  bulbs: BulbState[];
  cameraConfig: DBCameraConfig;
  roomTextures?: Record<string, string>;
  activeTextures?: Record<string, string>;
  materialSwaps?: Record<string, string>;
  onModelLoaded?: (materials: string[], meshes: { name: string; originalMaterial: string }[]) => void;
  isNightMode?: boolean;
}

type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
};

const WALL_MAPPING: Record<string, string> = {
  left: 'wallLeft',
  right: 'wallRight',
  back: 'wallBack',
  front: 'wallFront',
  roof: 'ceiling'
};

export default function WorkspaceCanvas({
  modelUrl,
  roomColors,
  roomFinishes,
  activeSurface,
  onSurfaceSelect,
  bulbs,
  cameraConfig,
  roomTextures: _roomTextures,
  activeTextures,
  materialSwaps,
  onModelLoaded,
  isNightMode = false
}: CanvasProps) {
  const { scene, materials } = useGLTF(modelUrl) as unknown as GLTFResult;
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const hasInnerWalls = !!clone.getObjectByName('wallLeft');
    if (hasInnerWalls) {
      clone.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (WALL_MAPPING[node.name]) {
            node.visible = false;
          }
        }
      });
    }
    return clone;
  }, [scene]);

  const hasNotifiedRef = useRef<boolean>(false);

  // Extract all meshes and materials to notify parent component & configure Blender lights
  useEffect(() => {
    if (scene && materials && onModelLoaded && !hasNotifiedRef.current) {
      const allMaterialSet = new Set<string>(Object.keys(materials));
      const meshList: { name: string; originalMaterial: string }[] = [];

      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const matName = node.material && (node.material as THREE.Material).name;
          if (matName) allMaterialSet.add(matName);
          meshList.push({
            name: node.name,
            originalMaterial: matName || 'default'
          });
        }

        if (node instanceof THREE.Light) {
          node.castShadow = true;
          if (node.intensity > 0 && node.intensity < 5.0) {
            node.intensity = node.intensity * 10;
          }
        }
      });

      const materialNames = Array.from(allMaterialSet);
      onModelLoaded(materialNames, meshList);
      hasNotifiedRef.current = true;
    }
  }, [scene, materials, onModelLoaded]);

  const wallNormalMap = useMemo(() => generateWallNormalMap(512, 512), []);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const initialCamSet = useRef<boolean>(false);

  const activeBulbs = useMemo(() => {
    return bulbs.filter((b) => (b.visible !== undefined ? b.visible : b.enabled));
  }, [bulbs]);

  useEffect(() => {
    if (controlsRef.current && cameraConfig && !initialCamSet.current) {
      if (cameraConfig.target) {
        controlsRef.current.target.set(...cameraConfig.target);
      }
      if (cameraConfig.position) {
        controlsRef.current.object.position.set(...cameraConfig.position);
      }
      controlsRef.current.update();
      initialCamSet.current = true;
    }
  }, [cameraConfig]);

  useFrame(() => {
    if (!controlsRef.current) return;

    let targetX = cameraConfig.target ? cameraConfig.target[0] : -1.94;
    const targetY = cameraConfig.target ? cameraConfig.target[1] : 2.7;
    let targetZ = cameraConfig.target ? cameraConfig.target[2] : 0.05;

    if (activeSurface === 'wallLeft') {
      targetX = -2.5;
    } else if (activeSurface === 'wallRight') {
      targetX = -0.5;
    } else if (activeSurface === 'wallBack' || activeSurface === 'wallFront') {
      targetZ = -1.0;
    }

    controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, targetX, 0.08);
    controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, targetY, 0.08);
    controlsRef.current.target.z = THREE.MathUtils.lerp(controlsRef.current.target.z, targetZ, 0.08);

    controlsRef.current.update();
  });

  // ⚡ DYNAMIC PAINT & FINISH MATERIAL TRAVERSAL LOOP
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) {
        const meshName = node.name;
        if (!node.visible) return;

        node.receiveShadow = true;
        node.castShadow = true;

        const targetKey = WALL_MAPPING[meshName] || meshName;
        const category = getMeshCategory(meshName);
        
        const activeTextureId = activeTextures?.[meshName] || activeTextures?.[category];
        const swapMaterialName = materialSwaps?.[meshName];

        if (activeTextureId && activeTextureId !== "original") {
          const preset = TEXTURE_PRESETS.find((p) => p.id === activeTextureId);
          if (preset) {
            const mat = new THREE.MeshStandardMaterial({
              map: preset.generateTexture(),
              roughness: preset.roughness,
              metalness: preset.metalness,
              side: THREE.DoubleSide,
            });
            if (preset.clearcoat) (mat as unknown as { clearcoat: number }).clearcoat = preset.clearcoat;
            node.material = mat;
            node.material.needsUpdate = true;
          }
        } else if (swapMaterialName && materials[swapMaterialName]) {
          node.material = materials[swapMaterialName].clone();
          node.material.side = THREE.DoubleSide;
          node.material.needsUpdate = true;
        } else {
          const activeColor = roomColors[meshName] || roomColors[targetKey];
          const isWallSurface = category === 'WALL';

          if (activeColor && node.material instanceof THREE.MeshStandardMaterial) {
            node.material = node.material.clone();
            node.material.side = THREE.DoubleSide;
            node.material.color.set(activeColor);

            if (isWallSurface || meshName.startsWith('wall')) {
              // 🎨 DYNAMIC PAINT FINISH ROUGHNESS & REFLECTIVITY MAPPING
              const finishType = (roomFinishes?.[meshName] || roomFinishes?.[targetKey] || "EMULSION").toUpperCase();

              let roughness = 0.85;
              let metalness = 0.0;
              let bumpScale = 0.015;

              if (finishType === "SATIN" || finishType === "SILK") {
                roughness = 0.35;
                metalness = 0.04;
                bumpScale = 0.008;
              } else if (finishType === "GLOSS") {
                roughness = 0.15;
                metalness = 0.12;
                bumpScale = 0.003;
              } else if (finishType === "EGGSHELL") {
                roughness = 0.55;
                metalness = 0.02;
                bumpScale = 0.012;
              } else if (finishType === "TEXTURED") {
                roughness = 0.95;
                metalness = 0.0;
                bumpScale = 0.035;
              }

              node.material.bumpMap = wallNormalMap;
              node.material.bumpScale = bumpScale;
              node.material.roughness = roughness;
              node.material.metalness = metalness;

              node.material.polygonOffset = true;
              node.material.polygonOffsetFactor = -1;
              node.material.polygonOffsetUnits = -1;
            }
            node.material.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene, roomColors, roomFinishes, wallNormalMap, activeTextures, materialSwaps, materials]);

  return (
    <>
      <color attach="background" args={[isNightMode ? "#040406" : "#d1d5db"]} />

      <ambientLight
        intensity={isNightMode ? 0.02 : 0.55}
        color={isNightMode ? "#0a0f1d" : "#ffffff"}
      />

      {!isNightMode && (
        <directionalLight
          position={[4, 8, 4]}
          intensity={0.85}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
      )}

      {activeBulbs.map((bulb) => (
        <group key={bulb.id} position={bulb.position}>
          <pointLight
            intensity={bulb.intensity}
            color={bulb.color}
            distance={bulb.distance || 15}
            decay={1.2}
            castShadow={false}
          />
        </group>
      ))}

      <primitive
        object={clonedScene}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.object instanceof THREE.Mesh) {
            const rawName = e.object.name || e.object.uuid;
            const targetName = WALL_MAPPING[rawName] || rawName;
            onSurfaceSelect(targetName);
          }
        }}
      />

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.1}
        maxDistance={1.8}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}