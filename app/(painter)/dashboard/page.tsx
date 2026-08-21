"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { StepOnboarding } from "@/components/ui/StepOnboarding";
import { OnboardingStep } from "@/types/index";
import { MicroVideoCarousel } from "@/components/ui/MicroVideoCarousel";

interface DashboardStats {
  profileViews: number;
  designViews: number;
  savedClones: number;
  conversionRate: number;
}

interface ContentMetrics {
  totalProjects: number;
  totalImages: number;
}

interface ProfileCompletenessCheck {
  id: string;
  label: string;
  isComplete: boolean;
  nudgeText: string;
}

export default function PainterDashboardPage() {
  const { user, accessToken, updateUser } = useAuth();
  const { showToast } = useAlert();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics>({ totalProjects: 0, totalImages: 0 });
  const [leadCount, setLeadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [dbProfile, setDbProfile] = useState<{
    bio: string | null;
    location: string | null;
    avatar_url: string | null;
  }>({ bio: null, location: null, avatar_url: null });

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const loadDashboardMasterData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const profileRes = await fetch(`${BACKEND_API_URL}/api/profile/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const p = profileData.profile || {};

          setDbProfile({
            bio: p.bio || null,
            location: p.location || null,
            avatar_url: p.avatar_url || null,
          });

          if (p.avatar_url) {
            updateUser({ avatarUrl: p.avatar_url, avatar_url: p.avatar_url });
          }
        }

        const overviewRes = await fetch(`${BACKEND_API_URL}/api/analytics/overview`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          if (overviewData.stats) setStats(overviewData.stats);

          const metricsSource = overviewData.contentMetrics || overviewData.data || {};
          setContentMetrics({
            totalProjects: parseInt(metricsSource.totalProjects || metricsSource.total_projects || "0", 10),
            totalImages: parseInt(metricsSource.totalImages || metricsSource.total_images || "0", 10),
          });
        }

        // Fetch client leads count
        const leadsRes = await fetch(`${BACKEND_API_URL}/api/leads/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          const rawLeads = leadsData.pipelineLeads || leadsData.leads || [];
          setLeadCount(rawLeads.length);
        }
      } catch (err) {
        console.error("Error updating dashboard details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardMasterData();
  }, [accessToken, BACKEND_API_URL, updateUser]);

  const handleTriggerProfileWizard = () => {
    showToast({ message: "Opening profile setup...", severity: "info" });
    window.location.href = "/profile";
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const targetName = user?.fullName || user?.full_name || "";
  const displayFirstName = targetName.trim() ? targetName.trim().split(" ")[0] : "Painter";
  const nameInitialLetter = targetName.trim() ? targetName.trim().charAt(0).toUpperCase() : "P";
  const userAvatarImageSrc = dbProfile.avatar_url || user?.avatarUrl || user?.avatar_url || null;

  const activeUserId = user?.id || user?._id;
  const businessPageLink = typeof window !== "undefined" ? `${window.location.origin}/painter/${activeUserId}` : `https://paintit-six.vercel.app/painter/${activeUserId}`;

  const isProfileCompleted = displayFirstName !== "Painter" && displayFirstName !== "Contractor" && !!targetName;
  const isBioConfigured = !!dbProfile.bio;
  const isLocationConfigured = !!dbProfile.location;
  const hasUploadedWork = contentMetrics.totalProjects > 0 || contentMetrics.totalImages > 0;
  const hasPublishedCanvas = (stats?.designViews || 0) > 0;

  const onboardingChecklist: ProfileCompletenessCheck[] = [
    {
      id: "avatar",
      label: "Upload Profile Photo",
      isComplete: !!userAvatarImageSrc,
      nudgeText: "Profiles with a clear photo build immediate trust and get more work from clients.",
    },
    {
      id: "location",
      label: "Set Your City or Area",
      isComplete: isLocationConfigured,
      nudgeText: "Helps homeowners find your business when looking for local painters in your area.",
    },
    {
      id: "bio",
      label: "Fill Out Your About Description",
      isComplete: isBioConfigured,
      nudgeText: "Describe your professional skills and styling techniques to attract high-paying jobs.",
    },
    {
      id: "projects",
      label: "Add Photos of Past Projects",
      isComplete: hasUploadedWork,
      nudgeText: "Showcase real examples of your paint finishes to prove your experience.",
    },
  ];

  const pendingOnboardingTasks = onboardingChecklist.filter((item) => !item.isComplete);
  const totalOnboardingCount = onboardingChecklist.length;
  const completedOnboardingCount = totalOnboardingCount - pendingOnboardingTasks.length;
  const profileCompletenessScore = Math.round((completedOnboardingCount / totalOnboardingCount) * 100);

  const dashboardSetupSteps: OnboardingStep[] = [
    { id: 1, label: `Fill Out Profile ${isProfileCompleted ? "✅" : ""}`, description: "Enter your personal details." },
    { id: 2, label: `Add Work Photos ${hasUploadedWork ? "✅" : ""}`, description: "Upload examples of your real finishing projects." },
    { id: 3, label: `Publish 3D Design ${hasPublishedCanvas ? "✅" : ""}`, description: "Save a custom color scheme template for clients." },
    { id: 4, label: "Share Profile Link", description: "Send your web link directly to potential clients." },
  ];

  // Pre-Loaded 3D Room Color Presets for Instant Client Sharing
  const preloadedPresets = [
    { id: "satin_alabaster", name: "Alabaster White & Cream", hex: "#F2EFE9", badge: "Most Popular" },
    { id: "royal_navy", name: "Royal Navy & Gold Accent", hex: "#1B2A4A", badge: "Trending" },
    { id: "emerald_luxe", name: "Emerald Luxe Living Room", hex: "#0F382C", badge: "Premium" },
    { id: "warm_greige", name: "Warm Greige & Earthy Tan", hex: "#9E9585", badge: "Modern" },
  ];

  const handleShareToWhatsAppStatus = (presetName?: string) => {
    const text = presetName
      ? `🎨 See how ${presetName} wall paint looks in 3D before you buy! Check out my 3D Painting Portfolio & request a quote: ${businessPageLink}`
      : `🎨 Want to see 3D previews of your wall colors before buying paint? Check out my professional painting portfolio & request a quote: ${businessPageLink}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
    showToast({ message: "Opening WhatsApp share...", severity: "success" });
  };

  const isBrandNewAccount = !hasUploadedWork && !isProfileCompleted && leadCount === 0 && (!stats || (stats.profileViews === 0 && stats.designViews === 0));

  return (
    <div className="space-y-6 text-white animate-fade-in max-w-md mx-auto md:max-w-none pb-12 selection:bg-emerald-500 selection:text-black">
      {/* Header Context Block */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-3">
          <a
            href="/profile"
            className="w-10 h-10 rounded-xl bg-neutral-950 mercantile-border hover:border-emerald-500/30 flex items-center justify-center font-black text-sm text-emerald-400 tracking-wider overflow-hidden transition-all relative group shadow-inner shrink-0 select-none"
          >
            {userAvatarImageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatarImageSrc} alt={displayFirstName} className="w-full h-full object-cover" />
            ) : (
              <span>{nameInitialLetter}</span>
            )}
          </a>
          <div>
            <h1 className="text-base font-black text-neutral-100">
              Welcome, <span className="text-emerald-400">{displayFirstName}</span> 👋
            </h1>
            <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">Your business dashboard & sales hub.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleShareToWhatsAppStatus()}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 select-none active:scale-95"
        >
          <span>💬 Share to WhatsApp</span>
        </button>
      </div>

      {/* 🚀 VIRAL WHATSAPP SALES CARD FOR PAINTERS */}
      <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-neutral-950 to-neutral-950 border border-emerald-500/30 rounded-3xl space-y-3 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
              <span>🚀 Win Clients Faster on WhatsApp</span>
            </h3>
            <p className="text-[11px] text-neutral-300 leading-relaxed font-medium max-w-xl">
              Post your PaintIt business link to your WhatsApp Status or send it to prospective clients so they can see 3D wall color previews before hiring you!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleShareToWhatsAppStatus()}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>💬 Post to Status</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(businessPageLink);
                showToast({ message: "Business page link copied to clipboard!", severity: "success" });
              }}
              className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 rounded-xl transition-all"
              title="Copy Link"
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* 🎥 REUSABLE MICRO-VIDEO CAROUSEL DEMO MODULE (COMMENTED OUT FOR NOW)
      <MicroVideoCarousel
        title="⚡ 15-Second Painter Success Guide"
        subtitle="Swipe to watch how to use PaintIt Studio to win painting clients."
        steps={[
          {
            id: "dash_step_1",
            stepNumber: 1,
            title: "1. Share Page on WhatsApp",
            subtitle: "Post your 3D visualizer business link directly to your WhatsApp Status in 1 tap.",
            videoUrl: "/videos/painter_share_whatsapp.mp4",
            badge: "Fast Sales",
            actionText: "Try Sharing Now",
            onActionClick: () => handleShareToWhatsAppStatus(),
          },
          {
            id: "dash_step_2",
            stepNumber: 2,
            title: "2. Build Your 3D Portfolio",
            subtitle: "Open 3D Studio to pick rooms, paint wall colors, and test Satin/Emulsion finishes.",
            videoUrl: "/videos/painter_3d_studio.mp4",
            badge: "3D Studio",
            actionText: "Open 3D Studio",
            onActionClick: () => { window.location.href = "/designs"; },
          },
          {
            id: "dash_step_3",
            stepNumber: 3,
            title: "3. Manage Client Leads",
            subtitle: "Check customer color choices and reply instantly on WhatsApp.",
            videoUrl: "/videos/painter_leads.mp4",
            badge: "Client Inbox",
            actionText: "View Leads & Inbox",
            onActionClick: () => { window.location.href = "/gigs"; },
          },
        ]}
      />
      */}

      {isBrandNewAccount ? (
        <div className="py-4 flex items-center justify-center">
          <StepOnboarding
            title="Setup Your Profile Dashboard"
            subtitle="Your workspace is currently empty. Follow these simple steps to build your profile and start attracting clients."
            steps={dashboardSetupSteps}
            ctaText="Continue Dashboard Setup"
            onCtaClick={handleTriggerProfileWizard}
            estimatedMinutes={3}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Actions Hub - 3 Primary Big Touch Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="/gigs"
              className="p-4 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl flex items-center gap-3 transition-all group shadow-lg"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">📩</span>
              <div>
                <h4 className="text-xs font-black uppercase text-emerald-400">Leads & Inbox</h4>
                <p className="text-[10px] text-neutral-400 font-medium">
                  {leadCount > 0 ? `${leadCount} client inquiries` : "View customer messages"}
                </p>
              </div>
            </a>

            <a
              href="/portfolio"
              className="p-4 bg-neutral-950 border border-neutral-850 hover:border-neutral-700 rounded-2xl flex items-center gap-3 transition-all group shadow-md"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
              <div>
                <h4 className="text-xs font-black uppercase text-neutral-100">My Work Photos</h4>
                <p className="text-[10px] text-neutral-500 font-medium">{contentMetrics.totalImages} photos uploaded</p>
              </div>
            </a>

            <a
              href="/profile"
              className="p-4 bg-neutral-950 border border-neutral-850 hover:border-neutral-700 rounded-2xl flex items-center gap-3 transition-all group shadow-md"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
              <div>
                <h4 className="text-xs font-black uppercase text-neutral-100">Edit Profile</h4>
                <p className="text-[10px] text-neutral-500 font-medium">{profileCompletenessScore}% profile score</p>
              </div>
            </a>
          </div>

          

          {/* Profile Completeness Notice */}
          {pendingOnboardingTasks.length > 0 && (
            <div className="p-5 border border-amber-500/10 bg-gradient-to-br from-amber-500/5 via-neutral-950 to-neutral-950 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <span>⚠️ Complete Your Business Profile</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
                    Complete profiles appear higher on the painter search directory, making it easier for local homeowners to find and contact you.
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Completeness</span>
                  <span className="text-lg font-mono font-black text-amber-400">{profileCompletenessScore}%</span>
                </div>
              </div>

              <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-amber-400 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletenessScore}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {pendingOnboardingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl flex items-start gap-3 transition-colors hover:border-neutral-850"
                  >
                    <div className="w-4 h-4 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-mono text-[9px] font-black text-amber-400 mt-0.5 shrink-0">
                      !
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-neutral-200 uppercase tracking-wide">{task.label}</h4>
                      <p className="text-[10px] text-neutral-500 leading-relaxed mt-0.5 font-medium">{task.nudgeText}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleTriggerProfileWizard}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Update Profile Now ➔
                </button>
              </div>
            </div>
          )}

          {/* Quick Business Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Page Views</span>
              <span className="text-xl font-black text-white block mt-0.5">{stats?.profileViews || 0}</span>
            </div>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Customer Leads</span>
              <span className="text-xl font-black text-emerald-400 block mt-0.5">{leadCount}</span>
            </div>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Work Photos</span>
              <span className="text-xl font-black text-white block mt-0.5">{contentMetrics.totalImages}</span>
            </div>
            <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Response Rate</span>
              <span className="text-xl font-black text-white block mt-0.5">100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}