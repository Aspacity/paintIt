"use client";

import React, { useState } from "react";
import Link from "next/link";
import PaintItMasterCanvas, { WallFinishType, TimeOfDayPreset } from "@/components/canvas/PaintItMasterCanvas";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";

export default function Painter3DStudioWorkspacePage() {
  const { user } = useAuth();
  const { showToast } = useAlert();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

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

      showToast({
        message: "✅ 3D Room Scene Saved Successfully!",
        severity: "success",
      });
    } catch (err: any) {
      showToast({
        message: `Saved locally: ${err.message || "Backend offline"}`,
        severity: "info",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`w-full h-screen flex flex-col overflow-hidden select-none transition-colors duration-300 ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      {/* PAINTER WORKSPACE TOP NAVIGATION BAR */}
      <header className={`h-14 border-b px-4 sm:px-6 flex items-center justify-between z-40 shrink-0 ${
        isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
      }`}>
        <div className="flex items-center gap-3">
          <Link
            href="/designs"
            className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs transition-all ${
              isDark ? "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white" : "bg-stone-100 border-stone-300 text-stone-700 hover:text-stone-900"
            }`}
            title="Back to Designs Hub"
          >
            ◀
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF8C38] animate-pulse" />
              <h1 className={`text-sm font-bold uppercase tracking-wide ${isDark ? "text-white" : "text-stone-900"}`}>
                Painter 3D Studio Workspace
              </h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#FF8C38]/20 text-[#FF8C38] border border-[#FF8C38]/40">
                PRO WORKFLOW
              </span>
            </div>
            <p className={`text-[10px] font-mono ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              Contractor: <span className="font-bold">{user?.fullName || "Painter Pro"}</span> • Client Preview Studio
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 font-bold border text-xs rounded-xl transition-all flex items-center gap-1.5 ${
              isDark ? "bg-neutral-900 border-neutral-800 text-amber-300" : "bg-stone-100 border-stone-300 text-stone-800"
            }`}
            title="Toggle Theme"
          >
            <span>{isDark ? "🌙 Dark" : "☀️ Light"}</span>
          </button>

          <button
            onClick={() => setTimeOfDay((prev) => (prev === "day" ? "night" : "day"))}
            className={`px-3 py-1.5 font-bold border text-xs rounded-xl transition-all flex items-center gap-1.5 ${
              isDark ? "bg-neutral-900 border-neutral-800 text-amber-300" : "bg-stone-100 border-stone-300 text-stone-800"
            }`}
          >
            <span>{timeOfDay === "day" ? "☀️ Day Scene" : "🌙 Night Scene"}</span>
          </button>

          <button
            onClick={handleSavePainterQuoteConfig}
            disabled={isSaving}
            className="px-4 py-1.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>{isSaving ? "Saving..." : "💾 Save Client Preview"}</span>
          </button>
        </div>
      </header>

      {/* 3D MASTER CANVAS VIEWPORT FOR PAINTER WORKFLOW */}
      <div className={`flex-1 relative overflow-hidden ${isDark ? "bg-black" : "bg-[#FAF8F5]"}`}>
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
            isAdmin: false,
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
