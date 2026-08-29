"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import { StepOnboarding } from "@/components/ui/StepOnboarding";
import { OnboardingStep } from "@/types/index";

interface SavedVisualization {
  id: string;
  name: string;
  parent_template_name: string;
  room_data: Record<string, string> | string;
  created_at: string;
}

export default function HomeownerClientHubDashboard() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const [savedDesigns, setSavedDesigns] = useState<SavedVisualization[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const clientOnboardingSteps: OnboardingStep[] = [
    { id: 1, label: "Explore Catalogs", description: "Browse verified local painters and contractors." },
    { id: 2, label: "Select 3D Room", description: "Choose a room design template from the public 3D catalog." },
    { id: 3, label: "Remix Custom Colors", description: "Change wall paint combinations in real-time under natural light." },
    { id: 4, label: "Request a Quote", description: "Save your remixed scheme and share it with your painter to lock in a bid." }
  ];

  // FETCH SAVED VISUALIZATIONS FROM BACKEND
  useEffect(() => {
    const fetchSavedVisualizations = async () => {
      const activeToken =
        accessToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("paintit_access_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken")
          : null);

      if (!activeToken) {
        setIsLoadingData(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_API_URL}/api/visualizations`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${activeToken}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSavedDesigns(data.visualizations || []);
        }
      } catch (err) {
        console.error("Failed fetching client saved designs:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSavedVisualizations();
  }, [accessToken, BACKEND_API_URL]);

  // DELETE SAVED DESIGN
  const handleDeleteDesign = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const activeToken =
      accessToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("paintit_access_token") ||
        localStorage.getItem("token")
        : null);

    if (!activeToken) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/visualizations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setSavedDesigns((prev) => prev.filter((design) => design.id !== id));
        showToast({ message: "Design removed from your Hub.", severity: "success" });
      } else {
        showToast({ message: "Failed to delete design layout.", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "Network connection error.", severity: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleExploreMarketplace = () => {
    router.push("/search/designs");
  };

  // LOADING GUARD
  if (authLoading || isLoadingData) {
    return (
      <div className={`w-full min-h-[75vh] flex flex-col items-center justify-center space-y-3 ${
        isDark ? "text-white" : "text-stone-900"
      }`}>
        <div className="w-6 h-6 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
        <span className={`text-[10px] uppercase font-bold tracking-widest ${
          isDark ? "text-neutral-500" : "text-stone-500"
        }`}>
          Syncing PaintIT Hub...
        </span>
      </div>
    );
  }

  let clientName = "Homeowner";
  if (user) {
    clientName = user.fullName ?? (user as { name?: string }).name ?? user.full_name ?? "Homeowner";
  } else if (typeof window !== "undefined") {
    const rawUser = localStorage.getItem("paintit_user_data");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        clientName = parsed.fullName || parsed.full_name || parsed.name || "Homeowner";
      } catch {
        clientName = "Homeowner";
      }
    }
  }
  const structuralFirstName = clientName.split(" ")[0];

  return (
    <div className="w-full min-h-[75vh] flex flex-col justify-between animate-fade-in max-w-md mx-auto md:max-w-none pb-8">

      {/* Top Header Section */}
      <div className={`border-b pb-4 mb-4 flex items-center justify-between ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>
        <div>
          <h1 className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
            Welcome back, <span className="text-[#FF8C38]">{structuralFirstName}</span>!
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Visualize adjustments, manage room concepts, and connect with verified painters.
          </p>
        </div>
        <button
          onClick={handleExploreMarketplace}
          className="px-4 py-2 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
        >
          + New Design
        </button>
      </div>

      {/* Dynamic Data Handler */}
      {savedDesigns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-4">
          <StepOnboarding
            title="Your Design Hub is Empty!"
            subtitle="Follow these quick steps to model your space using interactive 3D color presets."
            steps={clientOnboardingSteps}
            ctaText="Browse 3D Designs"
            onCtaClick={handleExploreMarketplace}
            estimatedMinutes={2}
          />
        </div>
      ) : (
        <div className="space-y-3 my-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-neutral-400" : "text-stone-500"
            }`}>
              Saved Room Concepts ({savedDesigns.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDesigns.map((design) => {
              let parsedColors: Record<string, string> = {};
              if (typeof design.room_data === "string") {
                try {
                  parsedColors = JSON.parse(design.room_data);
                } catch {
                  parsedColors = {};
                }
              } else if (design.room_data && typeof design.room_data === "object") {
                parsedColors = design.room_data;
              }

              const fallbackWall = parsedColors["wallBack"] || parsedColors["wallLeft"] || parsedColors["wallRight"] || "#5C6B73";
              const fallbackFloor = parsedColors["floor"] || "#C4B199";
              const fallbackCeiling = parsedColors["ceiling"] || "#F2EFE9";

              return (
                <div
                  key={design.id}
                  onClick={() => router.push(`/view/${design.id}`)}
                  className={`group border p-4 rounded-2xl flex flex-col justify-between cursor-pointer shadow-md transition-all duration-200 space-y-4 ${
                    isDark
                      ? "bg-neutral-950 border-neutral-900 hover:border-[#FF8C38]/50"
                      : "bg-white border-stone-200 hover:border-[#FF8C38]"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Mockup Preview */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/90 border border-neutral-800 flex items-center justify-center shadow-inner">
                      <div className="absolute inset-0 flex flex-col">
                        <div
                          className="h-1/4 w-full border-b border-black/10 transition-colors duration-300 shadow-sm"
                          style={{ backgroundColor: fallbackCeiling }}
                        />
                        <div className="flex-1 flex">
                          <div
                            className="w-1/2 h-full border-r border-black/10 transition-colors duration-300"
                            style={{ backgroundColor: parsedColors["wallLeft"] || fallbackWall }}
                          />
                          <div className="w-1/2 h-full flex flex-col">
                            <div
                              className="h-1/2 w-full transition-colors duration-300"
                              style={{ backgroundColor: parsedColors["wallBack"] || fallbackWall }}
                            />
                            <div
                              className="h-1/2 w-full transition-colors duration-300 border-t border-black/5"
                              style={{ backgroundColor: fallbackFloor }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Color Swatch Badges */}
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-hidden pointer-events-none drop-shadow-md">
                        {Object.entries(parsedColors).slice(0, 4).map(([surface, hex]) => (
                          <div
                            key={surface}
                            className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-sm shrink-0"
                            style={{ backgroundColor: hex }}
                            title={`${surface}: ${hex}`}
                          />
                        ))}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-[#FF8C38] text-black px-3 py-1.5 rounded-lg shadow-lg">
                          Launch View
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#FF8C38] block mb-0.5">
                          {design.parent_template_name || "Custom Preset"}
                        </span>
                        <h4 className={`text-xs font-bold uppercase tracking-wide truncate ${
                          isDark ? "text-white group-hover:text-[#FF8C38]" : "text-stone-900 group-hover:text-[#FF8C38]"
                        }`}>
                          {design.name || "Untitled Concept"}
                        </h4>
                      </div>
                      <button
                        onClick={(e) => handleDeleteDesign(e, design.id)}
                        disabled={deletingId === design.id}
                        className="text-neutral-500 hover:text-red-500 text-xs p-1 rounded transition-colors shrink-0"
                        title="Delete Design"
                      >
                        {deletingId === design.id ? "⌛" : "🗑️"}
                      </button>
                    </div>

                  </div>

                  <div className={`flex items-center justify-between pt-3 border-t text-[10px] font-medium ${
                    isDark ? "border-neutral-900 text-neutral-500" : "border-stone-200 text-stone-500"
                  }`}>
                    <span className="font-mono">
                      {new Date(design.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-[#FF8C38] font-bold uppercase tracking-wider group-hover:underline flex items-center gap-0.5">
                      Open Design &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Signpost */}
      <div className={`p-4 border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs mt-auto ${
        isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
      }`}>
        <span className={`font-medium text-xs text-center sm:text-left ${
          isDark ? "text-neutral-400" : "text-stone-600"
        }`}>
          Need professional painting execution for your concept?
        </span>
        <a
          href="/search/painters"
          className="text-[#FF8C38] font-bold hover:underline transition-all text-xs shrink-0"
        >
          Hire Verified Painter &rarr;
        </a>
      </div>

    </div>
  );
}