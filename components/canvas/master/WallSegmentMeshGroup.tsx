"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { WallSegment, WallSplitData, getLeafSegments } from "./WallSplitterTypes";
import { WallFinishType } from "../PaintItMasterCanvas";
import { threeCache } from "@/utils/threeCacheManager";

interface WallTransformData {
  key: string;
  center: THREE.Vector3;
  quaternion: THREE.Quaternion;
  normal: THREE.Vector3;
  width: number;
  height: number;
}

interface WallSegmentMeshGroupProps {
  gltfScene: THREE.Group | null;
  wallSplits: Record<string, WallSplitData>;
  wallSurfaceStates: Record<string, { color: string; finish: WallFinishType }>;
  activeWallColor: string;
  activeWallFinish: WallFinishType;
  activeSelectedWall: string | null;
  onSelectSegment: (segmentId: string, point: THREE.Vector3) => void;
  resolveWallKey: (meshOrName: THREE.Object3D | string) => string;
}

/**
 * Renders 3D segment meshes for walls that have active Wall Splitter divisions.
 */
export function WallSegmentMeshGroup({
  gltfScene,
  wallSplits,
  wallSurfaceStates,
  activeWallColor,
  activeWallFinish,
  activeSelectedWall,
  onSelectSegment,
  resolveWallKey,
}: WallSegmentMeshGroupProps) {
  // Extract Wall Face Transforms & Geometry Bounds from 3D Model
  const wallTransformsMap = useMemo(() => {
    if (!gltfScene) return new Map<string, WallTransformData>();

    const map = new Map<string, WallTransformData>();

    gltfScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const wallKey = resolveWallKey(node);
        if (
          wallKey &&
          ["wall_back", "wall_left", "wall_right", "wall_front", "toilet"].includes(wallKey) &&
          !map.has(wallKey)
        ) {
          node.updateMatrixWorld(true);
          const geometry = node.geometry;
          geometry.computeBoundingBox();
          const bbox = geometry.boundingBox;

          if (bbox) {
            const size = new THREE.Vector3();
            bbox.getSize(size);

            const center = new THREE.Vector3();
            bbox.getCenter(center);
            center.applyMatrix4(node.matrixWorld);

            const quat = new THREE.Quaternion();
            node.matrixWorld.decompose(new THREE.Vector3(), quat, new THREE.Vector3());

            // Normal vector pointing outward from wall surface
            const localNormal = new THREE.Vector3(0, 0, 1);
            const normal = localNormal.applyQuaternion(quat).normalize();

            // Determine width (along local X) and height (along local Y)
            const width = Math.max(size.x, size.z);
            const height = size.y > 0 ? size.y : 2.8;

            map.set(wallKey, {
              key: wallKey,
              center,
              quaternion: quat,
              normal,
              width,
              height,
            });
          }
        }
      }
    });

    return map;
  }, [gltfScene, resolveWallKey]);

  if (!gltfScene || Object.keys(wallSplits).length === 0) return null;

  return (
    <group>
      {Object.entries(wallSplits).map(([wallKey, splitData]) => {
        const transform = wallTransformsMap.get(wallKey);
        if (!transform) return null;

        const leafSegments = getLeafSegments(splitData.rootSegment);
        const { center, quaternion, normal, width, height } = transform;

        // Position slightly in front of wall face to avoid Z-fighting (0.003m offset)
        const planePos = center.clone().add(normal.clone().multiplyScalar(0.003));

        return (
          <group key={`split-group-${wallKey}`} position={planePos} quaternion={quaternion}>
            {leafSegments.map((segment) => {
              const segmentState = wallSurfaceStates[segment.id] ||
                wallSurfaceStates[wallKey] || {
                  color: activeWallColor || "#C4B199",
                  finish: activeWallFinish || "EMULSION",
                };

              const colorHex = segmentState.color || activeWallColor || "#C4B199";
              const finish = segmentState.finish || activeWallFinish || "EMULSION";
              const isSelected = activeSelectedWall === segment.id;

              // Compute Segment Dimensions in Wall Local Coordinates
              const segW = (segment.maxX - segment.minX) * width;
              const segH = (segment.maxY - segment.minY) * height;
              const segCenterX = ((segment.minX + segment.maxX) / 2) * width;
              const segCenterY = ((segment.minY + segment.maxY) / 2) * height;

              // Material withSheen & Reflection
              const matCacheKey = `mat_seg_${segment.id}_${colorHex}_${finish}`;
              const mat = threeCache.getOrCreateMaterial(matCacheKey, () => {
                const m = new THREE.MeshStandardMaterial({
                  side: THREE.DoubleSide,
                  polygonOffset: true,
                  polygonOffsetFactor: -2,
                  polygonOffsetUnits: -2,
                });
                m.color.set(colorHex);
                m.roughness = finish === "SATIN" ? 0.35 : finish === "GLOSS" ? 0.15 : 0.85;
                m.metalness = finish === "SATIN" ? 0.04 : finish === "GLOSS" ? 0.12 : 0.0;
                return m;
              });
              mat.color.set(colorHex);

              // 📐 Geometry Construction for Rectangular vs Diagonal Segments
              let segmentGeometry: THREE.BufferGeometry;

              if (segment.isDiagonal) {
                // Construct Triangular BufferGeometry
                const geom = new THREE.BufferGeometry();
                const halfW = segW / 2;
                const halfH = segH / 2;

                let vertices: Float32Array;
                if (segment.diagonalType === "TL_BR") {
                  if (segment.isTopOrLeftTriangle) {
                    // Top-Left Triangle
                    vertices = new Float32Array([
                      -halfW,  halfH, 0,
                      -halfW, -halfH, 0,
                       halfW,  halfH, 0,
                    ]);
                  } else {
                    // Bottom-Right Triangle
                    vertices = new Float32Array([
                       halfW, -halfH, 0,
                       halfW,  halfH, 0,
                      -halfW, -halfH, 0,
                    ]);
                  }
                } else {
                  // TR_BL
                  if (segment.isTopOrLeftTriangle) {
                    // Top-Right Triangle
                    vertices = new Float32Array([
                       halfW,  halfH, 0,
                      -halfW,  halfH, 0,
                       halfW, -halfH, 0,
                    ]);
                  } else {
                    // Bottom-Left Triangle
                    vertices = new Float32Array([
                      -halfW, -halfH, 0,
                       halfW, -halfH, 0,
                      -halfW,  halfH, 0,
                    ]);
                  }
                }

                geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
                geom.computeVertexNormals();
                segmentGeometry = geom;
              } else {
                segmentGeometry = new THREE.PlaneGeometry(segW, segH);
              }

              return (
                <group key={segment.id} position={[segCenterX, segCenterY, 0]}>
                  {/* 1. Interactive Paintable Segment Surface Mesh */}
                  <mesh
                    geometry={segmentGeometry}
                    material={mat}
                    onClick={(e: ThreeEvent<MouseEvent>) => {
                      e.stopPropagation();
                      onSelectSegment(segment.id, e.point);
                    }}
                    onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
                      e.stopPropagation();
                      onSelectSegment(segment.id, e.point);
                    }}
                  />

                  {/* 2. Active Selection Highlight Overlay Border */}
                  {isSelected && (
                    <lineSegments position={[0, 0, 0.001]}>
                      <edgesGeometry args={[segmentGeometry]} />
                      <lineBasicMaterial color="#FF8C38" linewidth={3} />
                    </lineSegments>
                  )}
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
