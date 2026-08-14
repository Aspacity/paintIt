"use client";

import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CameraViewPreset } from "../PaintItMasterCanvas";

interface MasterCameraRigProps {
  targetPreset: CameraViewPreset | null;
  activeSurface?: string | null;
  enableZoom?: boolean;
}

export default function MasterCameraRig({ targetPreset, enableZoom = true }: MasterCameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Enforce perfectly upright horizon on mount and preset changes
  useEffect(() => {
    camera.up.set(0, 1, 0);

    if (controlsRef.current) {
      if (!targetPreset || targetPreset === "FULL_ROOM") {
        camera.position.set(0, 1.8, 4.5);
        controlsRef.current.target.set(0, 1.2, 0);
      } else if (targetPreset === "SEATING_FOCUS") {
        camera.position.set(-0.5, 1.4, 2.5);
        controlsRef.current.target.set(0, 0.8, -0.5);
      } else if (targetPreset === "ACCENT_WALL") {
        camera.position.set(0, 1.6, 2.8);
        controlsRef.current.target.set(0, 1.6, -2.0);
      } else if (targetPreset === "TOP_DOWN") {
        camera.position.set(0, 6.5, 0.01);
        controlsRef.current.target.set(0, 0, 0);
      }

      controlsRef.current.update();
    }
  }, [targetPreset, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, 1.2, 0]}
      minPolarAngle={0.0}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minDistance={0.4}
      maxDistance={10.0}
      enableZoom={enableZoom}
      enableDamping={true}
      dampingFactor={0.05}
    />
  );
}
