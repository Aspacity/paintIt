"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, TransformControls } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { PlacedObject, PlacedObjectTransform, ComponentSubMeshMaterial } from "@/types/modular";
import { TEXTURE_PRESETS } from "@/utils/generateFloorTextures";

interface ModularAssetInstanceProps {
  objectData: PlacedObject;
  isSelected: boolean;
  isEditable?: boolean;
  transformMode?: "translate" | "rotate" | "scale";
  onSelect?: () => void;
  onTransformChange?: (newTransform: PlacedObjectTransform) => void;
  onMaterialsDetected?: (materials: ComponentSubMeshMaterial[]) => void;
}

export function ModularAssetInstance({
  objectData,
  isSelected,
  isEditable = true,
  transformMode = "translate",
  onSelect,
  onTransformChange,
  onMaterialsDetected,
}: ModularAssetInstanceProps) {
  const { scene } = useGLTF(objectData.model_url);
  const meshRef = useRef<THREE.Group>(null);
  const transformRef = useRef<any>(null);

  // Clone scene & Preserve/Fix Embedded GLB Model Textures & Colors
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.side = THREE.DoubleSide;

          // If GLB model has an embedded texture map, set base color to white so texture renders at 100% full brightness!
          if (mat.map) {
            mat.color.set("#ffffff");
            mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.map.needsUpdate = true;
            mat.roughness = Math.min(mat.roughness, 0.7);
          } else if (mat.color && mat.color.r < 0.05 && mat.color.g < 0.05 && mat.color.b < 0.05) {
            // If no texture map and color is pitch black, auto-set to clean warm neutral
            const defaultColor = objectData.category === "decor" ? "#EAE6DF" : "#D4CFB9";
            mat.color.set(defaultColor);
            mat.roughness = 0.7;
          }

          mesh.material = mat;
          mesh.material.needsUpdate = true;
        }
      }
    });
    return clone;
  }, [scene, objectData.category]);

  // Auto-Bounding Normalization Engine for oversized GLBs exported in cm/mm
  const autoScaleFactor = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 2.5) {
      // Model was exported in centimeters or giant scale! Auto-normalize to ~1.0 meter human proportions.
      return 1.0 / maxDim;
    }
    return 1.0;
  }, [clonedScene]);

  // Effective Scale incorporating Auto-Normalization & User Scale
  const effectiveScale = useMemo(() => {
    const [sx, sy, sz] = objectData.transform.scale;
    return [sx * autoScaleFactor, sy * autoScaleFactor, sz * autoScaleFactor] as [number, number, number];
  }, [objectData.transform.scale, autoScaleFactor]);

  // Compute model bounding box size for selection wireframe & click target
  const boundingSize = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return {
      size: [
        Math.max(size.x * autoScaleFactor, 0.4),
        Math.max(size.y * autoScaleFactor, 0.4),
        Math.max(size.z * autoScaleFactor, 0.4),
      ] as [number, number, number],
      center: [center.x * autoScaleFactor, center.y * autoScaleFactor, center.z * autoScaleFactor] as [
        number,
        number,
        number
      ],
    };
  }, [clonedScene, autoScaleFactor]);

  // Inspect and detect sub-mesh materials & GLB embedded textures when selected
  useEffect(() => {
    if (isSelected && onMaterialsDetected) {
      const detected: ComponentSubMeshMaterial[] = [];
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const hexColor = mat?.color ? `#${mat.color.getHexString()}` : "#ffffff";
          const hasTextureMap = !!mat?.map;

          detected.push({
            meshName: mesh.name || "Main Mesh",
            materialName: mat?.name || (hasTextureMap ? "Embedded GLB Texture" : "Standard Material"),
            currentColor: objectData.materials?.[mesh.name] || hexColor,
            currentTexture: objectData.textures?.[mesh.name] || (hasTextureMap ? "Embedded Texture" : "None"),
          });
        }
      });
      onMaterialsDetected(detected);
    }
  }, [isSelected, clonedScene, objectData.materials, objectData.textures, onMaterialsDetected]);

  // Apply saved color & PBR texture overrides
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const meshName = mesh.name;

        // Check if custom PBR Texture Preset is selected for this sub-mesh
        const textureId = objectData.textures?.[meshName];
        if (textureId && textureId !== "original" && textureId !== "None" && textureId !== "Embedded Texture") {
          const preset = TEXTURE_PRESETS.find((p) => p.id === textureId);
          if (preset) {
            const texMat = new THREE.MeshStandardMaterial({
              map: preset.generateTexture(),
              roughness: preset.roughness,
              metalness: preset.metalness,
              side: THREE.DoubleSide,
            });
            mesh.material = texMat;
            mesh.material.needsUpdate = true;
            return;
          }
        }

        // Check if custom color is applied
        if (objectData.materials?.[meshName]) {
          const hexColor = objectData.materials[meshName];
          if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).color) {
            const colorMat = (mesh.material as THREE.MeshStandardMaterial).clone();
            colorMat.color.set(hexColor);
            mesh.material = colorMat;
            mesh.material.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene, objectData.materials, objectData.textures]);

  // Handle TransformControls dragging commit onMouseUp
  const handleTransformEnd = () => {
    if (!meshRef.current || !onTransformChange) return;

    const group = meshRef.current;
    const rawScaleX = group.scale.x / autoScaleFactor;
    const rawScaleY = group.scale.y / autoScaleFactor;
    const rawScaleZ = group.scale.z / autoScaleFactor;

    const newTransform: PlacedObjectTransform = {
      position: [
        parseFloat(group.position.x.toFixed(2)),
        parseFloat(group.position.y.toFixed(2)),
        parseFloat(group.position.z.toFixed(2)),
      ],
      rotation: [
        parseFloat(group.rotation.x.toFixed(2)),
        parseFloat(group.rotation.y.toFixed(2)),
        parseFloat(group.rotation.z.toFixed(2)),
      ],
      scale: [
        parseFloat(rawScaleX.toFixed(2)),
        parseFloat(rawScaleY.toFixed(2)),
        parseFloat(rawScaleZ.toFixed(2)),
      ],
    };

    onTransformChange(newTransform);
  };

  const handleMeshClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    console.log("🎯 [Modular Instance] Clicked 3D Component Model:", objectData.name, objectData.instance_id);
    if (onSelect) onSelect();
  };

  return (
    <>
      <group
        ref={meshRef}
        position={objectData.transform.position}
        rotation={objectData.transform.rotation}
        scale={effectiveScale}
      >
        {/* Render 3D Model with direct Raycast onClick Handler */}
        <primitive object={clonedScene} onClick={handleMeshClick} />

        {/* Bounding Box Click Interceptor Mesh (100% Raycast Pickable) */}
        <mesh position={boundingSize.center} onClick={handleMeshClick} visible={true}>
          <boxGeometry args={boundingSize.size} />
          <meshBasicMaterial transparent opacity={0.001} />
        </mesh>

        {/* Selection Bounding Highlight Wireframe */}
        {isSelected && (
          <mesh position={boundingSize.center}>
            <boxGeometry args={boundingSize.size} />
            <meshBasicMaterial wireframe color="#10b981" transparent opacity={0.4} />
          </mesh>
        )}
      </group>

      {/* 3D Gizmo Controls when selected */}
      {isSelected && isEditable && meshRef.current && (
        <TransformControls
          ref={transformRef}
          object={meshRef.current}
          mode={transformMode}
          onMouseUp={handleTransformEnd}
        />
      )}
    </>
  );
}
