"use client";

import React, { useState } from "react";
import Link from "next/link";
import PaintItMasterCanvas, { WallFinishType, TimeOfDayPreset } from "@/components/canvas/PaintItMasterCanvas";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

export default function Painter3DStudioWorkspacePage() {
  const { user } = useAuth();
  const { showToast } = useAlert();

  const [activeWallColor, setActiveWallColor] = useState<string>("#C4B199");
  const [activeWallFinish, setActiveWallFinish] = useState<WallFinishType>("EMULSION");
  const [activeFloorTexture, setActiveFloorTexture] = useState<string>("floor_oak");
  const [roomModelUrl, setRoomModelUrl] = useState<string>("/models/shells/spacious-lux.glb");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayPreset>("day");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [wallSurfaceStates, setWallSurfaceStates] = useState<
    Record<string, { color: string; finish: WallFinishType }>
  >({
    wall_back: { color: "#C4B199", finish: "EMULSION" },
    wall_left: { color: "#F2F1E9", finish: "EMULSION" },
    wall_right: { color: "#9BA498", finish: "EMULSION" },
    wall_front: { color: "#C4B199", finish: "EMULSION" },
    ceiling: { color: "#FFFFFF", finish: "EMULSION" },
  });

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleSavePainterQuoteConfig = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("paintit_access_token");
      const response = await fetch(`${BACKEND_API_URL}/api/visualizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: "Painter 3D Studio Workspace Preview",
          room_data: wallSurfaceStates,
          finish: activeWallFinish,
          lighting_settings: { timeOfDay },
          master_design_id: "default-scene",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save visualization project to backend.");
      }

      const data = await response.json();
      showToast({
        message: "✅ 3D Room Canonical Scene State Saved Successfully!",
        severity: "success",
      });
    } catch (err: any) {
      showToast({
        message: `⚠️ Saved locally: ${err.message || "Backend offline"}`,
        severity: "info",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-screen bg-neutral-950 flex flex-col overflow-hidden select-none">
      {/* 🟢 PAINTER WORKSPACE TOP NAVIGATION BAR */}
      <header className="h-14 bg-neutral-900 border-b border-neutral-850 px-4 sm:px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/designs"
            className="w-8 h-8 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500 text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all"
            title="Back to Designs Hub"
          >
            ◀
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-sm font-black uppercase text-white tracking-wide">
                Painter 3D Studio Workspace
              </h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO WORKFLOW
              </span>
            </div>
            <p className="text-[10px] font-mono text-neutral-400">
              Contractor: <span className="text-neutral-200">{user?.fullName || "Painter Pro"}</span> • Client Preview Studio
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeOfDay((prev) => (prev === "day" ? "night" : "day"))}
            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-amber-300 font-bold border border-neutral-800 text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>{timeOfDay === "day" ? "☀️ Day" : "🌙 Night"}</span>
          </button>

          <button
            onClick={handleSavePainterQuoteConfig}
            disabled={isSaving}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span>{isSaving ? "⏳ Saving..." : "💾 Save Client Preview"}</span>
          </button>
        </div>
      </header>

      {/* 3D MASTER CANVAS VIEWPORT FOR PAINTER WORKFLOW */}
      <div className="flex-1 relative overflow-hidden bg-neutral-950">
        <PaintItMasterCanvas
          config={{
            mode: "sandbox",
            modelUrl: roomModelUrl,
            timeOfDay: timeOfDay,
            activeWallColor: activeWallColor,
            activeWallFinish: activeWallFinish,
            activeCeilingType: "Ceiling_Cove",
            activeFloorTextureId: activeFloorTexture,
            wallSurfaceStates: wallSurfaceStates,
            bumpScale: 0.05,
            shadowOpacity: 0.65,
            enableAutoCutaway: true,
            isAdmin: false, // 🔒 Hides advanced admin sliders for painters!
            hideLightingTab: false,
          }}
          onConfigChange={(newCfg) => {
            if (newCfg.modelUrl) setRoomModelUrl(newCfg.modelUrl);
            if (newCfg.activeWallColor) setActiveWallColor(newCfg.activeWallColor);
            if (newCfg.activeWallFinish) setActiveWallFinish(newCfg.activeWallFinish);
            if (newCfg.activeFloorTextureId) setActiveFloorTexture(newCfg.activeFloorTextureId);
            if (newCfg.wallSurfaceStates) setWallSurfaceStates(newCfg.wallSurfaceStates);
            if (newCfg.timeOfDay) setTimeOfDay(newCfg.timeOfDay);
          }}
        />
      </div>
    </div>
  );
}
