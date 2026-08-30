"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

interface PainterProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string;
  experience_rating: string;
  specialty_tags: string[];
  total_showcases: number;
}

export default function PublicPainterSearchPage() {
  const [painters, setPainters] = useState<PainterProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPublicDirectory = async () => {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/profile/directory/painters`);
        if (res.ok) {
          const data = await res.json();
          setPainters(data.painters || []);
        }
      } catch (err) {
        console.error("Directory hydration error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicDirectory();
  }, [BACKEND_API_URL]);

  const filteredPainters = painters.filter((painter) =>
    painter.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    painter.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-6 max-w-7xl mx-auto animate-fade-in pb-16 transition-colors duration-300 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* Top Banner Control Section */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>
        <div>
          <h1 className={`text-xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Verified Professional Contractors
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Explore verified painting contractors, past portfolios, and request project quotes directly.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`px-4 py-2.5 border rounded-xl text-xs w-full md:max-w-sm transition-all font-medium focus:outline-none focus:border-[#FF8C38] ${
            isDark
              ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
              : "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400"
          }`}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="w-5 h-5 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
          <span className={`text-[10px] uppercase font-bold tracking-widest ${
            isDark ? "text-neutral-500" : "text-stone-500"
          }`}>
            Reindexing Providers...
          </span>
        </div>
      ) : filteredPainters.length === 0 ? (
        <div className={`text-center py-16 border border-dashed rounded-3xl max-w-md mx-auto space-y-4 px-6 ${
          isDark ? "border-neutral-800 bg-neutral-950/30" : "border-stone-300 bg-white"
        }`}>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mx-auto text-base shadow-xs select-none ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-stone-100 border-stone-200"
          }`}>
            🔍
          </div>
          <div className="space-y-1">
            <h3 className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-white" : "text-stone-900"}`}>
              No Contractors Found for <span className="text-[#FF8C38] font-mono italic select-all font-bold">&quot;{searchQuery}&quot;</span>
            </h3>
            <p className={`text-xs max-w-xs mx-auto ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              We couldn&apos;t match that query to any registered painter profile or location.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-[10px] bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            ← Reset Filter
          </button>
        </div>
      ) : (
        /* Active Listing Cards Row */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPainters.map((painter) => (
            <div
              key={painter.id}
              className={`group border rounded-2xl p-5 flex flex-col justify-between shadow-md transition-all duration-200 ${
                isDark
                  ? "bg-neutral-950 border-neutral-900 hover:border-[#FF8C38]/50"
                  : "bg-white border-stone-200 hover:border-[#FF8C38]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#FF8C38] text-black flex items-center justify-center font-bold text-sm tracking-wider overflow-hidden shrink-0 select-none shadow-xs">
                    {painter.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={painter.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{painter.full_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wide group-hover:text-[#FF8C38] transition-colors ${
                      isDark ? "text-white" : "text-stone-900"
                    }`}>
                      {painter.full_name}
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>📍 {painter.location}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-2 pt-2 border-t text-[10px] font-medium select-none ${
                  isDark ? "border-neutral-900 text-neutral-400" : "border-stone-200 text-stone-600"
                }`}>
                  <span className={`px-2 py-0.5 border rounded ${
                    isDark ? "bg-black border-neutral-800" : "bg-stone-100 border-stone-200"
                  }`}>🛡️ {painter.experience_rating}</span>
                  {painter.total_showcases > 0 && (
                    <span className={`px-2 py-0.5 border rounded ${
                      isDark ? "bg-black border-neutral-800" : "bg-stone-100 border-stone-200"
                    }`}>📸 {painter.total_showcases} Works</span>
                  )}
                </div>
              </div>

              <div className={`pt-4 mt-4 border-t ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
                <Link
                  href={`/painter/${painter.id}`}
                  className="block w-full py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-center text-xs font-bold uppercase tracking-wider text-black rounded-xl transition-all shadow-sm"
                >
                  View Profile & Portfolio ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}