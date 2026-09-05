"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import PaintItMasterCanvas, { WallFinishType } from "@/components/canvas/PaintItMasterCanvas";
import { CameraConfigPayload } from "@/components/canvas/master/MasterCameraRig";
import { LightingPresetKey } from "@/config/lightingPresets";
import {
  saveVisualizationSync,
  VisualizationSavePayload,
  initOfflineOnlineListener,
} from "@/utils/offlineDBSync";

export interface DBCameraConfig {
  position?: [number, number, number];
  target?: [number, number, number];
  floorLimitAngle?: number;
  ceilingLimitAngle?: number;
  maxZoomDistance?: number;
}

export interface DBRawLight {
  id: string;
  type: "point" | "spot";
  color: string;
  intensity: number;
  position: [number, number, number];
  visible?: boolean;
  scale?: [number, number, number];
  rotation?: [number, number, number];
  distance?: number;
}

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const urlDesignId = searchParams?.get("id") || null;
  const urlTemplateId = searchParams?.get("template") || "tmpl_hostel_lux";

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [designTitle, setDesignTitle] = useState<string>("Custom Design Concept");
  const [modelUrl, setModelUrl] = useState<string>("/models/selfcon.glb");
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [activeFloorTexture, setActiveFloorTexture] = useState<string>("floor_oak");

  const [lightingSettings, setLightingSettings] = useState<{
    timeOfDay?: LightingPresetKey;
    sunAzimuthOverride?: number;
    sunElevationOverride?: number;
    sunIntensityOverride?: number;
    ambientIntensityOverride?: number;
    sunColorOverride?: string;
    bulbs?: any[];
  }>({
    timeOfDay: "morning",
  });

  const [roomColors, setRoomColors] = useState<Record<string, string>>({
    wallFront: "#C4B199",
    wallBack: "#C4B199",
    wallLeft: "#C4B199",
    wallRight: "#C4B199",
    ceiling: "#FFFFFF",
  });

  const [roomFinishes, setRoomFinishes] = useState<Record<string, string>>({
    wallFront: "EMULSION",
    wallBack: "EMULSION",
    wallLeft: "EMULSION",
    wallRight: "EMULSION",
  });

  // Modal Save States
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

  const [savedCameraConfig, setSavedCameraConfig] = useState<CameraConfigPayload | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrateWorkspace = async () => {
      const targetId = urlDesignId || urlTemplateId;
      if (!targetId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        let endpoint = `${BACKEND_API_URL}/api/visualizations/${targetId}`;
        if (urlTemplateId && !urlDesignId) {
          endpoint = `${BACKEND_API_URL}/api/visualizations/catalog/${urlTemplateId}`;
        }

        const res = await fetch(endpoint, {
          method: "GET",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });

        if (res.ok && isMounted) {
          const data = await res.json();
          const vis = data.visualization || data.catalog || data.data || data;

          if (vis.name || vis.title) {
            setDesignTitle(vis.name || vis.title);
            setSaveName(vis.name || vis.title);
          }

          if (vis.model_url || vis.modelUrl) {
            setModelUrl(vis.model_url || vis.modelUrl);
          }

          if (vis.camera_settings || vis.cameraSettings || vis.camera_data) {
            const cam = vis.camera_settings || vis.cameraSettings || vis.camera_data;
            setSavedCameraConfig({
              minDistance: cam.minDistance ?? 0.2,
              maxDistance: cam.maxDistance ?? 15.0,
              maxPolarAngle: cam.maxPolarAngle ?? Math.PI - 0.05,
              minPolarAngle: cam.minPolarAngle ?? 0.01,
              fov: cam.fov ?? 45,
              position: cam.position ?? [0, 1.8, 4.5],
              target: cam.target ?? [0, 1.2, 0],
            });
          }

          if (vis.lighting_settings || vis.lightingSettings || vis.light_data) {
            let ls = vis.lighting_settings || vis.lightingSettings || vis.light_data;
            if (typeof ls === "string") {
              try { ls = JSON.parse(ls); } catch { ls = {}; }
            }
            if (Array.isArray(ls) && ls.length > 0) {
              const firstObj = typeof ls[0] === "object" ? ls[0] : {};
              setLightingSettings((prev) => ({ ...prev, ...firstObj }));
              if (firstObj.timeOfDay) setIsNightMode(firstObj.timeOfDay === "night");
            } else if (typeof ls === "object" && ls !== null) {
              setLightingSettings((prev) => ({ ...prev, ...ls }));
              if (ls.timeOfDay) setIsNightMode(ls.timeOfDay === "night");
            }
          }

          if (vis.global_environment?.isNightMode !== undefined) {
            setIsNightMode(vis.global_environment.isNightMode);
          }

          const roomObj = vis.room_data || vis.roomData || vis.default_room_data;
          if (roomObj) {
            if (roomObj.wallColors || roomObj.wall_colors) {
              const colors = roomObj.wallColors || roomObj.wall_colors;
              setRoomColors((prev) => ({ ...prev, ...colors }));
            }
            if (roomObj.wallFinishes || roomObj.wall_finishes) {
              const finishes = roomObj.wallFinishes || roomObj.wall_finishes;
              setRoomFinishes((prev) => ({ ...prev, ...finishes }));
            }
            if (roomObj.floorTexture || roomObj.floor_texture) {
              setActiveFloorTexture(roomObj.floorTexture || roomObj.floor_texture);
            }
          }
        }
      } catch (err) {
        console.error("Failed to hydrate workspace from DB:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    hydrateWorkspace();
    return () => {
      isMounted = false;
    };
  }, [urlDesignId, urlTemplateId, accessToken, BACKEND_API_URL]);

  useEffect(() => {
    const cleanup = initOfflineOnlineListener(accessToken);
    return () => cleanup();
  }, [accessToken]);

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;

    setIsSaving(true);
    try {
      const payload: VisualizationSavePayload = {
        id: urlDesignId || undefined,
        name: saveName.trim(),
        parent_template_id: urlTemplateId || null,
        room_data: {
          modelUrl,
          wallColors: roomColors,
          wallFinishes: roomFinishes as Record<string, WallFinishType>,
          floorTexture: activeFloorTexture,
          isNightMode,
        },
        camera_settings: savedCameraConfig || undefined,
        lighting_settings: {
          timeOfDay: isNightMode ? "night" : (lightingSettings.timeOfDay || "morning"),
          sunAzimuthOverride: lightingSettings.sunAzimuthOverride,
          sunElevationOverride: lightingSettings.sunElevationOverride,
          sunIntensityOverride: lightingSettings.sunIntensityOverride,
          ambientIntensityOverride: lightingSettings.ambientIntensityOverride,
          sunColorOverride: lightingSettings.sunColorOverride,
          bulbs: lightingSettings.bulbs || [],
        },
      };

      const result = await saveVisualizationSync(payload, accessToken);

      showToast({
        message: result.message,
        severity: result.isOffline ? "info" : "success",
      });
      setSaveModalOpen(false);
      if (result.id && result.id !== urlDesignId) {
        router.push(`/workspace?id=${result.id}`);
      }
    } catch (err) {
      console.error("Workspace save failed:", err);
      showToast({
        message: "Saved locally! (Backend sync pending)",
        severity: "info",
      });
      setSaveModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 z-50 text-white font-mono">
        <div className="w-8 h-8 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase font-bold tracking-widest text-[#FF8C38]">
          Loading Master Canvas...
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-neutral-950 overflow-hidden select-none">
      {/* MOBILE-RESPONSIVE FLOATING HEADER OVERLAY */}
      <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto z-50 pointer-events-auto flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-neutral-950/90 backdrop-blur-2xl border border-neutral-800 p-2 sm:px-4 sm:py-2 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-7 h-7 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FF8C38] text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all shrink-0"
            title="Exit Workspace"
          >
            ◀
          </button>
          <div className="min-w-0 truncate">
            <h1 className="text-xs font-bold uppercase text-white tracking-wide truncate max-w-[110px] sm:max-w-xs">
              {designTitle}
            </h1>
            <span className="text-[9px] font-mono text-[#FF8C38] block leading-none truncate hidden sm:block">
              PaintIT 3D Studio • Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="w-7 h-7 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FF8C38] text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all"
            title="Toggle Native Fullscreen"
          >
            ⛶
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            className="px-3 py-1.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 shrink-0"
          >
            <span>💾</span>
            <span className="hidden sm:inline">SAVE CONCEPT</span>
            <span className="inline sm:hidden font-bold">SAVE</span>
          </button>
        </div>
      </div>

      {/* 🟢 100% FULL-SCREEN UNIFIED MASTER CANVAS VIEWPORT */}
      <div className="w-full h-full relative overflow-hidden bg-neutral-950">
        <PaintItMasterCanvas
          config={{
            mode: "painter",
            modelUrl: modelUrl,
            timeOfDay: isNightMode ? "night" : (lightingSettings.timeOfDay || "morning"),
            sunAzimuthOverride: lightingSettings.sunAzimuthOverride,
            sunElevationOverride: lightingSettings.sunElevationOverride,
            sunIntensityOverride: lightingSettings.sunIntensityOverride,
            ambientIntensityOverride: lightingSettings.ambientIntensityOverride,
            sunColorOverride: lightingSettings.sunColorOverride,
            bulbs: lightingSettings.bulbs,
            activeWallColor: roomColors.wallFront || "#C4B199",
            activeWallFinish: (roomFinishes.wallFront as WallFinishType) || "EMULSION",
            activeCeilingType: "Ceiling_Cove",
            activeFloorTextureId: activeFloorTexture,
            wallSurfaceStates: {
              wall_back: {
                color: roomColors.wallBack || roomColors.wall_back || "#C4B199",
                finish: (roomFinishes.wallBack as WallFinishType) || "EMULSION",
              },
              wall_left: {
                color: roomColors.wallLeft || roomColors.wall_left || "#C4B199",
                finish: (roomFinishes.wallLeft as WallFinishType) || "EMULSION",
              },
              wall_right: {
                color: roomColors.wallRight || roomColors.wall_right || "#C4B199",
                finish: (roomFinishes.wallRight as WallFinishType) || "EMULSION",
              },
              wall_front: {
                color: roomColors.wallFront || roomColors.wall_front || "#C4B199",
                finish: (roomFinishes.wallFront as WallFinishType) || "EMULSION",
              },
              toilet: {
                color: roomColors.toilet || "#C4B199",
                finish: (roomFinishes.toilet as WallFinishType) || "EMULSION",
              },
              ceiling: {
                color: roomColors.ceiling || "#FFFFFF",
                finish: "EMULSION",
              },
            },
            enableAutoCutaway: true,
            isAdmin: false,
            hideLightingTab: false,
          }}
          savedCameraConfig={savedCameraConfig}
          onSaveCameraConfig={(cam) => setSavedCameraConfig(cam)}
          onSaveLightingConfig={(data) => {
            setLightingSettings({
              timeOfDay: data.timeOfDay,
              sunAzimuthOverride: data.azimuth,
              sunElevationOverride: data.elevation,
              sunIntensityOverride: data.intensity,
              ambientIntensityOverride: data.ambient,
              sunColorOverride: data.color,
              bulbs: data.bulbs,
            });
            showToast({ message: "☀️ Lighting configuration saved!", severity: "success" });
          }}
          onConfigChange={(newCfg) => {
            if (newCfg.modelUrl) setModelUrl(newCfg.modelUrl);
            if (newCfg.bulbs) setLightingSettings((prev) => ({ ...prev, bulbs: newCfg.bulbs }));
            if (newCfg.timeOfDay) {
              setLightingSettings((prev) => ({ ...prev, timeOfDay: newCfg.timeOfDay as LightingPresetKey }));
              setIsNightMode(newCfg.timeOfDay === "night");
            }
            if (newCfg.sunAzimuthOverride !== undefined) {
              setLightingSettings((prev) => ({ ...prev, sunAzimuthOverride: newCfg.sunAzimuthOverride }));
            }
            if (newCfg.sunElevationOverride !== undefined) {
              setLightingSettings((prev) => ({ ...prev, sunElevationOverride: newCfg.sunElevationOverride }));
            }
            if (newCfg.sunIntensityOverride !== undefined) {
              setLightingSettings((prev) => ({ ...prev, sunIntensityOverride: newCfg.sunIntensityOverride }));
            }
            if (newCfg.ambientIntensityOverride !== undefined) {
              setLightingSettings((prev) => ({ ...prev, ambientIntensityOverride: newCfg.ambientIntensityOverride }));
            }
            if (newCfg.activeFloorTextureId) setActiveFloorTexture(newCfg.activeFloorTextureId);
            if (newCfg.wallSurfaceStates) {
              const states = newCfg.wallSurfaceStates;
              setRoomColors((prev) => ({
                ...prev,
                wallFront: states.wall_front?.color || prev.wallFront,
                wallBack: states.wall_back?.color || prev.wallBack,
                wallLeft: states.wall_left?.color || prev.wallLeft,
                wallRight: states.wall_right?.color || prev.wallRight,
                toilet: states.toilet?.color || prev.toilet,
                ceiling: states.ceiling?.color || prev.ceiling,
              }));
              setRoomFinishes((prev) => ({
                ...prev,
                wallFront: states.wall_front?.finish || prev.wallFront,
                wallBack: states.wall_back?.finish || prev.wallBack,
                wallLeft: states.wall_left?.finish || prev.wallLeft,
                wallRight: states.wall_right?.finish || prev.wallRight,
                toilet: states.toilet?.finish || prev.toilet,
              }));
            }
          }}
        />
      </div>

      {/* SAVE CONCEPT MODAL */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm sm:max-w-md bg-neutral-900 border border-neutral-800 p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4 text-white">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>💾 Save Color Concept</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Specify a name to register this design concept in your 3D portfolio.
              </p>
            </div>

            <form onSubmit={handleSaveWorkspace} className="space-y-4">
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Executive Minimalist Living Room"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#FF8C38] rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] disabled:bg-stone-600 text-black text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2"
                >
                  {isSaving ? "Saving..." : "Confirm Save ➔"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 z-50 font-mono text-white">
          <div className="w-6 h-6 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs tracking-widest text-neutral-500 uppercase font-bold">
            Loading Spatial Parameters...
          </span>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}