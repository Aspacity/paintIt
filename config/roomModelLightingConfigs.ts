import { BulbState } from "@/components/canvas/LightControls";
import { CameraConfigPayload } from "@/components/canvas/master/MasterCameraRig";

export interface ModelLightingConfig {
  modelUrl: string;
  sunAzimuth?: number;
  sunElevation?: number;
  sunIntensity?: number;
  ambientIntensity?: number;
  timeOfDay?: string;
  bulbs: BulbState[];
  cameraSettings?: CameraConfigPayload | null;
}

/**
 * Permanent Registry for 3D Room Model Lighting & Bulb Configurations.
 * Binds exact 3D light bulb positions, colors, intensities, ranges, and sun setups to model URLs.
 */
export const ROOM_MODEL_LIGHTING_REGISTRY: Record<string, ModelLightingConfig> = {
  // 🛋️ 1. Spacious Luxury Lounge
  "/models/shells/spacious-lux.glb": {
    modelUrl: "/models/shells/spacious-lux.glb",
    sunAzimuth: 135,
    sunElevation: 35,
    sunIntensity: 2.8,
    ambientIntensity: 0.65,
    timeOfDay: "morning",
    bulbs: [
      {
        id: "spacious-ceiling-1",
        name: "Central Chandelier Lamp",
        type: "point",
        position: [0, 2.7, 0],
        color: "#fff4e5",
        intensity: 4.5,
        enabled: true,
        visible: true,
        distance: 18,
      },
      {
        id: "spacious-spot-cove-1",
        name: "Cove Perimeter Spotlight",
        type: "spot",
        position: [-2.2, 2.8, 1.5],
        color: "#ffffff",
        intensity: 5.5,
        enabled: true,
        visible: true,
        distance: 15,
      },
    ],
  },

  // 📺 2. Luxurious TV Living Suite
  "/models/shells/lux-livingroom.glb": {
    modelUrl: "/models/shells/lux-livingroom.glb",
    sunAzimuth: 140,
    sunElevation: 40,
    sunIntensity: 3.2,
    ambientIntensity: 0.75,
    timeOfDay: "morning",
    bulbs: [
      {
        id: "tv-backlight-strip",
        name: "TV Panel LED Backlight",
        type: "point",
        position: [0, 1.4, -2.8],
        color: "#ffe4b5",
        intensity: 6.0,
        enabled: true,
        visible: true,
        distance: 8,
      },
      {
        id: "tv-living-ceiling",
        name: "Living Room Main Ceiling Spot",
        type: "spot",
        position: [0, 2.7, 0],
        color: "#ffffff",
        intensity: 4.8,
        enabled: true,
        visible: true,
        distance: 20,
      },
    ],
  },

  // 🪟 3. Living Room (Window View)
  "/models/shells/livingroom-shell(window).glb": {
    modelUrl: "/models/shells/livingroom-shell(window).glb",
    sunAzimuth: 125,
    sunElevation: 30,
    sunIntensity: 3.0,
    ambientIntensity: 0.6,
    timeOfDay: "morning",
    bulbs: [
      {
        id: "window-living-ceiling",
        name: "Window Bay Ceiling Lamp",
        type: "point",
        position: [0, 2.6, 0],
        color: "#fffaed",
        intensity: 4.0,
        enabled: true,
        visible: true,
        distance: 16,
      },
    ],
  },
};

/**
 * Synchronously retrieves cached lighting configuration from LocalStorage or code fallback.
 */
export function getSavedModelLightingConfig(modelUrl: string): ModelLightingConfig | null {
  if (!modelUrl) return null;

  // 1. Try LocalStorage dynamic cache
  if (typeof window !== "undefined") {
    try {
      const storageKey = `paintit_model_lighting_registry_${modelUrl}`;
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.bulbs)) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
  }

  // 2. Fallback to hardcoded committed registry
  if (ROOM_MODEL_LIGHTING_REGISTRY[modelUrl]) {
    return ROOM_MODEL_LIGHTING_REGISTRY[modelUrl];
  }

  return null;
}

/**
 * Asynchronously fetches global online lightbulb & sun configuration from Neon PostgreSQL Database.
 */
export async function fetchOnlineModelLightingConfig(modelUrl: string): Promise<ModelLightingConfig | null> {
  if (!modelUrl) return null;

  try {
    const res = await fetch(`/api/models/lighting?model_url=${encodeURIComponent(modelUrl)}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (Array.isArray(data.bulbs) || data.cameraSettings)) {
        const config: ModelLightingConfig = {
          modelUrl: data.modelUrl || modelUrl,
          sunAzimuth: data.sunAzimuth,
          sunElevation: data.sunElevation,
          sunIntensity: data.sunIntensity,
          ambientIntensity: data.ambientIntensity,
          timeOfDay: data.timeOfDay,
          bulbs: data.bulbs || [],
          cameraSettings: data.cameraSettings || null,
        };

        // Cache in LocalStorage and memory registry
        saveModelLightingConfigLocal(config);
        return config;
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to fetch global model lighting from Neon Database:", err);
  }

  return getSavedModelLightingConfig(modelUrl);
}

/**
 * Saves/Updates local cache in LocalStorage & memory registry.
 */
export function saveModelLightingConfigLocal(config: ModelLightingConfig): void {
  if (!config.modelUrl) return;

  if (typeof window !== "undefined") {
    try {
      const storageKey = `paintit_model_lighting_registry_${config.modelUrl}`;
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch (err) {
      console.warn("Failed to persist model lighting config to LocalStorage:", err);
    }
  }

  ROOM_MODEL_LIGHTING_REGISTRY[config.modelUrl] = config;
}

/**
 * Saves the lightbulb and sun configuration globally to Neon PostgreSQL Database AND local cache.
 */
export async function saveModelLightingConfigGlobal(config: ModelLightingConfig): Promise<boolean> {
  if (!config.modelUrl) return false;

  // 1. Update local cache immediately
  saveModelLightingConfigLocal(config);

  // 2. Persist globally to Neon PostgreSQL Database via API
  try {
    const res = await fetch("/api/models/lighting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (res.ok) {
      console.log("🌐 Lightbulb & Sun configuration saved globally to Neon Cloud DB!");
      return true;
    }
  } catch (err) {
    console.warn("⚠️ Failed to sync lightbulb setup to online Neon Database:", err);
  }

  return false;
}
