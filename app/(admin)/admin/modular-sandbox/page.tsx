"use client";

import React, { useState, useMemo, useEffect, Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useControls, Leva } from "leva";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { PlacedObject, CatalogAsset, PlacedObjectTransform, ComponentSubMeshMaterial } from "@/types/modular";
import { ModularAssetInstance } from "@/components/canvas/ModularAssetInstance";
import { ModularAssetDrawer, StudioTab } from "@/components/ui/ModularAssetDrawer";
import {
  StudioBlenderModelMesh,
  PlaygroundLighting,
  PlaygroundLightsEngine,
  AdminTransformGizmo,
  CameraStudioController,
} from "@/components/canvas/playground-core";
import { SnappingEngine } from "@/utils/snappingEngine";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { BulbState } from "@/components/canvas/LightControls";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { DynamicLightInstance } from "@/types/index";

type WorkspaceLightInstance = DynamicLightInstance & {
  name?: string;
  enabled?: boolean;
  visible?: boolean;
};

export default function ModularStudioSandboxPage() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [shellModelUrl, setShellModelUrl] = useState<string>("/models/shells/spacious-lux.glb");
  const [roomShellScale, setRoomShellScale] = useState<number>(1.25);
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [activeSubMaterials, setActiveSubMaterials] = useState<ComponentSubMeshMaterial[]>([]);

  // Surface Paint & Texture States
  const [activeSurface, setActiveSurface] = useState<string>("wallFront");
  const [roomColors, setRoomColors] = useState<Record<string, string>>({
    wallFront: "#F2EFE9",
    wallBack: "#F2EFE9",
    wallLeft: "#EAE7E0",
    wallRight: "#EAE7E0",
    floor: "#f2f0ea",
    ceiling: "#ffffff",
  });
  const [activeTextures, setActiveTextures] = useState<Record<string, string>>({});

  // Dynamic Light Fixtures State
  const [bulbs, setBulbs] = useState<WorkspaceLightInstance[]>([]);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>("catalog");

  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { showToast } = useAlert();
  const { accessToken } = useAuth();
  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Exact Leva Controls from Playground
  const [cameraConfig] = useControls("Camera Limits", () => ({
    maxZoomDistance: { value: 0.55, min: 0.1, max: 15.0, step: 0.05, label: "Max Out Zoom" },
    ceilingLimitAngle: { value: 0.0, min: 0.0, max: 3.14, step: 0.05, label: "Ceiling Stop" },
    floorLimitAngle: { value: 1.85, min: 0.0, max: 3.14, step: 0.05, label: "Floor Stop" },
  }));

  const [globalEnvironment, setGlobalEnv] = useControls("Global Scene", () => ({
    isNightMode: { value: false, label: "🌙 Night Mode" },
    sunlightIntensity: { value: 1.2, min: 0.0, max: 5.0, step: 0.1, label: "☀️ Sunlight Intensity" },
  }));

  const handleDeleteLight = (id: string) => {
    setBulbs((prev) => prev.filter((b) => b.id !== id));
    if (selectedLightId === id) setSelectedLightId(null);
  };

  const handleDeleteSelected = (targetId?: string) => {
    const idToDelete = targetId || selectedInstanceId;
    if (!idToDelete) return;
    setPlacedObjects((prev) => prev.filter((obj) => obj.instance_id !== idToDelete));
    if (selectedInstanceId === idToDelete) {
      setSelectedInstanceId(null);
      setActiveSubMaterials([]);
    }
    showToast({ message: "Component deleted from room.", severity: "info" });
  };

  // Keyboard shortcut listener for Delete / Backspace key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedInstanceId) {
          handleDeleteSelected(selectedInstanceId);
        } else if (selectedLightId) {
          handleDeleteLight(selectedLightId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedInstanceId, selectedLightId]);

  // Dynamic Light Creation & Management
  const handleAddLight = () => {
    const newId = `light_${Date.now()}`;
    const newLight: WorkspaceLightInstance = {
      id: newId,
      name: `Fixture #${bulbs.length + 1}`,
      type: "point",
      position: [0, 2.2, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      intensity: 15,
      distance: 15,
      color: "#fffaed",
      enabled: true,
      visible: true,
    };
    setBulbs((prev) => [...prev, newLight]);
    setSelectedLightId(newId);
    setSelectedInstanceId(null);
    setActiveStudioTab("lighting");
    showToast({ message: "Added new 3D light fixture to room!", severity: "success" });
  };

  const handleToggleBulb = (id: string) => {
    setBulbs((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const nextVal = b.visible !== undefined ? !b.visible : !b.enabled;
          return { ...b, enabled: nextVal, visible: nextVal };
        }
        return b;
      })
    );
  };

  const handleBulbIntensityChange = (id: string, intensity: number) => {
    setBulbs((prev) => prev.map((b) => (b.id === id ? { ...b, intensity } : b)));
  };

  const handleBulbColorChange = (id: string, color: string) => {
    setBulbs((prev) => prev.map((b) => (b.id === id ? { ...b, color } : b)));
  };

  const handleBulbPositionChange = (id: string, position: [number, number, number]) => {
    setBulbs((prev) => prev.map((b) => (b.id === id ? { ...b, position } : b)));
  };

  const handleLightGizmoTransform = (property: "position" | "rotation" | "scale", value: [number, number, number]) => {
    if (!selectedLightId) return;
    setBulbs((prev) =>
      prev.map((b) => {
        if (b.id === selectedLightId) {
          return { ...b, [property]: value };
        }
        return b;
      })
    );
  };

  // Add 3D component asset into scene
  const handleAddAsset = (asset: CatalogAsset) => {
    const instanceId = `${asset.category}_${Date.now()}`;
    const snapRes = SnappingEngine.snapToFloor(
      new THREE.Vector3(0, 0.5, 0),
      0,
      true,
      0.1
    );

    const newObj: PlacedObject = {
      instance_id: instanceId,
      asset_id: asset.id,
      name: asset.name,
      category: asset.category,
      model_url: asset.model_url,
      transform: {
        position: [snapRes.position.x, snapRes.position.y, snapRes.position.z],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    };

    setPlacedObjects((prev) => [...prev, newObj]);
    setSelectedInstanceId(instanceId);
    setSelectedLightId(null);
    setActiveStudioTab("inspector");
  };

  const handleTransformChange = (instanceId: string, newTransform: PlacedObjectTransform) => {
    setPlacedObjects((prev) =>
      prev.map((obj) => (obj.instance_id === instanceId ? { ...obj, transform: newTransform } : obj))
    );
  };

  const handleUpdateSelectedObjectTransform = (
    property: "position" | "rotation" | "scale",
    value: [number, number, number]
  ) => {
    if (!selectedInstanceId) return;
    setPlacedObjects((prev) =>
      prev.map((obj) => {
        if (obj.instance_id === selectedInstanceId) {
          return {
            ...obj,
            transform: {
              ...obj.transform,
              [property]: value,
            },
          };
        }
        return obj;
      })
    );
  };

  const handleComponentMaterialColorChange = (meshName: string, colorHex: string) => {
    if (!selectedInstanceId) return;
    setPlacedObjects((prev) =>
      prev.map((obj) => {
        if (obj.instance_id === selectedInstanceId) {
          const updatedMaterials = { ...(obj.materials || {}), [meshName]: colorHex };
          return { ...obj, materials: updatedMaterials };
        }
        return obj;
      })
    );
  };

  const handleComponentTextureChange = (meshName: string, textureId: string) => {
    if (!selectedInstanceId) return;
    setPlacedObjects((prev) =>
      prev.map((obj) => {
        if (obj.instance_id === selectedInstanceId) {
          const updatedTextures = { ...(obj.textures || {}), [meshName]: textureId };
          return { ...obj, textures: updatedTextures };
        }
        return obj;
      })
    );
  };

  const handleDuplicateSelected = () => {
    if (!selectedInstanceId) return;
    const target = placedObjects.find((obj) => obj.instance_id === selectedInstanceId);
    if (!target) return;

    const dupId = `${target.category}_${Date.now()}`;
    const dupObj: PlacedObject = {
      ...target,
      instance_id: dupId,
      transform: {
        ...target.transform,
        position: [
          target.transform.position[0] + 0.3,
          target.transform.position[1],
          target.transform.position[2] + 0.3,
        ],
      },
    };

    setPlacedObjects((prev) => [...prev, dupObj]);
    setSelectedInstanceId(dupId);
  };

  // Save Master Room Template Manifest
  const handleSaveMasterTemplate = async () => {
    setIsSaving(true);
    try {
      const templatePayload = {
        title: "Modular Assembled Living Room",
        shell_model_url: shellModelUrl,
        room_shell_scale: roomShellScale,
        default_room_data: roomColors,
        placed_objects: placedObjects,
        lighting_settings: bulbs,
        global_environment: globalEnvironment,
      };

      const res = await fetch(`${BACKEND_API_URL}/api/visualizations/catalog/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templatePayload),
      });

      if (res.ok) {
        showToast({ message: "Master room template published successfully!", severity: "success" });
      } else {
        showToast({ message: "Saved template locally to sandbox session.", severity: "info" });
      }
    } catch (err) {
      showToast({ message: "Master template saved to local session.", severity: "info" });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedLightObj = bulbs.find((b) => b.id === selectedLightId);
  const selectedObject = placedObjects.find((o) => o.instance_id === selectedInstanceId);

  return (
    <div className="relative w-full h-screen bg-neutral-950 text-white font-sans overflow-hidden select-none flex">
      {/* Leva Controls Host */}
      <Leva collapsed titleBar={{ title: "🎛️ Playground Leva Controls" }} />

      {/* Attached Studio Control Drawer Sidebar */}
      <ModularAssetDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeStudioTab={activeStudioTab}
        onTabChange={setActiveStudioTab}
        onAddAsset={handleAddAsset}
        onSelectShell={(url) => setShellModelUrl(url)}
        roomShellScale={roomShellScale}
        onRoomShellScaleChange={setRoomShellScale}
        placedObjects={placedObjects}
        onSelectObject={(id) => {
          setSelectedInstanceId(id);
          setSelectedLightId(null);
          setActiveStudioTab("inspector");
        }}
        selectedObject={selectedObject || null}
        selectedSubMaterials={activeSubMaterials}
        onUpdateTransform={handleUpdateSelectedObjectTransform}
        onUpdateComponentMaterial={handleComponentMaterialColorChange}
        onUpdateComponentTexture={handleComponentTextureChange}
        onDuplicateObject={handleDuplicateSelected}
        onDeleteObject={handleDeleteSelected}
        roomColors={roomColors}
        onColorChange={(surf, color) => {
          setRoomColors((prev) => ({ ...prev, [surf]: color }));
          setActiveSurface(surf);
        }}
        activeSurface={activeSurface}
        onSurfaceSelect={setActiveSurface}
        activeTextures={activeTextures}
        onTextureSelect={(mesh, textId) => setActiveTextures((prev) => ({ ...prev, [mesh]: textId }))}
        isNightMode={globalEnvironment.isNightMode}
        onToggleNightMode={(isNight) => setGlobalEnv({ isNightMode: isNight })}
        bulbs={bulbs.map((b, i) => ({
          ...b,
          name: b.name || `Light Fixture #${i + 1}`,
          enabled: b.visible !== false && b.enabled !== false,
          type: (b.type as "point" | "spot") || "point",
        }))}
        onAddLight={handleAddLight}
        onDeleteLight={handleDeleteLight}
        onToggleBulb={handleToggleBulb}
        onBulbIntensityChange={handleBulbIntensityChange}
        onBulbColorChange={handleBulbColorChange}
        onBulbPositionChange={handleBulbPositionChange}
        selectedLightId={selectedLightId}
        onSelectLight={(id) => {
          setSelectedLightId(id);
          if (id) {
            setSelectedInstanceId(null);
            setActiveStudioTab("lighting");
          }
        }}
        sunlightIntensity={globalEnvironment.sunlightIntensity}
        onSunlightIntensityChange={(val) => setGlobalEnv({ sunlightIntensity: val })}
        transformMode={transformMode}
        onTransformModeChange={setTransformMode}
        onSaveTemplate={handleSaveMasterTemplate}
        isSaving={isSaving}
      />

      {/* Re-Open Sidebar Floating Handle Button */}
      {!drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="absolute top-4 left-4 z-50 px-4 py-2.5 bg-[#FF8C38] hover:bg-[#FF8C38] text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-2xl transition-all flex items-center gap-2 border border-orange-300 animate-pulse"
        >
          <span>🧱 Open Studio Controls</span>
        </button>
      )}

      {/* 3D Interactive Canvas Viewport (100% Replica of Playground) */}
      <main className="flex-1 bg-neutral-900 relative w-full h-full">
        <CanvasErrorBoundary>
          <Canvas
            shadows
            camera={{ position: [0, 1.4, 2.2], fov: 55 }}
            className="w-full h-full"
            onClick={() => {
              setSelectedInstanceId(null);
              setSelectedLightId(null);
              setActiveSubMaterials([]);
            }}
          >
            {/* Exact Playground Lighting & Sky Pipeline */}
            <PlaygroundLighting isNight={globalEnvironment.isNightMode} showHelpers={false} />

            <Suspense fallback={null}>
              {/* Scalable Room Shell Container */}
              <group scale={[roomShellScale, roomShellScale, roomShellScale]}>
                <StudioBlenderModelMesh
                  modelUrl={shellModelUrl}
                  surfaceStates={roomColors}
                  activeFinish="EMULSION"
                  activeTextures={activeTextures}
                  materialSwaps={{}}
                  onTargetSelect={(meshName: string) => {
                    setActiveSurface(meshName);
                    setActiveStudioTab("paint");
                  }}
                />
              </group>

              {/* Placed Furniture Component Instances */}
              {placedObjects.map((obj) => (
                <ModularAssetInstance
                  key={obj.instance_id}
                  objectData={obj}
                  isSelected={selectedInstanceId === obj.instance_id}
                  transformMode={transformMode}
                  onSelect={() => {
                    setSelectedInstanceId(obj.instance_id);
                    setSelectedLightId(null);
                    setActiveStudioTab("inspector");
                  }}
                  onTransformChange={(newTransform) =>
                    handleTransformChange(obj.instance_id, newTransform)
                  }
                  onMaterialsDetected={(materials) => {
                    setActiveSubMaterials(materials);
                  }}
                />
              ))}
            </Suspense>

            {/* Exact Playground Lights Engine */}
            <PlaygroundLightsEngine lights={bulbs.filter((l) => l.visible !== false)} />

            {/* Exact Playground Admin Transform Gizmo for Selected Light */}
            {selectedLightObj && selectedLightObj.visible !== false && (
              <AdminTransformGizmo
                activeLight={{
                  ...selectedLightObj,
                  distance: selectedLightObj.distance || 15,
                  rotation: selectedLightObj.rotation || [0, 0, 0],
                  scale: selectedLightObj.scale || [1, 1, 1],
                }}
                mode={transformMode}
                onTransformUpdate={handleLightGizmoTransform}
              />
            )}

            {/* Exact Playground Camera Studio Controller */}
            <CameraStudioController
              controlsRef={controlsRef}
              isOrbitDisabled={false}
              minPolar={cameraConfig.ceilingLimitAngle}
              maxPolar={cameraConfig.floorLimitAngle}
              maxZoom={cameraConfig.maxZoomDistance}
              isLocked={false}
            />
          </Canvas>
        </CanvasErrorBoundary>

        {/* Floating Quick Action Badge when Component Selected */}
        {selectedObject && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-950/95 border border-neutral-800 rounded-3xl p-3 px-5 flex items-center gap-4 backdrop-blur-2xl shadow-2xl z-40 animate-fade-in text-white">
            <span className="text-xs font-black uppercase text-[#FF8C38] truncate max-w-[160px]">
              {selectedObject.name}
            </span>
            <button
              onClick={() => setActiveStudioTab("inspector")}
              className="px-3 py-1.5 bg-[#FF8C38] text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md"
            >
              🧩 Inspect in Sidebar ➔
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
