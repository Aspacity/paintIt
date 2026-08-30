"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

interface CatalogTemplate {
  id: string;
  title: string;
  model_url?: string;
  category?: string;
  plan_type?: string;
  thumbnail_icon?: string;
  polygons_count?: string;
  lighting_setup?: string;
}

export default function PublicDesignTemplatesDirectoryPage() {
  const [templates, setTemplates] = useState<CatalogTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

  // FETCH DYNAMIC CATALOG FROM BACKEND API
  useEffect(() => {
    let isMounted = true;

    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/visualizations/catalog`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.catalog) {
            setTemplates(data.catalog);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog templates:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, [BACKEND_API_URL]);

  const filteredTemplates = templates.filter((template) => {
    const titleMatch = (template.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const lightingMatch = (template.lighting_setup || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || lightingMatch;

    const templateCategory = (template.category || "INTERIOR").toUpperCase();
    const matchesCategory = selectedCategory === "ALL" || templateCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`space-y-6 max-w-7xl mx-auto animate-fade-in pb-16 transition-colors duration-300 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* CONTROL LAYER: HEADERS & PARAMETER FILTERS */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>
        <div>
          <h1 className={`text-xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            3D Architecture Catalog
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Explore interactive 3D room concepts and preview color swatches right in your browser.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-xl">
          {/* Category Quick Filter Segments */}
          <div className={`flex p-1 rounded-xl w-full sm:w-auto shrink-0 border ${
            isDark ? "bg-neutral-950 border-neutral-900" : "bg-stone-100 border-stone-300"
          }`}>
            {["ALL", "INTERIOR", "COMMERCIAL", "ACCENT"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all w-full sm:w-auto text-center ${
                  selectedCategory === cat
                    ? "bg-[#FF8C38] text-black font-extrabold shadow-sm"
                    : isDark
                    ? "text-neutral-400 hover:text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search 3D templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-4 py-2.5 border rounded-xl text-xs w-full transition-all font-medium focus:outline-none focus:border-[#FF8C38] ${
              isDark
                ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                : "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400"
            }`}
          />
        </div>
      </div>

      {/* GRID CONTAINER / LOADING STATES */}
      {isLoading ? (
        <div className="min-h-[40vh] w-full flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
          <span className={`text-[10px] font-bold tracking-widest uppercase ${
            isDark ? "text-neutral-500" : "text-stone-500"
          }`}>
            Loading Catalog Concepts...
          </span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className={`text-center py-16 border border-dashed rounded-3xl max-w-md mx-auto space-y-3 ${
          isDark ? "border-neutral-800 bg-neutral-950/30" : "border-stone-300 bg-white"
        }`}>
          <span className="text-2xl">📐</span>
          <h3 className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-white" : "text-stone-900"}`}>
            No Environment Matches
          </h3>
          <p className={`text-xs max-w-xs mx-auto ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            We couldn&apos;t find any 3D layout geometries matching your active search string.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Link
              key={template.id}
              href={`/workspace?template=${template.id}`}
              className={`group border rounded-2xl p-5 flex flex-col justify-between shadow-md transition-all duration-200 cursor-pointer ${
                isDark
                  ? "bg-neutral-950 border-neutral-900 hover:border-[#FF8C38]/50"
                  : "bg-white border-stone-200 hover:border-[#FF8C38]"
              }`}
            >
              <div className="space-y-4">
                {/* 3D Scene Mock Canvas Box */}
                <div className="w-full h-40 bg-black/90 border border-neutral-800 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-inner select-none">
                  <div className="absolute top-0 right-0 p-2.5">
                    <span className="text-[9px] font-mono bg-black/80 text-[#FF8C38] border border-neutral-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {template.category || "INTERIOR"}
                    </span>
                  </div>

                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">
                    {template.thumbnail_icon || "🛋️"}
                  </span>

                  <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-[#FF8C38] mt-3 block">
                    [ Tap to Launch 3D Canvas 🚀 ]
                  </span>
                </div>

                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide group-hover:text-[#FF8C38] transition-colors ${
                    isDark ? "text-white" : "text-stone-900"
                  }`}>
                    {template.title}
                  </h3>

                  {/* Specs */}
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-medium select-none">
                    <span className={`px-2 py-0.5 border rounded-md ${
                      isDark ? "bg-black border-neutral-800 text-neutral-400" : "bg-stone-100 border-stone-200 text-stone-600"
                    }`}>
                      ⚙️ {template.polygons_count || "Standard Mesh"}
                    </span>
                    <span className={`px-2 py-0.5 border rounded-md ${
                      isDark ? "bg-black border-neutral-800 text-neutral-400" : "bg-stone-100 border-stone-200 text-stone-600"
                    }`}>
                      💡 {template.lighting_setup || "Dynamic Point Lights"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ROUTE DIRECTLY TO WORKSPACE */}
              <div className={`pt-4 mt-4 border-t ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
                <div className="w-full py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-center text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all">
                  Open 3D Canvas Workspace ➔
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}