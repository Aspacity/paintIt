"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import AddProjectModal from "@/components/modals/AddProjectModal";
import EditProjectModal from "@/components/modals/EditProjectModal";

interface Project {
  id: string;
  title: string;
  description: string | null;
  location: string;
  images: string[];
  colors_used: string[];
  created_at: string;
}

export default function PainterPortfolioPage() {
  const { user } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);

  // Dynamic lightbox
  const [activeLightboxProject, setActiveLightboxProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const BACKEND_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

  const fetchContractorProjects = useCallback(async () => {
    setErrorBanner(null);
    try {
      const tokenKey = "paintit_access_token";
      const activeToken = localStorage.getItem(tokenKey);

      if (!activeToken) {
        setErrorBanner("Authentication session token missing. Please sign in.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/portfolio/projects`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
        },
      });

      if (response.status === 401) {
        throw new Error("Session invalid or expired. Please re-authenticate.");
      }

      if (!response.ok) throw new Error("Failed to load catalog records.");

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Database synchronization dropped.";
      setErrorBanner(msg);
    } fontinally: {
      setIsLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    let isMounted = true;

    const initializeWorkspaceStream = async () => {
      if (isMounted) {
        await fetchContractorProjects();
      }
    };

    initializeWorkspaceStream();

    return () => {
      isMounted = false;
    };
  }, [fetchContractorProjects]);

  const triggerEditFlow = (project: Project) => {
    setSelectedProjectForEdit(project);
    setIsEditModalOpen(true);
  };

  const copyProjectDeepLink = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const activeUserId = user?.id || user?._id;

    if (!activeUserId) {
      showToast({ message: "Unable to resolve active session credentials!", severity: "error" });
      return;
    }

    const projectDeepLink = `${window.location.origin}/painter/${activeUserId}?project=${projectId}`;

    navigator.clipboard.writeText(projectDeepLink);
    showToast({ message: "Project deep-link copied to clipboard!", severity: "success" });
  };

  const handleOpenLightbox = (project: Project) => {
    if (project.images && project.images.length > 0) {
      setActiveLightboxProject(project);
      setCurrentImageIndex(0);
    }
  };

  return (
    <div className={`w-full space-y-6 relative animate-fade-in transition-colors duration-300 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* Top Header Management Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>
        <div>
          <h1 className={`text-xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Real Works Catalog
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Showcase your completed site projects with photos and paint swatches to prospective clients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 shrink-0"
        >
          + Add Work
        </button>
      </div>

      {errorBanner && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-medium">
          ⚠️ {errorBanner}
        </div>
      )}

      {/* APP STATE */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="w-6 h-6 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
          <span className={`text-[10px] uppercase font-bold tracking-widest ${
            isDark ? "text-neutral-500" : "text-stone-500"
          }`}>Syncing Workspace Assets...</span>
        </div>
      ) : projects.length === 0 ? (
        /* Zero-State */
        <div className={`flex flex-col items-center justify-center text-center py-20 px-4 border border-dashed rounded-2xl max-w-md mx-auto ${
          isDark ? "border-neutral-800 bg-neutral-950/40" : "border-stone-300 bg-white"
        }`}>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl mb-4 shadow-xs ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-stone-100 border-stone-200"
          }`}>📸</div>
          <h3 className={`text-sm font-bold uppercase tracking-wide ${isDark ? "text-white" : "text-stone-900"}`}>
            No Projects Cataloged Yet!
          </h3>
          <p className={`text-xs max-w-xs mt-1.5 leading-relaxed ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Upload photos of your real paint jobs to back up your experience metrics.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-5 px-6 py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Initialize First Showcase
          </button>
        </div>
      ) : (
        /* PORTFOLIO DISPLAY GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`group border rounded-2xl overflow-hidden flex flex-col justify-between shadow-md transition-all duration-200 ${
                isDark
                  ? "bg-neutral-950 border-neutral-900 hover:border-[#FF8C38]/50"
                  : "bg-white border-stone-200 hover:border-[#FF8C38]"
              }`}
            >
              <div>
                {/* Visual Image Header */}
                <div
                  onClick={() => handleOpenLightbox(project)}
                  className="relative w-full h-48 bg-black/90 border-b border-neutral-800 overflow-hidden cursor-pointer"
                >
                  {project.images && project.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-[102%] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 bg-neutral-900">
                      <span className="text-2xl mb-1">🎨</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider">No Image Attachments</span>
                    </div>
                  )}

                  {/* Location Pin Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-neutral-800 rounded-full text-[10px] font-bold tracking-wide text-neutral-200 select-none">
                    📍 {project.location}
                  </div>

                  {/* Multi-Image Counter Tracker Badge */}
                  {project.images && project.images.length > 1 && (
                    <span className="absolute bottom-3 left-3 bg-black/80 text-[9px] font-bold text-[#FF8C38] px-2 py-1 rounded-md border border-neutral-800 select-none tracking-wide uppercase">
                      + {project.images.length - 1} Images
                    </span>
                  )}

                  {/* Action Handles */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={(e) => copyProjectDeepLink(e, project.id)}
                      className="px-2.5 py-1.5 bg-black/80 hover:bg-black text-[#FF8C38] text-[10px] font-bold uppercase rounded-xl transition-all border border-neutral-800"
                    >
                      🔗 Link
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerEditFlow(project);
                      }}
                      className="px-3 py-1.5 bg-black/80 hover:bg-black text-white text-[10px] font-bold uppercase rounded-xl transition-all border border-neutral-800"
                    >
                      ⚙️ Edit
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wide group-hover:text-[#FF8C38] transition-colors ${
                      isDark ? "text-white" : "text-stone-900"
                    }`}>
                      {project.title}
                    </h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                      {project.description || "No project overview notes cataloged."}
                    </p>
                  </div>

                  {project.colors_used && project.colors_used.length > 0 && (
                    <div className={`space-y-1.5 pt-2 border-t ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
                      <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                        isDark ? "text-neutral-500" : "text-stone-500"
                      }`}>Colors Used // Swatches</span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.colors_used.map((color, index) => (
                          <span
                            key={index}
                            className={`px-2 py-0.5 border rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                              isDark ? "bg-black border-neutral-800 text-neutral-300" : "bg-stone-100 border-stone-300 text-stone-700"
                            }`}
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className={`px-5 py-3.5 border-t flex items-center justify-between text-[9px] font-bold tracking-wider uppercase select-none ${
                isDark ? "bg-neutral-950 border-neutral-900 text-neutral-500" : "bg-stone-50 border-stone-200 text-stone-500"
              }`}>
                <span className="max-w-[180px] truncate">Record ID: #{project.id}</span>
                <span>{new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* GALLERY LIGHTBOX MODAL */}
      {activeLightboxProject && (
        <div className="fixed inset-0 bg-black/95 z-50 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in text-white">
          <button
            onClick={() => setActiveLightboxProject(null)}
            className="absolute top-6 right-6 text-xs text-neutral-400 hover:text-white font-bold uppercase tracking-widest border border-neutral-800 px-3 py-1.5 rounded-xl bg-neutral-900"
          >
            ✕ Close View
          </button>

          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-4">
              <div className="w-full h-[55vh] bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-2xl select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeLightboxProject.images[currentImageIndex]}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                />

                {activeLightboxProject.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(p => p === 0 ? activeLightboxProject.images.length - 1 : p - 1)}
                      className="absolute left-4 w-9 h-9 rounded-full bg-black/80 border border-neutral-800 text-white flex items-center justify-center text-sm font-bold hover:bg-[#FF8C38] hover:text-black transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(p => p === activeLightboxProject.images.length - 1 ? 0 : p + 1)}
                      className="absolute right-4 w-9 h-9 rounded-full bg-black/80 border border-neutral-800 text-white flex items-center justify-center text-sm font-black hover:bg-[#FF8C38] hover:text-black transition-all"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <span className="text-[9px] bg-[#FF8C38]/15 border border-[#FF8C38]/30 px-2 py-0.5 rounded text-[#FF8C38] font-bold uppercase">Showcase</span>
                <h2 className="text-xl font-bold text-white mt-1">{activeLightboxProject.title}</h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">📍 Location: {activeLightboxProject.location}</p>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-h-[25vh] overflow-y-auto">{activeLightboxProject.description}</p>
            </div>
          </div>
        </div>
      )}

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectAdded={fetchContractorProjects}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProjectForEdit(null);
        }}
        project={selectedProjectForEdit}
        onProjectUpdated={fetchContractorProjects}
      />

    </div>
  );
}