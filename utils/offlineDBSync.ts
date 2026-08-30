"use client";

import { CameraConfigPayload } from "@/components/canvas/master/MasterCameraRig";
import { WallFinishType } from "@/components/canvas/PaintItMasterCanvas";

const API_BASE_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

export interface RoomDataPayload {
  modelUrl: string;
  wallColors: Record<string, string>;
  wallFinishes: Record<string, WallFinishType>;
  floorTexture?: string;
  cameraSettings?: Partial<CameraConfigPayload>;
  isNightMode?: boolean;
}

export interface VisualizationSavePayload {
  id?: string;
  name: string;
  parent_template_id?: string | null;
  room_data: RoomDataPayload;
  camera_settings?: Partial<CameraConfigPayload>;
  lighting_settings?: Record<string, unknown> | unknown;
  is_pending_sync?: boolean;
  timestamp?: number;
}

export interface CustomPaintItem {
  name: string;
  code: string;
  hex: string;
  isCustom?: boolean;
  is_pending_sync?: boolean;
}

// ============================================================================
// 1. LOCAL STORAGE & INDEXEDDB CACHE HELPERS
// ============================================================================
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to store ${key} in localStorage:`, err);
  }
}

// ============================================================================
// 2. ONLINE / OFFLINE DETECTOR
// ============================================================================
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

export async function pingBackendHealth(): Promise<boolean> {
  if (!isOnline()) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// 3. DUAL-MODE VISUALIZATION SAVE (ONLINE DB + OFFLINE FALLBACK)
// ============================================================================
export async function saveVisualizationSync(
  payload: VisualizationSavePayload,
  accessToken?: string | null
): Promise<{ id: string; isOffline: boolean; message: string }> {
  const isHealthy = await pingBackendHealth();

  if (isHealthy) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/visualizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const serverId = data.id || data.visualization?.id || payload.id;

        // Cache server version locally
        const cached = getLocalItem<VisualizationSavePayload[]>("paintit_offline_visualizations", []);
        const filtered = cached.filter((item) => item.id !== serverId && item.id !== payload.id);
        filtered.push({ ...payload, id: serverId, is_pending_sync: false });
        setLocalItem("paintit_offline_visualizations", filtered);

        return { id: serverId, isOffline: false, message: "✅ Synced cleanly with backend database!" };
      }
    } catch (err) {
      console.warn("Backend save endpoint rejected. Falling back to offline cache...", err);
    }
  }

  // 🔒 Offline mode save
  const offlineId = payload.id || `offline_vis_${Date.now()}`;
  const offlinePayload: VisualizationSavePayload = {
    ...payload,
    id: offlineId,
    is_pending_sync: true,
    timestamp: Date.now(),
  };

  const cached = getLocalItem<VisualizationSavePayload[]>("paintit_offline_visualizations", []);
  const updated = cached.filter((item) => item.id !== offlineId);
  updated.push(offlinePayload);
  setLocalItem("paintit_offline_visualizations", updated);

  return {
    id: offlineId,
    isOffline: true,
    message: "💾 Saved locally! (Will automatically upload to DB when connection restores)",
  };
}

// ============================================================================
// 4. DUAL-MODE VISUALIZATION HYDRATION (ONLINE DB + OFFLINE CACHE)
// ============================================================================
export async function fetchVisualizationSync(
  id: string,
  accessToken?: string | null
): Promise<{ data: VisualizationSavePayload | null; isOffline: boolean }> {
  const isHealthy = await pingBackendHealth();

  if (isHealthy) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/visualizations/${id}`, {
        method: "GET",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        const vis = json.visualization || json.data || json;
        const normalized: VisualizationSavePayload = {
          id: vis.id || id,
          name: vis.name || vis.title || "Custom Room Concept",
          room_data: vis.room_data || vis.roomData || {},
          camera_settings: vis.camera_settings || vis.cameraSettings || undefined,
        };

        // Cache fetched visualization locally
        const cached = getLocalItem<VisualizationSavePayload[]>("paintit_offline_visualizations", []);
        const filtered = cached.filter((item) => item.id !== id);
        filtered.push(normalized);
        setLocalItem("paintit_offline_visualizations", filtered);

        return { data: normalized, isOffline: false };
      }
    } catch (err) {
      console.warn(`Failed online fetch for visualization ${id}, trying local cache...`, err);
    }
  }

  // Fallback to local cache
  const cached = getLocalItem<VisualizationSavePayload[]>("paintit_offline_visualizations", []);
  const found = cached.find((item) => item.id === id);

  return { data: found || null, isOffline: true };
}

// ============================================================================
// 5. DUAL-MODE CUSTOM PAINTS CATALOG SYNC
// ============================================================================
export async function saveCustomPaintSync(
  paintItem: CustomPaintItem
): Promise<{ isOffline: boolean }> {
  const cached = getLocalItem<CustomPaintItem[]>("paintit_custom_paints", []);
  const exists = cached.some((p) => p.hex.toLowerCase() === paintItem.hex.toLowerCase());

  const paintToSave: CustomPaintItem = {
    ...paintItem,
    isCustom: true,
    is_pending_sync: true,
  };

  if (!exists) {
    setLocalItem("paintit_custom_paints", [...cached, paintToSave]);
  }

  const isHealthy = await pingBackendHealth();
  if (isHealthy) {
    try {
      await fetch(`${API_BASE_URL}/api/visualizations/catalog/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_paint: paintItem,
        }),
      });
      // Mark pending sync as false
      const latest = getLocalItem<CustomPaintItem[]>("paintit_custom_paints", []);
      const marked = latest.map((p) => (p.hex === paintItem.hex ? { ...p, is_pending_sync: false } : p));
      setLocalItem("paintit_custom_paints", marked);
      return { isOffline: false };
    } catch {
      console.warn("Backend paint catalog save failed; saved in offline queue.");
    }
  }

  return { isOffline: true };
}

export function getCustomPaintsSync(): CustomPaintItem[] {
  return getLocalItem<CustomPaintItem[]>("paintit_custom_paints", []);
}

// ============================================================================
// 6. AUTOMATIC BACKGROUND RE-SYNC ON NETWORK RECONNECT
// ============================================================================
export async function triggerPendingOfflineSync(accessToken?: string | null): Promise<void> {
  const isHealthy = await pingBackendHealth();
  if (!isHealthy) return;

  // 1. Sync pending offline visualizations
  const cachedVis = getLocalItem<VisualizationSavePayload[]>("paintit_offline_visualizations", []);
  const pendingVis = cachedVis.filter((v) => v.is_pending_sync);

  for (const vis of pendingVis) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/visualizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          name: vis.name,
          parent_template_id: vis.parent_template_id,
          room_data: vis.room_data,
          camera_settings: vis.camera_settings,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const serverId = data.id || vis.id;
        vis.is_pending_sync = false;
        vis.id = serverId;
      }
    } catch (err) {
      console.warn(`Background sync failed for visualization ${vis.name}:`, err);
    }
  }

  setLocalItem("paintit_offline_visualizations", cachedVis);

  // 2. Sync pending custom paints
  const cachedPaints = getLocalItem<CustomPaintItem[]>("paintit_custom_paints", []);
  const pendingPaints = cachedPaints.filter((p) => p.is_pending_sync);

  for (const paint of pendingPaints) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/visualizations/catalog/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_paint: paint }),
      });
      if (res.ok) {
        paint.is_pending_sync = false;
      }
    } catch (err) {
      console.warn(`Background sync failed for paint ${paint.name}:`, err);
    }
  }

  setLocalItem("paintit_custom_paints", cachedPaints);
}

// ============================================================================
// 7. GLOBAL RECONNECT EVENT LISTENER INIT
// ============================================================================
export function initOfflineOnlineListener(accessToken?: string | null): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => {
    console.log("🌐 Network reconnected! Triggering background offline DB sync...");
    triggerPendingOfflineSync(accessToken);
  };

  window.addEventListener("online", handleOnline);

  // Trigger initial sync attempt on mount if online
  if (navigator.onLine) {
    triggerPendingOfflineSync(accessToken);
  }

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
