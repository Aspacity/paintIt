import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useControls, button } from "leva";
import { CameraViewPreset } from "./CanvasTopStatusBar";
import * as THREE from "three";

export interface CameraConfigPayload {
  minDistance: number;
  maxDistance: number;
  maxPolarAngle: number;
  minPolarAngle: number;
  fov: number;
  position: [number, number, number];
  target: [number, number, number];
  preset?: CameraViewPreset | null;
}

interface MasterCameraRigProps {
  targetPreset: CameraViewPreset | null;
  activeSurface?: string | null;
  enableZoom?: boolean;
  isAdmin?: boolean;
  savedCameraConfig?: Partial<CameraConfigPayload> | null;
  onSaveCameraConfig?: (payload: CameraConfigPayload) => void;
}

export default function MasterCameraRig({
  targetPreset,
  enableZoom = true,
  isAdmin = false,
  savedCameraConfig,
  onSaveCameraConfig,
}: MasterCameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // 🎛️ LEVA GUI CONTROLLER FOR CAMERA CONFIGURATION
  const [levaConfig] = useControls(
    "📷 Camera & Viewport Controls",
    () => ({
      minDistance: {
        value: savedCameraConfig?.minDistance ?? 0.2,
        min: 0.1,
        max: 10.0,
        step: 0.1,
        label: "Min Zoom (m)",
      },
      maxDistance: {
        value: savedCameraConfig?.maxDistance ?? 15.0,
        min: 2.0,
        max: 50.0,
        step: 0.5,
        label: "Max Zoom (m)",
      },
      maxPolarAngleDeg: {
        value: Math.round(((savedCameraConfig?.maxPolarAngle ?? Math.PI - 0.05) * 180) / Math.PI),
        min: 30,
        max: 180,
        step: 1,
        label: "Max Tilt (deg)",
      },
      fov: {
        value: savedCameraConfig?.fov ?? 45,
        min: 20,
        max: 110,
        step: 1,
        label: "Field of View (°)",
      },
      cameraPreset: {
        options: {
          "🛋️ Room View": "FULL_ROOM",
          "🔍 Focus View": "SEATING_FOCUS",
          "🎨 Wall Focus": "ACCENT_WALL",
          "📐 Top-Down Plan": "TOP_DOWN",
        },
        value: "FULL_ROOM",
        label: "Camera Preset",
      },
      "💾 Save Camera Setup": button((get) => {
        if (!controlsRef.current) return;
        const target = controlsRef.current.target;
        const minDist = (get("📷 Camera & Viewport Controls.minDistance") as number) ?? 0.2;
        const maxDist = (get("📷 Camera & Viewport Controls.maxDistance") as number) ?? 15.0;
        const maxTiltDeg = (get("📷 Camera & Viewport Controls.maxPolarAngleDeg") as number) ?? 175;
        const currentFov = (get("📷 Camera & Viewport Controls.fov") as number) ?? 45;
        const presetChoice = get("📷 Camera & Viewport Controls.cameraPreset") as CameraViewPreset;

        const payload: CameraConfigPayload = {
          minDistance: minDist,
          maxDistance: maxDist,
          maxPolarAngle: (maxTiltDeg * Math.PI) / 180,
          minPolarAngle: 0.01,
          fov: currentFov,
          position: [
            parseFloat(camera.position.x.toFixed(2)),
            parseFloat(camera.position.y.toFixed(2)),
            parseFloat(camera.position.z.toFixed(2)),
          ],
          target: [
            parseFloat(target.x.toFixed(2)),
            parseFloat(target.y.toFixed(2)),
            parseFloat(target.z.toFixed(2)),
          ],
          preset: presetChoice,
        };

        onSaveCameraConfig?.(payload);
      }),
    }),
    [isAdmin]
  );

  // Dynamic Camera FOV Update
  useEffect(() => {
    const pCam = camera as THREE.PerspectiveCamera;
    if (pCam.isPerspectiveCamera && levaConfig.fov) {
      // eslint-disable-next-line react-hooks/immutability
      pCam.fov = levaConfig.fov;
      pCam.updateProjectionMatrix();
    }
  }, [camera, levaConfig.fov]);

  // Handle Preset Changes from props or Leva GUI
  const activePreset = targetPreset || levaConfig.cameraPreset;

  useEffect(() => {
    camera.up.set(0, 1, 0);

    if (controlsRef.current) {
      if (savedCameraConfig?.position && savedCameraConfig?.target && !targetPreset) {
        camera.position.set(savedCameraConfig.position[0], savedCameraConfig.position[1], savedCameraConfig.position[2]);
        controlsRef.current.target.set(savedCameraConfig.target[0], savedCameraConfig.target[1], savedCameraConfig.target[2]);
      } else if (!activePreset || activePreset === "FULL_ROOM") {
        camera.position.set(0, 1.8, 4.5);
        controlsRef.current.target.set(0, 1.2, 0);
      } else if (activePreset === "SEATING_FOCUS") {
        camera.position.set(-0.5, 1.4, 2.5);
        controlsRef.current.target.set(0, 0.8, -0.5);
      } else if (activePreset === "ACCENT_WALL") {
        camera.position.set(0, 1.6, 2.8);
        controlsRef.current.target.set(0, 1.6, -2.0);
      } else if (activePreset === "TOP_DOWN") {
        camera.position.set(0, 6.5, 0.01);
        controlsRef.current.target.set(0, 0, 0);
      }

      controlsRef.current.update();
    }
  }, [activePreset, camera, savedCameraConfig]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={savedCameraConfig?.target ?? [0, 1.2, 0]}
      minPolarAngle={savedCameraConfig?.minPolarAngle ?? 0.01}
      maxPolarAngle={savedCameraConfig?.maxPolarAngle ?? ((levaConfig.maxPolarAngleDeg * Math.PI) / 180)}
      minDistance={savedCameraConfig?.minDistance ?? levaConfig.minDistance ?? 0.2}
      maxDistance={savedCameraConfig?.maxDistance ?? levaConfig.maxDistance ?? 50.0}
      enableRotate={true} // 🔄 Horizontal 360° rotation around room enabled!
      enablePan={true} // 🎥 Position panning enabled for all users!
      screenSpacePanning={true} // ↕️↔️ Pan along screen plane up, down, left, right along any axis!
      panSpeed={1.2}
      enableZoom={enableZoom} // 🔍 Zoom in and out allowed!
      enableDamping={true}
      dampingFactor={0.08}
      onChange={() => {
        if (!controlsRef.current) return;
        const target = controlsRef.current.target;
        const currentFov = (camera as THREE.PerspectiveCamera).fov || 45;
        const payload: CameraConfigPayload = {
          minDistance: controlsRef.current.minDistance,
          maxDistance: controlsRef.current.maxDistance,
          maxPolarAngle: controlsRef.current.maxPolarAngle,
          minPolarAngle: controlsRef.current.minPolarAngle,
          fov: currentFov,
          position: [
            parseFloat(camera.position.x.toFixed(3)),
            parseFloat(camera.position.y.toFixed(3)),
            parseFloat(camera.position.z.toFixed(3)),
          ],
          target: [
            parseFloat(target.x.toFixed(3)),
            parseFloat(target.y.toFixed(3)),
            parseFloat(target.z.toFixed(3)),
          ],
        };
        onSaveCameraConfig?.(payload);
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
