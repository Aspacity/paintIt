"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

interface PublicProfile {
  id: string;
  full_name: string;
  role: string;
  bio: string | null;
  location: string | null;
  phone_number: string | null;
  experience_years: number;
  skills: string[];
  avatar_url: string | null;
}

interface PortfolioProject {
  id: number;
  title: string;
  description: string | null;
  location: string;
  images: string[];
  colors_used: string[];
  created_at: string;
}

interface Painter3DConcept {
  id: string;
  name: string;
  parent_template_name: string;
  room_data: Record<string, string>;
  thumbnail_url?: string | null;
  created_at: string;
}

export default function PublicPainterShowcasePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const id = params?.id as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [concepts3D, setConcepts3D] = useState<Painter3DConcept[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tab Routing Manager State ('REAL_WORK' or 'THREE_D_STUDIO')
  const [activeTab, setActiveTab] = useState<'REAL_WORK' | 'THREE_D_STUDIO'>('REAL_WORK');

  // Direct Lead Generation Form State
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Lightbox Modal
  const [activeLightboxProject, setActiveLightboxProject] = useState<PortfolioProject | null>(null);
  const [currentLightboxImageIdx, setCurrentLightboxImageIdx] = useState<number>(0);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!id) return;

    const fetchShowcaseData = async () => {
      setLoading(true);

      try {
        const profileRes = await fetch(`${BACKEND_URL}/api/profile/${id}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const loadedProfile = profileData.profile || profileData;
          if (loadedProfile) {
            setProfile({
              id: loadedProfile.id || id,
              full_name: loadedProfile.full_name || "Verified Contractor",
              role: loadedProfile.role || "PAINTER",
              bio: loadedProfile.bio || null,
              location: loadedProfile.location || "Ibadan, Nigeria",
              phone_number: loadedProfile.phone_number || null,
              experience_years: loadedProfile.experience_years || 0,
              skills: Array.isArray(loadedProfile.skills) ? loadedProfile.skills : [],
              avatar_url: loadedProfile.avatar_url || null,
            });
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }

      try {
        let portfolioRes = await fetch(`${BACKEND_URL}/api/portfolio/projects?userId=${id}`);
        if (!portfolioRes.ok) {
          portfolioRes = await fetch(`${BACKEND_URL}/api/portfolio/painter/${id}`);
        }

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          const loadedProjects =
            portfolioData.projects ||
            portfolioData.portfolio ||
            (Array.isArray(portfolioData) ? portfolioData : []);

          setProjects(loadedProjects);

          const targetProjectParam = searchParams.get("project");
          if (targetProjectParam) {
            const matchedProject = loadedProjects.find(
              (p: PortfolioProject) => p.id.toString() === targetProjectParam
            );
            if (matchedProject) {
              setActiveLightboxProject(matchedProject);
              setCurrentLightboxImageIdx(0);
            }
          }
        }
      } catch (err) {
        console.error("Portfolio projects fetch error:", err);
      }

      try {
        const conceptsRes = await fetch(`${BACKEND_URL}/api/visualizations/painter/${id}`);
        if (conceptsRes.ok) {
          const conceptsData = await conceptsRes.json();
          const loadedConcepts = conceptsData.visualizations || conceptsData.data || [];
          setConcepts3D(loadedConcepts);

          if (loadedConcepts.length > 0 && projects.length === 0) {
            setActiveTab("THREE_D_STUDIO");
          }
        }
      } catch (err) {
        console.error("3D concepts fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowcaseData();
  }, [id, BACKEND_URL, searchParams]);

  const handleCreateInboundLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setSubmittingLead(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/analytics/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          painterId: id,
          clientName: leadName,
          clientEmail: leadEmail,
          clientPhone: leadPhone,
          projectDescription: leadMessage,
          source: "PROFILE_DIRECT"
        })
      });

      if (res.ok) {
        setSuccessMessage("Your consultation request has been submitted successfully!");
        setLeadName("");
        setLeadEmail("");
        setLeadPhone("");
        setLeadMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingLead(false);
    }
  };

  const copyIndividualProjectLink = (projectId: number) => {
    const link = `${window.location.origin}/painter/${id}?project=${projectId}`;
    navigator.clipboard.writeText(link);
    alert("Individual project deep link saved to clipboard!");
  };

  const copyEntireCatalogProfileLink = () => {
    const link = `${window.location.origin}/painter/${id}`;
    navigator.clipboard.writeText(link);
    alert("Complete business portfolio link saved!");
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-3 ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
      }`}>
        <div className="w-5 h-5 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
        <span className={`text-[10px] tracking-widest uppercase font-bold ${
          isDark ? "text-neutral-500" : "text-stone-500"
        }`}>Loading Contractor Portfolio...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
      }`}>
        <h1 className="text-sm font-bold uppercase tracking-wider text-red-500">Contractor Profile Not Found</h1>
        <p className={`text-xs mt-1 max-w-xs ${isDark ? "text-neutral-500" : "text-stone-500"}`}>
          The requested contractor profile link is invalid or unavailable.
        </p>
      </div>
    );
  }

  const nameInitial = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "P";

  return (
    <div className={`min-h-screen font-sans antialiased relative transition-colors duration-300 ${
      isDark ? "bg-black text-neutral-200" : "bg-[#FAF8F5] text-stone-800"
    }`}>

      {/* Navigation Sub-header */}
      <nav className={`border-b sticky top-0 z-40 px-6 py-4 backdrop-blur-md ${
        isDark ? "bg-black/90 border-neutral-900" : "bg-[#FAF8F5]/90 border-stone-200"
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest text-[#FF8C38] uppercase">PAINTIT // PRO</span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border text-xs font-bold ${
                isDark ? "bg-neutral-900 border-neutral-800 text-amber-300" : "bg-stone-200 border-stone-300 text-stone-800"
              }`}
            >
              {isDark ? "🌙" : "☀️"}
            </button>
            <button
              onClick={copyEntireCatalogProfileLink}
              className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase transition-all border ${
                isDark ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-white border-stone-300 text-stone-800"
              }`}
            >
              🔗 Share Profile
            </button>
            <span className="text-[10px] bg-[#FF8C38]/15 border border-[#FF8C38]/30 px-2.5 py-1.5 rounded-xl text-[#FF8C38] uppercase font-bold tracking-wider select-none">
              📍 {profile.location || "Nigeria"}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Profile Content Column */}
        <div className="md:col-span-2 space-y-8">

          {/* Profile Header Card */}
          <div className={`p-6 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md ${
            isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FF8C38] text-black flex items-center justify-center font-bold text-2xl overflow-hidden relative shrink-0 shadow-xs">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span>{nameInitial}</span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[9px] bg-[#FF8C38]/15 border border-[#FF8C38]/30 px-2 py-0.5 rounded text-[#FF8C38] font-bold uppercase tracking-widest select-none">
                  Verified Contractor
                </span>
                <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>{profile.full_name}</h1>
                <p className={`text-xs ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                  Experience: <span className="font-bold">{profile.experience_years || 0} Years Active</span>
                </p>
              </div>
            </div>

            {profile.phone_number && (
              <a
                href={`https://wa.me/${profile.phone_number.replace(/\s+/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 text-center"
              >
                💬 WhatsApp Chat ➔
              </a>
            )}
          </div>

          <div className={`space-y-2 border-t pt-6 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Contractor Bio</h3>
            <p className={`text-xs leading-relaxed max-w-xl whitespace-pre-wrap ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              {profile.bio || "This contractor has not customized their bio description yet."}
            </p>
          </div>

          <div className={`space-y-3 border-t pt-6 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Specialist Skills & Finishes</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, idx) => (
                  <span key={idx} className={`px-3 py-1 border rounded-lg text-xs font-semibold uppercase ${
                    isDark ? "bg-black border-neutral-800 text-neutral-300" : "bg-stone-100 border-stone-300 text-stone-800"
                  }`}>
                    ⚡ {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-500 italic">General Surface Coatings</span>
              )}
            </div>
          </div>

          <div className={`border-t pt-6 space-y-5 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
            <div className={`flex items-center gap-1.5 border-b pb-2 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
              <button
                onClick={() => setActiveTab('REAL_WORK')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === 'REAL_WORK'
                    ? "bg-[#FF8C38] text-black font-extrabold shadow-sm"
                    : isDark
                    ? "text-neutral-400 hover:text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                📁 Real Works ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('THREE_D_STUDIO')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === 'THREE_D_STUDIO'
                    ? "bg-[#FF8C38] text-black font-extrabold shadow-sm"
                    : isDark
                    ? "text-neutral-400 hover:text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                🎨 3D Design Swatches ({concepts3D.length})
              </button>
            </div>

            {activeTab === 'REAL_WORK' ? (
              projects.length === 0 ? (
                <div className={`p-12 border rounded-2xl text-center ${isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"}`}>
                  <p className={`text-xs font-bold ${isDark ? "text-neutral-500" : "text-stone-500"}`}>No project works published yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className={`border rounded-2xl overflow-hidden flex flex-col justify-between group shadow-sm ${
                      isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
                    }`}>
                      <div>
                        <div
                          onClick={() => { setActiveLightboxProject(project); setCurrentLightboxImageIdx(0); }}
                          className="w-full h-40 bg-black/90 border-b border-neutral-800 relative overflow-hidden cursor-pointer"
                        >
                          {project.images && project.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={project.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500 font-bold uppercase tracking-wider">No Image</div>
                          )}
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 rounded text-[9px] font-bold text-neutral-300 border border-neutral-800">
                            📍 {project.location || "Location"}
                          </div>
                        </div>

                        <div className="p-4 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-xs font-bold tracking-wide ${isDark ? "text-white" : "text-stone-900"}`}>{project.title}</h4>
                            <button
                              onClick={() => copyIndividualProjectLink(project.id)}
                              className="text-[9px] text-[#FF8C38] font-bold uppercase tracking-wider shrink-0 transition-colors"
                            >
                              🔗 Copy Link
                            </button>
                          </div>
                          <p className={`text-xs line-clamp-2 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>{project.description}</p>
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <button
                          onClick={() => { setActiveLightboxProject(project); setCurrentLightboxImageIdx(0); }}
                          className="w-full py-2 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
                        >
                          Expand Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              concepts3D.length === 0 ? (
                <div className={`p-12 border rounded-2xl text-center space-y-1 ${isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"}`}>
                  <p className={`text-xs font-bold ${isDark ? "text-neutral-400" : "text-stone-600"}`}>No 3D Presets Published</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {concepts3D.map((concept) => (
                    <div
                      key={concept.id}
                      onClick={() => router.push(`/view/${concept.id}`)}
                      className={`group border rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer shadow-sm transition-all duration-200 ${
                        isDark ? "bg-neutral-950 border-neutral-900 hover:border-[#FF8C38]/50" : "bg-white border-stone-200 hover:border-[#FF8C38]"
                      }`}
                    >
                      <div className="w-full h-40 bg-black/90 border-b border-neutral-800 relative flex items-center justify-center overflow-hidden">
                        {concept.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={concept.thumbnail_url}
                            alt={concept.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1.5 text-neutral-400">
                            <span className="text-3xl">🏠</span>
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#FF8C38]">3D Model</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className={`text-xs font-bold uppercase truncate group-hover:text-[#FF8C38] transition-colors ${
                          isDark ? "text-white" : "text-stone-900"
                        }`}>
                          {concept.name}
                        </h4>
                        <div className={`flex items-center justify-between text-[9px] font-bold uppercase pt-2 border-t ${
                          isDark ? "border-neutral-900 text-neutral-400" : "border-stone-200 text-stone-600"
                        }`}>
                          <span>Base: {concept.parent_template_name || "Architecture"}</span>
                          <span className="text-[#FF8C38] group-hover:underline">Launch 3D &rarr;</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

        </div>

        {/* Lead Capture Sidebar */}
        <div className="space-y-6">
          <div className={`p-6 border rounded-2xl shadow-md sticky top-24 ${
            isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-stone-900"}`}>
              Request Quote
            </h3>
            <p className={`text-xs mt-1 mb-4 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              Submit project parameters directly to this contractor.
            </p>

            {successMessage ? (
              <div className="p-4 bg-[#FF8C38]/15 border border-[#FF8C38]/40 text-[#FF8C38] text-xs font-bold rounded-xl text-center">
                🎉 {successMessage}
              </div>
            ) : (
              <form onSubmit={handleCreateInboundLead} className="space-y-3">
                <input
                  type="text" required placeholder="Your Full Name" value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                    isDark ? "bg-black border-neutral-800 text-white" : "bg-[#FAF8F5] border-stone-300 text-stone-900"
                  }`}
                />
                <input
                  type="email" required placeholder="Your Email Address" value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                    isDark ? "bg-black border-neutral-800 text-white" : "bg-[#FAF8F5] border-stone-300 text-stone-900"
                  }`}
                />
                <input
                  type="tel" placeholder="Phone Line (WhatsApp preferred)" value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                    isDark ? "bg-black border-neutral-800 text-white" : "bg-[#FAF8F5] border-stone-300 text-stone-900"
                  }`}
                />
                <textarea
                  required rows={4} placeholder="Describe your project..." value={leadMessage}
                  onChange={(e) => setLeadMessage(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] resize-none ${
                    isDark ? "bg-black border-neutral-800 text-white" : "bg-[#FAF8F5] border-stone-300 text-stone-900"
                  }`}
                />
                <button
                  type="submit" disabled={submittingLead}
                  className="w-full py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all"
                >
                  {submittingLead ? "Transmitting..." : "Submit Quote Request"}
                </button>
              </form>
            )}
          </div>
        </div>

      </main>

      {/* VIEWER LIGHTBOX MODAL */}
      {activeLightboxProject && (
        <div className="fixed inset-0 bg-black/95 z-50 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in text-white">
          <button
            onClick={() => setActiveLightboxProject(null)}
            className="absolute top-6 right-6 text-xs text-neutral-400 hover:text-white font-bold uppercase tracking-widest border border-neutral-800 px-3 py-1.5 rounded-xl bg-neutral-900"
          >
            ✕ Close View
          </button>

          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-4">
              <div className="w-full h-[60vh] bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeLightboxProject.images[currentLightboxImageIdx]} alt="" className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <span className="text-[9px] bg-[#FF8C38]/15 border border-[#FF8C38]/30 px-2 py-0.5 rounded text-[#FF8C38] font-bold uppercase">Case Study</span>
                <h2 className="text-xl font-bold text-white mt-1">{activeLightboxProject.title}</h2>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-h-[30vh] overflow-y-auto">{activeLightboxProject.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}