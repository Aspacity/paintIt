import * as THREE from 'three';

export interface SnapResult {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  snappedType: 'floor' | 'wall' | 'surface' | 'none';
  targetMeshName?: string;
}

export class SnappingEngine {
  /**
   * Snaps a 3D position value to a given grid step (default 0.1m / 10cm)
   */
  static snapToGrid(val: number, step: number = 0.1): number {
    return Math.round(val / step) * step;
  }

  /**
   * Snaps an asset to the floor plane (Y = 0) or hit floor mesh
   */
  static snapToFloor(
    currentPos: THREE.Vector3,
    boundingHeight: number = 0,
    gridSnap: boolean = true,
    gridStep: number = 0.1
  ): SnapResult {
    const snappedX = gridSnap ? this.snapToGrid(currentPos.x, gridStep) : currentPos.x;
    const snappedZ = gridSnap ? this.snapToGrid(currentPos.z, gridStep) : currentPos.z;

    // Position origin at bottom of bounding box (Y = 0 + offset)
    const snappedY = boundingHeight / 2;

    return {
      position: new THREE.Vector3(snappedX, snappedY, snappedZ),
      rotation: new THREE.Euler(0, 0, 0),
      snappedType: 'floor'
    };
  }

  /**
   * Snaps a wall item (curtains, wall panels, mirrors) against a target wall surface
   */
  static snapToWall(
    intersections: THREE.Intersection[],
    objectOffsetDepth: number = 0.05
  ): SnapResult | null {
    if (!intersections || intersections.length === 0) return null;

    // Filter intersection for wall meshes
    const wallHit = intersections.find((hit) => {
      const name = hit.object.name.toLowerCase();
      return name.includes('wall') || name.includes('back') || name.includes('left') || name.includes('right') || name.includes('front');
    });

    if (!wallHit || !wallHit.face) return null;

    const hitPoint = wallHit.point.clone();
    const normal = wallHit.face.normal.clone().transformDirection(wallHit.object.matrixWorld).normalize();

    // Offset position slightly outwards along normal to prevent z-fighting
    const snappedPosition = hitPoint.add(normal.clone().multiplyScalar(objectOffsetDepth));

    // Align rotation quaternion to face normal
    const dummy = new THREE.Object3D();
    dummy.position.copy(snappedPosition);
    dummy.lookAt(snappedPosition.clone().add(normal));

    return {
      position: snappedPosition,
      rotation: dummy.rotation.clone(),
      snappedType: 'wall',
      targetMeshName: wallHit.object.name
    };
  }
}
