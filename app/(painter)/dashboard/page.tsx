"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import { StepOnboarding } from "@/components/ui/StepOnboarding";
import { OnboardingStep } from "@/types/index";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics>({ totalProjects: 0, totalImages: 0 });
  const [leadCount, setLeadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [dbProfile, setDbProfile] = useState<{
    bio: string | null;
    location: string | null;
    avatar_url: string | null;
  }>({ bio: null, location: null, avatar_url: null });

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

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
      <div className={`min-h-[50vh] w-full flex items-center justify-center ${
        isDark ? "text-white" : "text-stone-900"
      }`}>
        <div className="w-5 h-5 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
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
      label: "Set Your Location",
      isComplete: isLocationConfigured,
      nudgeText: "Helps homeowners find your business when looking for local painters in your area.",
    },
    {
      id: "bio",
      label: "Fill Out Your About Description",
      isComplete: isBioConfigured,
      nudgeText: "Describe your professional skills and techniques to attract high-paying jobs.",
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

  const handleShareToWhatsAppStatus = () => {
    const text = `🎨 Want to see 3D previews of your wall colors before buying paint? Check out my professional painting portfolio & request a quote: ${businessPageLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
    showToast({ message: "Opening WhatsApp share...", severity: "success" });
  };

  const isBrandNewAccount = !hasUploadedWork && !isProfileCompleted && leadCount === 0 && (!stats || (stats.profileViews === 0 && stats.designViews === 0));

  return (
    <div className="space-y-6 animate-fade-in max-w-md mx-auto md:max-w-none pb-12">
      {/* Header Context Block */}
      <div className={`flex items-center justify-between border-b pb-4 ${
        isDark ? "border-neutral-900 text-white" : "border-stone-200 text-stone-900"
      }`}>
        <div className="flex items-center gap-3">
          <a
            href="/profile"
            className="w-10 h-10 rounded-xl bg-[#FF8C38] text-black flex items-center justify-center font-bold text-sm tracking-wider overflow-hidden transition-all shadow-xs shrink-0 select-none"
          >
            {userAvatarImageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatarImageSrc} alt={displayFirstName} className="w-full h-full object-cover" />
            ) : (
              <span>{nameInitialLetter}</span>
            )}
          </a>
          <div>
            <h1 className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
              Welcome, <span className="text-[#FF8C38]">{displayFirstName}</span> 👋
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Your business dashboard & sales hub.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleShareToWhatsAppStatus()}
          className="px-3.5 py-2 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>💬 Share Link</span>
        </button>
      </div>

      {/* WHATSAPP SALES CARD FOR PAINTERS */}
      <div className={`p-5 border rounded-3xl space-y-3 shadow-md relative overflow-hidden ${
        isDark ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-stone-200 text-stone-900"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase text-[#FF8C38] flex items-center gap-1.5">
              <span>🚀 Win Clients Faster on WhatsApp</span>
            </h3>
            <p className={`text-xs leading-relaxed font-normal max-w-xl ${
              isDark ? "text-neutral-300" : "text-stone-600"
            }`}>
              Post your PaintIT business link to your WhatsApp Status or send it to clients so they can see 3D wall color previews before hiring you!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleShareToWhatsAppStatus()}
              className="px-4 py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>💬 Post to Status</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(businessPageLink);
                showToast({ message: "Business page link copied to clipboard!", severity: "success" });
              }}
              className={`px-3.5 py-2.5 border text-xs font-mono rounded-xl transition-all ${
                isDark ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-stone-100 border-stone-300 text-stone-700"
              }`}
              title="Copy Link"
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      </div>

      {isBrandNewAccount ? (
        <div className="py-4 flex items-center justify-center">
          <StepOnboarding
            title="Setup Your Dashboard"
            subtitle="Your workspace is currently empty. Follow these simple steps to build your profile and start attracting clients."
            steps={dashboardSetupSteps}
            ctaText="Continue Dashboard Setup"
            onCtaClick={handleTriggerProfileWizard}
            estimatedMinutes={3}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Actions Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="/gigs"
              className={`p-4 border rounded-2xl flex items-center gap-3 transition-all shadow-sm ${
                isDark ? "bg-neutral-950 border-neutral-800 hover:border-[#FF8C38]/50" : "bg-white border-stone-200 hover:border-[#FF8C38]"
              }`}
            >
              <span className="text-2xl">📩</span>
              <div>
                <h4 className="text-xs font-bold uppercase text-[#FF8C38]">Leads & Inbox</h4>
                <p className={`text-[10px] ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
                  {leadCount > 0 ? `${leadCount} client inquiries` : "View customer messages"}
                </p>
              </div>
            </a>

            <a
              href="/portfolio"
              className={`p-4 border rounded-2xl flex items-center gap-3 transition-all shadow-sm ${
                isDark ? "bg-neutral-950 border-neutral-800 hover:border-neutral-700" : "bg-white border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className="text-2xl">📸</span>
              <div>
                <h4 className={`text-xs font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>My Work Photos</h4>
                <p className={`text-[10px] ${isDark ? "text-neutral-500" : "text-stone-500"}`}>{contentMetrics.totalImages} photos uploaded</p>
              </div>
            </a>

            <a
              href="/profile"
              className={`p-4 border rounded-2xl flex items-center gap-3 transition-all shadow-sm ${
                isDark ? "bg-neutral-950 border-neutral-800 hover:border-neutral-700" : "bg-white border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className="text-2xl">⚙️</span>
              <div>
                <h4 className={`text-xs font-bold uppercase ${isDark ? "text-white" : "text-stone-900"}`}>Edit Profile</h4>
                <p className={`text-[10px] ${isDark ? "text-neutral-500" : "text-stone-500"}`}>{profileCompletenessScore}% profile score</p>
              </div>
            </a>
          </div>

          {/* Profile Completeness Notice */}
          {pendingOnboardingTasks.length > 0 && (
            <div className={`p-5 border rounded-2xl space-y-4 shadow-md ${
              isDark ? "bg-neutral-950 border-neutral-800" : "bg-white border-stone-200"
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${
                isDark ? "border-neutral-900" : "border-stone-200"
              }`}>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-[#FF8C38] uppercase tracking-wide flex items-center gap-1.5">
                    <span>⚠️ Complete Your Business Profile</span>
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
                    Complete profiles appear higher on the painter search directory, making it easier for homeowners to find and contact you.
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Completeness</span>
                  <span className="text-lg font-bold text-[#FF8C38]">{profileCompletenessScore}%</span>
                </div>
              </div>

              <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? "bg-neutral-900" : "bg-stone-200"}`}>
                <div
                  className="bg-[#FF8C38] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletenessScore}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {pendingOnboardingTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 border rounded-xl flex items-start gap-3 transition-colors ${
                      isDark ? "bg-black border-neutral-900" : "bg-[#FAF8F5] border-stone-200"
                    }`}
                  >
                    <div className="w-4 h-4 rounded bg-[#FF8C38]/15 border border-[#FF8C38]/30 flex items-center justify-center font-bold text-[9px] text-[#FF8C38] mt-0.5 shrink-0">
                      !
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-white" : "text-stone-900"}`}>{task.label}</h4>
                      <p className={`text-[11px] leading-relaxed mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>{task.nudgeText}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleTriggerProfileWizard}
                  className="px-4 py-2 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  Update Profile Now ➔
                </button>
              </div>
            </div>
          )}

          {/* Quick Business Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-4 border rounded-2xl shadow-xs ${isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Page Views</span>
              <span className={`text-xl font-bold block mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>{stats?.profileViews || 0}</span>
            </div>
            <div className={`p-4 border rounded-2xl shadow-xs ${isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Customer Leads</span>
              <span className="text-xl font-bold text-[#FF8C38] block mt-0.5">{leadCount}</span>
            </div>
            <div className={`p-4 border rounded-2xl shadow-xs ${isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Work Photos</span>
              <span className={`text-xl font-bold block mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>{contentMetrics.totalImages}</span>
            </div>
            <div className={`p-4 border rounded-2xl shadow-xs ${isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Response Rate</span>
              <span className={`text-xl font-bold block mt-0.5 ${isDark ? "text-white" : "text-stone-900"}`}>100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}