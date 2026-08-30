"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import ConfirmModal from "@/components/modals/ConfirmModal";

interface MasterTemplate {
  id: string;
  title: string;
  category: string;
  model_url: string;
  plan_type: string;
  price: string;
  thumbnail_icon: string;
}

interface SavedVisualization {
  id: string;
  name: string;
  parent_template_name: string;
  room_data: unknown;
  created_at: string;
}

export default function Painter3DStudioDashboardHub() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [catalog, setCatalog] = useState<MasterTemplate[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<SavedVisualization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Modal Configuration States Tracker
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalSuccess, setModalSuccess] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MasterTemplate | null>(null);

  // Deletion Tracking Parameters
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [designTargetForDelete, setDesignTargetForDelete] = useState<SavedVisualization | null>(null);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    let isMounted = true;

    const loadDashboardStudioData = async () => {
      if (!accessToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const fallbackCatalog: MasterTemplate[] = [
          { id: "tmpl_living_lux", title: "Luxury Minimalist Living Room", category: "INTERIOR", model_url: "", plan_type: "FREE", price: "0.00", thumbnail_icon: "🛋️" },
          { id: "tmpl_bed_nordic", title: "Nordic Executive Bedroom Layout", category: "INTERIOR", model_url: "", plan_type: "RENTAL", price: "2500.00", thumbnail_icon: "🛏️" },
          { id: "tmpl_office_corp", title: "Corporate Creative Office", category: "COMMERCIAL", model_url: "", plan_type: "BUY", price: "6000.00", thumbnail_icon: "🏢" },
          { id: "tmpl_accent_geometric", title: "Geometric POP Accent Wall", category: "ACCENT", model_url: "", plan_type: "FREE", price: "0.00", thumbnail_icon: "📐" }
        ];

        const catalogRes = await fetch(`${BACKEND_API_URL}/api/visualizations/catalog`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).catch(() => null);

        if (isMounted) {
          if (catalogRes && catalogRes.ok) {
            const catData = await catalogRes.json();
            setCatalog(catData.catalog?.length ? catData.catalog : fallbackCatalog);
          } else {
            setCatalog(fallbackCatalog);
          }
        }

        const savedRes = await fetch(`${BACKEND_API_URL}/api/visualizations`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }).catch(() => null);

        if (isMounted && savedRes && savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedDesigns(savedData.visualizations || []);
        }

      } catch (err) {
        console.error("3D Studio data processing exception:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardStudioData();

    return () => { isMounted = false; };
  }, [accessToken, BACKEND_API_URL]);

  useEffect(() => {
    if (!redirectUrl) return;
    window.location.href = redirectUrl;
  }, [redirectUrl]);

  const shareToWhatsAppStream = async (design: SavedVisualization) => {
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/visualizations/${design.id}/share`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        const whatsappText = encodeURIComponent(
          `Hello! Check out the custom 3D wall color scheme layout I designed for your property on PaintIT: ${window.location.origin}/view/${data.shareId}`
        );
        window.open(`https://wa.me/?text=${whatsappText}`, "_blank");
        showToast({ message: "WhatsApp link generated successfully.", severity: "success" });
      } else {
        throw new Error("Sharing endpoint failure.");
      }
    } catch (err) {
      console.error("Link generation failure:", err);
      navigator.clipboard.writeText(`${window.location.origin}/workspace?id=${design.id}`);
      showToast({ message: "Workspace URL copied to clipboard.", severity: "info" });
    }
  };

  const handleLaunchRequest = (template: MasterTemplate) => {
    setSelectedTemplate(template);
    setModalSuccess(false);
    setModalOpen(true);
  };

  const executeTemplateLoad = () => {
    if (!selectedTemplate) return;
    setModalSuccess(true);
    setTimeout(() => {
      setModalOpen(false);
      setRedirectUrl(`/workspace?template=${selectedTemplate.id}`);
    }, 1500);
  };

  const initializeDeleteWorkflow = (e: React.MouseEvent, design: SavedVisualization) => {
    e.preventDefault();
    e.stopPropagation();
    setDesignTargetForDelete(design);
    setDeleteOpen(true);
  };

  const commitDeletionToDatabase = async () => {
    if (!designTargetForDelete) return;

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/visualizations/${designTargetForDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });

      if (res.ok) {
        setSavedDesigns((prev) => prev.filter(item => item.id !== designTargetForDelete.id));
        showToast({ message: "Project mockup deleted.", severity: "success" });
      } else {
        showToast({ message: "Failed removing entry.", severity: "error" });
      }
    } catch (err) {
      console.error("Delete exception:", err);
    }
  };

  const filteredCatalog = catalog.filter(item => activeTab === "ALL" || item.category === activeTab);

  if (isLoading) {
    return (
      <div className={`min-h-[50vh] w-full flex flex-col items-center justify-center gap-3 ${
        isDark ? "text-white" : "text-stone-900"
      }`}>
        <div className="w-5 h-5 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
        <span className={`text-[10px] uppercase font-bold tracking-widest ${
          isDark ? "text-neutral-500" : "text-stone-500"
        }`}>Opening 3D Studio...</span>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-8 animate-fade-in pb-16 transition-colors duration-300 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* HEADER SECTION */}
      <div className={`border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>
        <div>
          <h1 className={`text-xl font-bold uppercase tracking-tight flex items-center gap-2 ${
            isDark ? "text-white" : "text-stone-900"
          }`}>
            <span>3D Design Studio</span>
            <span className="px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#FF8C38]/20 text-[#FF8C38] border border-[#FF8C38]/40">
              PAINTER PRO
            </span>
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Select 3D rooms, experiment with dynamic color variations, and share realistic visualizations with clients.
          </p>
        </div>

        <Link
          href="/designs/workspace"
          className="px-5 py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          <span>🎨 Open 3D Studio Canvas ➔</span>
        </Link>
      </div>

      {/* ZONE 1: PAINTER'S SAVED WORKSPACES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pl-1">
          <h2 className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? "text-neutral-400" : "text-stone-600"
          }`}>Your Saved Color Concepts</h2>
          <span className={`text-[10px] border font-mono px-2 py-0.5 rounded-md font-bold ${
            isDark ? "bg-neutral-900 border-neutral-800 text-neutral-400" : "bg-stone-100 border-stone-300 text-stone-700"
          }`}>
            {savedDesigns.length} Mockups
          </span>
        </div>

        {savedDesigns.length === 0 ? (
          <div className={`p-10 border border-dashed rounded-3xl text-center space-y-3 flex flex-col items-center justify-center max-w-md mx-auto ${
            isDark ? "bg-neutral-950/40 border-neutral-900" : "bg-white border-stone-300"
          }`}>
            <span className="text-2xl select-none opacity-40">🎨</span>
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wide ${
                isDark ? "text-neutral-300" : "text-stone-800"
              }`}>Your custom designs library is empty</h4>
              <p className={`text-xs leading-relaxed max-w-xs mx-auto mt-1 ${
                isDark ? "text-neutral-500" : "text-stone-500"
              }`}>
                Pick an available room model from the catalog below to apply your color schemes, then save them here for quick client viewing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("catalog-section-scroller")?.scrollIntoView({ behavior: "smooth" })}
              className={`px-4 py-2 text-[#FF8C38] text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-stone-100 border-stone-300"
              }`}
            >
              ↓ View Room Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDesigns.map((design) => (
              <div
                key={design.id}
                className={`group p-5 border rounded-2xl flex flex-col justify-between shadow-md transition-all duration-150 relative ${
                  isDark
                    ? "bg-neutral-950 border-neutral-900 hover:border-[#FF8C38]/50"
                    : "bg-white border-stone-200 hover:border-[#FF8C38]"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => initializeDeleteWorkflow(e, design)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase transition-colors"
                  title="Delete layout concept"
                >
                  ✕ Delete
                </button>

                <div className="space-y-3 pr-12">
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wide group-hover:text-[#FF8C38] transition-colors truncate ${
                      isDark ? "text-white" : "text-stone-900"
                    }`}>
                      {design.name}
                    </h4>
                    <p className={`text-[11px] mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                      Template: <span className="font-bold">{design.parent_template_name}</span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>
                    Created: {new Date(design.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <div className={`flex gap-2 pt-4 mt-4 border-t ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
                  <button
                    type="button"
                    onClick={() => { window.location.href = `/workspace?id=${design.id}`; }}
                    className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                      isDark
                        ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-white"
                        : "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-900"
                    }`}
                  >
                    Open Canvas ➔
                  </button>
                  <button
                    type="button"
                    onClick={() => shareToWhatsAppStream(design)}
                    className="px-3.5 py-2 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center shrink-0"
                  >
                    💬 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ZONE 2: 3D ROOM CATALOG */}
      <div id="catalog-section-scroller" className={`space-y-4 pt-6 border-t ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-1">
          <div>
            <h2 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              Available 3D Room Templates
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              Load pre-built structures straight into the 3D visualizer canvas.
            </p>
          </div>

          <div className={`flex border p-1 rounded-xl w-fit self-start sm:self-auto ${
            isDark ? "bg-neutral-950 border-neutral-900" : "bg-stone-100 border-stone-300"
          }`}>
            {["ALL", "INTERIOR", "COMMERCIAL", "ACCENT"].map((categoryKey) => (
              <button
                key={categoryKey}
                type="button"
                onClick={() => setActiveTab(categoryKey)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === categoryKey
                    ? "bg-[#FF8C38] text-black font-extrabold shadow-sm"
                    : isDark
                    ? "text-neutral-400 hover:text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {categoryKey}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCatalog.map((template) => {
            const isPremiumPlan = template.plan_type !== "FREE";

            return (
              <div
                key={template.id}
                className={`group border rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all ${
                  isDark
                    ? "bg-neutral-950 border-neutral-900 hover:border-[#FF8C38]/50"
                    : "bg-white border-stone-200 hover:border-[#FF8C38]"
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-full h-32 border rounded-xl flex flex-col items-center justify-center relative overflow-hidden select-none transition-colors ${
                    isDark ? "bg-black/90 border-neutral-800" : "bg-stone-100 border-stone-200"
                  }`}>

                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="text-[8px] font-mono border px-1.5 py-0.5 rounded font-bold tracking-wider uppercase bg-[#FF8C38]/20 text-[#FF8C38] border-[#FF8C38]/40">
                        {template.plan_type}
                      </span>
                    </div>

                    <span className="text-3xl filter drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                      {template.thumbnail_icon}
                    </span>

                    <span className="text-[8px] font-mono uppercase tracking-widest text-[#FF8C38] font-bold mt-2 block">
                      {template.category}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wide group-hover:text-[#FF8C38] transition-colors truncate ${
                      isDark ? "text-white" : "text-stone-900"
                    }`}>
                      {template.title}
                    </h3>
                    <div className={`mt-1 text-xs font-medium ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                      {isPremiumPlan ? (
                        <p>Unlock: <span className="text-[#FF8C38] font-mono font-bold">₦{Number(template.price).toLocaleString()}</span></p>
                      ) : (
                        <p className="text-[#FF8C38] font-bold">Included Free</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`pt-4 mt-3 border-t ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
                  <button
                    type="button"
                    onClick={() => handleLaunchRequest(template)}
                    className="w-full py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                  >
                    Load Room Canvas ➔
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRMATION POPUP MODALS */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={executeTemplateLoad}
        title={modalSuccess ? "Workspace Ready" : "Load Room Template"}
        message={
          modalSuccess
            ? `Setting up canvas environment for "${selectedTemplate?.title}".`
            : `Are you sure you want to load "${selectedTemplate?.title}" into your workspace?`
        }
        confirmText="Launch Engine"
        cancelText="Go Back"
        isSuccessState={modalSuccess}
      />

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          commitDeletionToDatabase();
          setDeleteOpen(false);
        }}
        title="Delete Design Layout?"
        message={`Are you sure you want to permanently remove "${designTargetForDelete?.name}"?`}
        confirmText="Yes, Delete Design"
        cancelText="Cancel"
      />

    </div>
  );
}