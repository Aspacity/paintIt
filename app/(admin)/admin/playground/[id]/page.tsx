'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import PaintItMasterCanvas, { MasterCanvasConfig, WallFinishType } from '@/components/canvas/PaintItMasterCanvas';
import { LightingPresetKey } from '@/config/lightingPresets';
import { CameraConfigPayload } from '@/components/canvas/master/MasterCameraRig';

import ConfirmModal from '@/components/modals/ConfirmModal';

import { saveModelLightingConfigGlobal } from '@/config/roomModelLightingConfigs';
import { paintitApi } from '@/lib/apiClient';

function PlaygroundCanvasContent() {
  const routeParams = useParams();
  const router = useRouter();
  const dynamicId = routeParams.id as string;
  const { showToast } = useAlert();
  const { accessToken } = useAuth();

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteModel = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/visualizations/catalog/${dynamicId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed deleting from catalog');
      showToast({ message: '🗑️ Model frame deleted successfully!', severity: 'success' });
      router.push('/admin/playground');
    } catch (err: any) {
      showToast({ message: `❌ Failed to delete model frame: ${err.message}`, severity: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [designTitle, setDesignTitle] = useState<string>('Master Studio Playground');
  const [modelUrl, setModelUrl] = useState<string>('/models/selfcon.glb');
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [activeFloorTexture, setActiveFloorTexture] = useState<string>('floor_oak');

  const [roomColors, setRoomColors] = useState<Record<string, string>>({
    wallFront: '#C4B199',
    wallBack: '#C4B199',
    wallLeft: '#C4B199',
    wallRight: '#C4B199',
    toilet: '#C4B199',
    ceiling: '#FFFFFF',
  });

  const [roomFinishes, setRoomFinishes] = useState<Record<string, string>>({
    wallFront: 'EMULSION',
    wallBack: 'EMULSION',
    wallLeft: 'EMULSION',
    wallRight: 'EMULSION',
    toilet: 'EMULSION',
  });

  const [savedCameraConfig, setSavedCameraConfig] = useState<CameraConfigPayload>({
    minDistance: 0.2,
    maxDistance: 15.0,
    maxPolarAngle: Math.PI - 0.05,
    minPolarAngle: 0.01,
    fov: 45,
    position: [0, 1.8, 4.5],
    target: [0, 1.2, 0],
  });

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

  // Hydrate Template Data from Backend / Local DB
  useEffect(() => {
    let isMounted = true;
    const hydratePlayground = async () => {
      try {
        const res = await fetch(`/api/visualizations/catalog/${dynamicId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            if (data.title) setDesignTitle(data.title);
            if (data.model_url) setModelUrl(data.model_url);

            if (data.default_room_data) {
              const rd = data.default_room_data;
              if (rd.wallColors) setRoomColors((prev) => ({ ...prev, ...rd.wallColors }));
              if (rd.wallFinishes) setRoomFinishes((prev) => ({ ...prev, ...rd.wallFinishes }));
              if (rd.floorTexture) setActiveFloorTexture(rd.floorTexture);
            }

            if (data.camera_settings) {
              setSavedCameraConfig((prev) => ({
                ...prev,
                ...data.camera_settings,
              }));
            }

            if (data.lighting_settings) {
              let ls = data.lighting_settings;
              if (typeof ls === 'string') {
                try { ls = JSON.parse(ls); } catch { ls = {}; }
              }
              if (Array.isArray(ls) && ls.length > 0) {
                const firstObj = typeof ls[0] === 'object' ? ls[0] : {};
                setLightingSettings((prev) => ({ ...prev, ...firstObj }));
                if (firstObj.timeOfDay) setIsNightMode(firstObj.timeOfDay === 'night');
              } else if (typeof ls === 'object' && ls !== null) {
                setLightingSettings((prev) => ({ ...prev, ...ls }));
                if (ls.timeOfDay) setIsNightMode(ls.timeOfDay === 'night');
              }
            }

            if (data.global_environment?.isNightMode !== undefined) {
              setIsNightMode(data.global_environment.isNightMode);
            }
          }
        }
      } catch (err) {
        console.warn('Fallback hydration error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    hydratePlayground();
    return () => {
      isMounted = false;
    };
  }, [dynamicId]);

  // Save Master Template Setup to Database
  const handleSavePlaygroundSetup = async () => {
    setIsSaving(true);
    try {
      const bulbsList = lightingSettings.bulbs || [];
      const tod = isNightMode ? 'night' : (lightingSettings.timeOfDay || 'morning');

      const payload = {
        id: dynamicId,
        title: designTitle,
        model_url: modelUrl,
        camera_settings: savedCameraConfig,
        lighting_settings: {
          timeOfDay: tod,
          sunAzimuthOverride: lightingSettings.sunAzimuthOverride,
          sunElevationOverride: lightingSettings.sunElevationOverride,
          sunIntensityOverride: lightingSettings.sunIntensityOverride,
          ambientIntensityOverride: lightingSettings.ambientIntensityOverride,
          sunColorOverride: lightingSettings.sunColorOverride,
          bulbs: bulbsList,
        },
        default_room_data: {
          modelUrl,
          wallColors: roomColors,
          wallFinishes: roomFinishes,
          floorTexture: activeFloorTexture,
        },
        global_environment: {
          isNightMode,
          sunAzimuth: lightingSettings.sunAzimuthOverride,
          sunElevation: lightingSettings.sunElevationOverride,
          sunIntensity: lightingSettings.sunIntensityOverride,
          ambientIntensity: lightingSettings.ambientIntensityOverride,
          timeOfDay: tod,
        },
      };

      // 1. Save Master Catalog item to Neon Database
      const res = await fetch('/api/visualizations/catalog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || `Save returned HTTP ${res.status}`);
      }

      // 2. Sync Lightbulbs & Sun Setup globally to model_lighting_configs table in Neon DB
      await saveModelLightingConfigGlobal({
        modelUrl: modelUrl,
        sunAzimuth: lightingSettings.sunAzimuthOverride,
        sunElevation: lightingSettings.sunElevationOverride,
        sunIntensity: lightingSettings.sunIntensityOverride,
        ambientIntensity: lightingSettings.ambientIntensityOverride,
        timeOfDay: tod,
        bulbs: bulbsList,
      });

      showToast({
        message: '💾 Master Studio configuration saved to database successfully!',
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Playground save error:', err);
      showToast({
        message: `❌ Database save error: ${err.message || 'Unknown error'}`,
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 z-50 text-white font-mono">
        <div className="w-8 h-8 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase font-black tracking-widest text-[#FF8C38]">
          Loading Master Studio Playground...
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-neutral-950 overflow-hidden select-none">
      {/* 🚀 FLOATING MASTER ADMIN HEADER OVERLAY (POSITIONED BELOW MAIN SITE NAVBAR) */}
      <div className="absolute top-20 left-4 z-40 pointer-events-auto flex items-center gap-3 bg-neutral-950/90 backdrop-blur-2xl border border-neutral-800 px-4 py-2.5 rounded-2xl shadow-2xl">
        <button
          onClick={() => router.back()}
          className="w-7 h-7 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#FF8C38] text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all"
          title="Go Back"
        >
          ◀
        </button>
        <div>
          <h1 className="text-xs font-black uppercase text-white tracking-wide truncate max-w-[200px] sm:max-w-xs">
            {designTitle}
          </h1>
          <span className="text-[9px] font-mono text-[#FF8C38] block leading-none font-bold">
            👑 MASTER ADMIN PLAYGROUND STUDIO
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setDeleteModalOpen(true)}
            disabled={isDeleting}
            className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-neutral-950 border border-rose-500/30 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-1 shrink-0"
            title="Delete 3D Model Frame"
          >
            <span>{isDeleting ? 'DELETING...' : '🗑️ DELETE MODEL'}</span>
          </button>
          <button
            onClick={handleSavePlaygroundSetup}
            disabled={isSaving}
            className="px-4 py-1.5 bg-[#FF8C38] hover:bg-[#FF8C38] disabled:bg-orange-800 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <span>{isSaving ? 'SAVING...' : '💾 SAVE CONFIG TO DB'}</span>
          </button>
        </div>
      </div>

      {/* 🗑️ DELETE MODEL CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteModel}
        title="Delete 3D Model Frame"
        message={`Are you sure you want to permanently delete '${designTitle}'? This action will erase the layout from the catalog and cannot be undone.`}
        confirmText="Delete Model"
        cancelText="Cancel"
      />

      {/* 🟢 UNIFIED MASTER CANVAS VIEWPORT */}
      <div className="w-full h-full relative overflow-hidden bg-neutral-950">
        <PaintItMasterCanvas
          config={{
            mode: 'admin',
            modelUrl: modelUrl,
            timeOfDay: isNightMode ? 'night' : (lightingSettings.timeOfDay || 'morning'),
            sunAzimuthOverride: lightingSettings.sunAzimuthOverride,
            sunElevationOverride: lightingSettings.sunElevationOverride,
            sunIntensityOverride: lightingSettings.sunIntensityOverride,
            ambientIntensityOverride: lightingSettings.ambientIntensityOverride,
            sunColorOverride: lightingSettings.sunColorOverride,
            bulbs: lightingSettings.bulbs,
            activeWallColor: roomColors.wallFront || '#C4B199',
            activeWallFinish: (roomFinishes.wallFront as WallFinishType) || 'EMULSION',
            activeCeilingType: 'Ceiling_Cove',
            activeFloorTextureId: activeFloorTexture,
            wallSurfaceStates: {
              wall_back: {
                color: roomColors.wallBack || roomColors.wall_back || '#C4B199',
                finish: (roomFinishes.wallBack as WallFinishType) || 'EMULSION',
              },
              wall_left: {
                color: roomColors.wallLeft || roomColors.wall_left || '#C4B199',
                finish: (roomFinishes.wallLeft as WallFinishType) || 'EMULSION',
              },
              wall_right: {
                color: roomColors.wallRight || roomColors.wall_right || '#C4B199',
                finish: (roomFinishes.wallRight as WallFinishType) || 'EMULSION',
              },
              wall_front: {
                color: roomColors.wallFront || roomColors.wall_front || '#C4B199',
                finish: (roomFinishes.wallFront as WallFinishType) || 'EMULSION',
              },
              toilet: {
                color: roomColors.toilet || '#C4B199',
                finish: (roomFinishes.toilet as WallFinishType) || 'EMULSION',
              },
              ceiling: {
                color: roomColors.ceiling || '#FFFFFF',
                finish: 'EMULSION',
              },
            },
            enableAutoCutaway: true,
            isAdmin: true, // 👑 Full Master Admin lighting controls!
            hideLightingTab: false,
          }}
          savedCameraConfig={savedCameraConfig}
          onSaveCameraConfig={(camData) => {
            setSavedCameraConfig(camData);
          }}
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
            showToast({ message: '☀️ Lighting configuration locked in!', severity: 'success' });
          }}
          onConfigChange={(newCfg) => {
            if (newCfg.modelUrl) setModelUrl(newCfg.modelUrl);
            if (newCfg.bulbs) setLightingSettings((prev) => ({ ...prev, bulbs: newCfg.bulbs }));
            if (newCfg.timeOfDay) {
              setLightingSettings((prev) => ({ ...prev, timeOfDay: newCfg.timeOfDay as LightingPresetKey }));
              setIsNightMode(newCfg.timeOfDay === 'night');
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
    </div>
  );
}

export default function DedicatedPlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 z-50 font-mono text-white">
          <div className="w-6 h-6 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] tracking-widest text-[#FF8C38] uppercase font-black">
            Mounting Master Studio Playground...
          </span>
        </div>
      }
    >
      <PlaygroundCanvasContent />
    </Suspense>
  );
}
