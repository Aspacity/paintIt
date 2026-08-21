"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, TransformControls, Html } from "@react-three/drei";
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
  onDelete?: () => void;
}

export function ModularAssetInstance({
  objectData,
  isSelected,
  isEditable = true,
  transformMode: initialTransformMode = "translate",
  onSelect,
  onTransformChange,
  onMaterialsDetected,
  onDelete,
}: ModularAssetInstanceProps) {
  const { scene } = useGLTF(objectData.model_url);
  const meshRef = useRef<THREE.Group>(null);
  const [userGizmoMode, setUserGizmoMode] = useState<"translate" | "rotate" | "scale" | null>(null);
  const activeGizmoMode = userGizmoMode || initialTransformMode;

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

          if (mat.map) {
            mat.color.set("#ffffff");
            mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.map.needsUpdate = true;
            mat.roughness = Math.min(mat.roughness, 0.7);
          }
          if (mat.normalMap) mat.normalMap.needsUpdate = true;
          if (mat.roughnessMap) mat.roughnessMap.needsUpdate = true;
          if (mat.metalnessMap) mat.metalnessMap.needsUpdate = true;

          if (!mat.map && mat.color && mat.color.r < 0.05 && mat.color.g < 0.05 && mat.color.b < 0.05) {
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

  // Extract Sub-Mesh Materials from Blender GLB tree
  useEffect(() => {
    if (!onMaterialsDetected) return;
    const materials: ComponentSubMeshMaterial[] = [];
    const seenNames = new Set<string>();

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const matName = mat.name || mesh.name || "Default Material";
          if (!seenNames.has(matName)) {
            seenNames.add(matName);
            materials.push({
              meshName: mesh.name || matName,
              materialName: matName.replace(/_/g, " "),
              currentColor: mat.color ? `#${mat.color.getHexString()}` : "#cccccc",
              currentTexture: undefined,
            });
          }
        }
      }
    });

    if (materials.length > 0) {
      onMaterialsDetected(materials);
    }
  }, [clonedScene, onMaterialsDetected]);

  // Bounding box calculation for Floor Snapping & Realistic Proportions
  const { autoScaleFactor, minYOffset, boundingSize } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    let scaleFactor = 1.0;
    if (maxDim > 2.5) {
      // Model exported in cm or mm -> Auto-normalize to ~1.4 meters
      scaleFactor = 1.4 / maxDim;
    } else if (maxDim < 0.2) {
      // Model too small -> Scale up to generous 1.2 meters
      scaleFactor = 1.2 / maxDim;
    }

    // Offset bottom to rest flush on Floor (Y = 0.0)
    const yOffset = -box.min.y * scaleFactor;

    return {
      autoScaleFactor: scaleFactor,
      minYOffset: yOffset,
      boundingSize: {
        size: [
          Math.max(size.x * scaleFactor, 0.5),
          Math.max(size.y * scaleFactor, 0.5),
          Math.max(size.z * scaleFactor, 0.5),
        ] as [number, number, number],
        center: [center.x * scaleFactor, (center.y * scaleFactor) + yOffset, center.z * scaleFactor] as [
          number,
          number,
          number
        ],
      },
    };
  }, [clonedScene]);

  // Effective Scale incorporates Auto Scale Factor & User Custom Scale
  const effectiveScale = useMemo(() => {
    const [sx, sy, sz] = objectData.transform.scale || [1.8, 1.8, 1.8];
    return [sx * autoScaleFactor, sy * autoScaleFactor, sz * autoScaleFactor] as [number, number, number];
  }, [objectData.transform.scale, autoScaleFactor]);

  // Enforce Floor Constraint: Y position is locked to floor level (0.001)
  const clampedPosition = useMemo(() => {
    const [px, , pz] = objectData.transform.position || [0, 0, 0];
    return [px, 0.001, pz] as [number, number, number];
  }, [objectData.transform.position]);

  // Handle TransformControls dragging commit & floor snapping
  const handleTransformChange = () => {
    if (!meshRef.current) return;
    const group = meshRef.current;

    // 🔒 AUTOMATIC FLOOR LOCK: Force Y position back to 0.001 floor level!
    group.position.y = 0.001;

    if (onTransformChange) {
      const rawScaleX = group.scale.x / autoScaleFactor;
      const rawScaleY = group.scale.y / autoScaleFactor;
      const rawScaleZ = group.scale.z / autoScaleFactor;

      const newTransform: PlacedObjectTransform = {
        position: [
          parseFloat(group.position.x.toFixed(2)),
          0.001, // 🔒 Locked to floor!
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
    }
  };

  const handleMeshClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onSelect) onSelect();
  };

  const [meshGroup, setMeshGroup] = useState<THREE.Group | null>(null);

  return (
    <>
      <group
        ref={(el) => {
          meshRef.current = el;
          setMeshGroup(el);
        }}
        position={clampedPosition}
        rotation={objectData.transform.rotation}
        scale={effectiveScale}
      >
        {/* Render 3D Model resting flush on Floor plane */}
        <group position={[0, minYOffset, 0]}>
          <primitive object={clonedScene} onClick={handleMeshClick} />
        </group>

        {/* Bounding Box Click Target */}
        <mesh position={boundingSize.center} onClick={handleMeshClick} visible={true}>
          <boxGeometry args={boundingSize.size} />
          <meshBasicMaterial transparent opacity={0.001} />
        </mesh>

        {/* Selection Bounding Box Wireframe */}
        {isSelected && (
          <mesh position={boundingSize.center}>
            <boxGeometry args={boundingSize.size} />
            <meshBasicMaterial wireframe color="#06b6d4" transparent opacity={0.6} />
          </mesh>
        )}

      </group>

      {/* 3D GIZMO ARROWS & FLOOR RINGS WHEN SELECTED */}
      {isSelected && isEditable && meshGroup && (
        <TransformControls
          object={meshGroup}
          mode={activeGizmoMode}
          showY={activeGizmoMode === "scale"} // 🔒 Lock Y-axis translation so model can't be lifted into air!
          onChange={handleTransformChange}
          onMouseUp={handleTransformChange}
        />
      )}
    </>
  );
}
