'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF, Sky, TransformControls, useHelper, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF, OrbitControls as OrbitControlsImpl, TransformControls as TransformControlsImpl } from 'three-stdlib';
import { DynamicLightInstance } from '@/types/index';
import { generateWallNormalMap } from '@/utils/generateWallNormalMaps';
import { PAINT_FINISH_PRESETS, PaintFinishId } from '@/config/paintFinishes';
import { TEXTURE_PRESETS, getMeshCategory } from '@/utils/generateFloorTextures';

interface GizmoProps {
  activeLight: DynamicLightInstance;
  mode: 'translate' | 'rotate' | 'scale';
  onTransformUpdate: (property: 'position' | 'rotation' | 'scale', value: [number, number, number]) => void;
}

export function AdminTransformGizmo({ activeLight, mode, onTransformUpdate }: GizmoProps) {
  const transformRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...activeLight.position);
      if (activeLight.rotation) groupRef.current.rotation.set(...activeLight.rotation);
      if (activeLight.scale) groupRef.current.scale.set(...activeLight.scale);
    }
  }, [activeLight.position, activeLight.rotation, activeLight.scale]);

  const handleObjectChange = () => {
    if (!groupRef.current) return;
    const obj = groupRef.current;
    if (mode === 'translate') {
      onTransformUpdate('position', [
        parseFloat(obj.position.x.toFixed(2)),
        parseFloat(obj.position.y.toFixed(2)),
        parseFloat(obj.position.z.toFixed(2))
      ]);
    } else if (mode === 'rotate') {
      onTransformUpdate('rotation', [
        parseFloat(obj.rotation.x.toFixed(2)),
        parseFloat(obj.rotation.y.toFixed(2)),
        parseFloat(obj.rotation.z.toFixed(2))
      ]);
    } else if (mode === 'scale') {
      onTransformUpdate('scale', [
        parseFloat(obj.scale.x.toFixed(2)),
        parseFloat(obj.scale.y.toFixed(2)),
        parseFloat(obj.scale.z.toFixed(2))
      ]);
    }
  };

  return (
    <>
      <group ref={groupRef} position={activeLight.position}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={activeLight.color || '#06b6d4'} emissive={activeLight.color || '#06b6d4'} emissiveIntensity={2.5} />
        </mesh>
      </group>
      {groupRef.current && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current}
          mode={mode}
          onObjectChange={handleObjectChange}
        />
      )}
    </>
  );
}

interface BaseLightingProps { isNight: boolean; showHelpers: boolean; }
export function PlaygroundLighting({ isNight, showHelpers }: BaseLightingProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  useHelper((showHelpers && sunRef ? sunRef : false) as React.RefObject<THREE.Object3D> | false, THREE.DirectionalLightHelper, 1, 'coral');

  return (
    <>
      <Sky distance={450000} sunPosition={isNight ? [0, -10, -10] : [8, 6, 5]} mieCoefficient={0.005} mieDirectionalG={0.07} rayleigh={isNight ? 0.3 : 1.8} turbidity={isNight ? 20 : 8} />
      {isNight ? (
        <>
          <ambientLight intensity={0.12} color="#0b0f19" />
          <hemisphereLight args={['#141a29', '#05050a', 0.2]} />
        </>
      ) : (
        <>
          {/* Studio Balanced Ambient Daylight Rig (Zero Distortion Shadows) */}
          <ambientLight intensity={1.1} color="#ffffff" />
          <hemisphereLight args={['#ffffff', '#888888', 0.6]} />
          <directionalLight
            ref={sunRef}
            position={[4, 8, 5]}
            intensity={1.0}
            color="#fffdf5"
            castShadow={false}
          />
          <directionalLight
            position={[-4, 6, -5]}
            intensity={0.5}
            color="#ffffff"
            castShadow={false}
          />
        </>
      )}
    </>
  );
}

interface BlenderMeshProps {
  modelUrl: string;
  surfaceStates: Record<string, string>;
  activeFinish?: PaintFinishId;
  activeTextures?: Record<string, string>;
  materialSwaps?: Record<string, string>;
  onModelLoaded?: (materials: string[], meshes: { name: string; originalMaterial: string }[]) => void;
  onTargetSelect: (meshName: string) => void;
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

export function StudioBlenderModelMesh({
  modelUrl,
  surfaceStates,
  activeFinish = 'EMULSION',
  activeTextures,
  materialSwaps,
  onModelLoaded,
  onTargetSelect
}: BlenderMeshProps) {
  const { scene, materials } = useGLTF(modelUrl) as unknown as GLTFResult;
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const wallNormalMap = useMemo(() => generateWallNormalMap(512, 512), []);

  useEffect(() => {
    if (onModelLoaded) {
      const matNames = Object.keys(materials);
      const meshInfo: { name: string; originalMaterial: string }[] = [];
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          const origMatName = Array.isArray(m.material) ? m.material[0]?.name : m.material?.name;
          meshInfo.push({ name: m.name, originalMaterial: origMatName || 'Unknown' });
        }
      });
      onModelLoaded(matNames, meshInfo);
    }
  }, [clonedScene, materials, onModelLoaded]);

  useEffect(() => {
    const finishSettings = PAINT_FINISH_PRESETS[activeFinish] || PAINT_FINISH_PRESETS.EMULSION;

    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.receiveShadow = true;
        node.castShadow = false;

        const meshName = node.name;
        const category = getMeshCategory(meshName);
        const mappedName = WALL_MAPPING[meshName] || meshName;

        const activeTextureId = activeTextures?.[meshName] || activeTextures?.[category];
        if (activeTextureId && activeTextureId !== 'original') {
          const preset = TEXTURE_PRESETS.find((p) => p.id === activeTextureId);
          if (preset) {
            const mat = new THREE.MeshStandardMaterial({
              map: preset.generateTexture(),
              roughness: preset.roughness,
              metalness: preset.metalness,
              side: THREE.DoubleSide,
            });
            node.material = mat;
            node.material.needsUpdate = true;
            return;
          }
        }

        const activeColor = surfaceStates[mappedName] || surfaceStates[meshName] || surfaceStates.wallFront;

        if (node.material instanceof THREE.MeshStandardMaterial) {
          node.material = node.material.clone();
          node.material.side = THREE.DoubleSide;

          if (activeColor) {
            node.material.color.set(activeColor);
          }

          if (meshName.startsWith('wall') || mappedName.startsWith('wall') || category === 'WALL') {
            node.material.roughness = finishSettings.materialProps.roughness;
            node.material.metalness = finishSettings.materialProps.metalness;
            node.material.bumpMap = wallNormalMap;
            node.material.bumpScale = finishSettings.materialProps.bumpScale;
          } else {
            node.material.roughness = Math.min(node.material.roughness, 0.85);
          }

          node.material.needsUpdate = true;
        }
      }
    });
  }, [clonedScene, surfaceStates, activeFinish, activeTextures, materialSwaps, wallNormalMap]);

  return (
    <primitive
      object={clonedScene}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (e.object instanceof THREE.Mesh) {
          const rawName = e.object.name || e.object.uuid;
          const targetName = WALL_MAPPING[rawName] || rawName;
          onTargetSelect(targetName);
        }
      }}
    />
  );
}

interface LightsEngineProps {
  lights: DynamicLightInstance[];
}

export function PlaygroundLightsEngine({ lights }: LightsEngineProps) {
  return (
    <>
      {lights.map((light) => {
        if (light.type === 'spot') {
          return (
            <spotLight
              key={light.id}
              position={light.position}
              rotation={light.rotation}
              intensity={light.intensity * 2}
              color={light.color}
              angle={(light as any).angle || Math.PI / 4}
              penumbra={0.5}
              castShadow={false}
            />
          );
        }

        return (
          <pointLight
            key={light.id}
            position={light.position}
            intensity={light.intensity * 2}
            color={light.color}
            distance={light.distance || 15}
            decay={1.1}
          />
        );
      })}
    </>
  );
}

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  isOrbitDisabled: boolean;
  minPolar?: number;
  maxPolar?: number;
  maxZoom?: number;
  isLocked: boolean;
}

export function CameraStudioController({
  controlsRef,
  isOrbitDisabled,
  minPolar = 0.0,
  maxPolar = Math.PI / 2 - 0.05,
  maxZoom = 0.55,
  isLocked,
}: CameraControllerProps) {
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!isOrbitDisabled && !isLocked}
      target={[0, 1.0, 0]}
      minPolarAngle={minPolar}
      maxPolarAngle={maxPolar || Math.PI / 2 - 0.05}
      minDistance={0.4}
      maxDistance={maxZoom * 10}
    />
  );
}