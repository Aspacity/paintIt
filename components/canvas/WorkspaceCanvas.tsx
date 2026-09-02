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
import { useGLTFWithFallback } from '@/utils/modelFallbackResolver';

interface CanvasProps {
  modelUrl: string;
  roomColors: Record<string, string>;
  roomFinishes?: Record<string, string>;
  activeSurface: string;
  onSurfaceSelect: (meshName: string) => void;
  bulbs: BulbState[];
  cameraConfig: DBCameraConfig;
  onSaveCameraConfig?: (cameraData: DBCameraConfig) => void;
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
  onSaveCameraConfig,
  roomTextures: _roomTextures,
  activeTextures,
  materialSwaps,
  onModelLoaded,
  isNightMode = false
}: CanvasProps) {
  const { scene, materials = {} } = useGLTFWithFallback(modelUrl);
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

        const surfaceColor = roomColors[targetKey] || roomColors[meshName];
        const surfaceFinish = roomFinishes?.[targetKey] || roomFinishes?.[meshName] || 'EMULSION';
        const customTexture = activeTextures?.[targetKey] || activeTextures?.[meshName];
        const swapMaterialName = materialSwaps?.[meshName];

        if (swapMaterialName && materials[swapMaterialName]) {
          node.material = materials[swapMaterialName].clone();
          (node.material as THREE.Material).side = THREE.DoubleSide;
          node.material.needsUpdate = true;
          return;
        }

        if (surfaceColor || surfaceFinish || customTexture || category) {
          let mat = node.material as THREE.MeshStandardMaterial;

          if (!mat || !mat.isMeshStandardMaterial) {
            mat = new THREE.MeshStandardMaterial({
              name: `mat_${meshName}`,
              roughness: 0.5,
              metalness: 0.0,
              side: THREE.DoubleSide,
            });
            node.material = mat;
          } else {
            mat = mat.clone();
            mat.side = THREE.DoubleSide;
            node.material = mat;
          }

          if (surfaceColor) {
            mat.color.set(surfaceColor);
          }

          if (customTexture) {
            const preset = TEXTURE_PRESETS.find((p) => p.id === customTexture);
            if (preset) {
              mat.map = preset.generateTexture();
              mat.roughness = preset.roughness;
              mat.metalness = preset.metalness;
              mat.needsUpdate = true;
            }
          }

          switch (surfaceFinish.toUpperCase()) {
            case 'GLOSS':
            case 'HIGH_GLOSS':
              mat.roughness = 0.15;
              mat.metalness = 0.12;
              break;
            case 'SATIN':
            case 'EGGSHELL':
            case 'SILK':
              mat.roughness = 0.35;
              mat.metalness = 0.04;
              break;
            case 'MATTE':
            case 'EMULSION':
            default:
              mat.roughness = 0.75;
              mat.metalness = 0.0;
              break;
          }

          mat.needsUpdate = true;
        }
      }
    });
  }, [clonedScene, roomColors, roomFinishes, activeTextures, materialSwaps, materials]);

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
        enablePan={true}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.1}
        maxDistance={50.0}
        minPolarAngle={0.01}
        maxPolarAngle={Math.PI - 0.01}
        onChange={() => {
          if (!controlsRef.current) return;
          const target = controlsRef.current.target;
          const pos = controlsRef.current.object.position;
          onSaveCameraConfig?.({
            position: [
              parseFloat(pos.x.toFixed(3)),
              parseFloat(pos.y.toFixed(3)),
              parseFloat(pos.z.toFixed(3)),
            ],
            target: [
              parseFloat(target.x.toFixed(3)),
              parseFloat(target.y.toFixed(3)),
              parseFloat(target.z.toFixed(3)),
            ],
          });
        }}
      />
    </>
  );
}