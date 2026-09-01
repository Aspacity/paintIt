"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { InfoTooltip } from "@/components/ui/InfoToolTip";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "painter" | "client";
  is_verified: boolean;
  created_at: string;
  bio: string | null;
  phone_number: string | null;
  location: string | null;
  experience_years: number;
  skills: string[];
}

export default function AccountProfileWorkspacePage() {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [skillsInput, setSkillsInput] = useState("");

  // Avatar Management
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const ASPACITY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const BACKEND_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchActiveProfileSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`,
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load account settings.");

        if (data.profile) {
          const p = data.profile as UserProfile;
          setProfile(p);
          setFullName(p.full_name || "");
          setBio(p.bio || "");
          setPhoneNumber(p.phone_number || "");
          setLocation(p.location || "Nigeria");
          setExperienceYears(p.experience_years || 0);
          setSkillsInput(p.skills?.join(", ") || "");

          setAvatarUrl(data.profile.avatar_url || localStorage.getItem("paintit_avatar_cache") || null);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Profile synchronization dropped.";
        setFeedbackBanner({ type: "error", msg });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveProfileSettings();
  }, [BACKEND_URL]);

  const handleAvatarFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setFeedbackBanner({ type: "error", msg: "Image size threshold exceeded. Keep images below 3MB." });
      return;
    }

    setIsUploadingAvatar(true);
    setFeedbackBanner(null);

    const mediaPayload = new FormData();
    mediaPayload.append("file", file);
    mediaPayload.append("upload_preset", "paintIt-portfolio");

    try {
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: mediaPayload,
      });

      if (!cloudinaryRes.ok) throw new Error("Asset transformation pipeline dropped via Cloudinary.");
      const uploadResult = await cloudinaryRes.json();
      const safeSecureUrl = uploadResult.secure_url;

      const backendSyncRes = await fetch(`${BACKEND_URL}/api/profile/avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`,
        },
        body: JSON.stringify({ avatarUrl: safeSecureUrl }),
      });

      if (!backendSyncRes.ok) throw new Error("Failed to register image address location coordinates with backend server.");

      setAvatarUrl(safeSecureUrl);
      localStorage.setItem("paintit_avatar_cache", safeSecureUrl);
      setFeedbackBanner({ type: "success", msg: "Profile avatar photo updated successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Media upload error.";
      setFeedbackBanner({ type: "error", msg });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackBanner(null);

    const parsedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      // 1. Sync Central Identity (Display Name) to Aspacity Identity Server
      if (fullName.trim()) {
        fetch(`${ASPACITY_URL}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`,
          },
          body: JSON.stringify({ full_name: fullName.trim(), avatar_url: avatarUrl }),
        }).catch(() => null);
      }

      // 2. Sync Product Profile Metadata to PAINTIT Product Backend
      const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          bio: bio,
          phoneNumber: phoneNumber || null,
          location: location || null,
          experienceYears: Number(experienceYears) || 0,
          skills: parsedSkills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          throw new Error(`Validation Error: ${data.details.join(" | ")}`);
        }
        throw new Error(data.error || "Failed to update profile matrix.");
      }

      setFeedbackBanner({ type: "success", msg: "Profile credentials updated successfully across Aspacity!" });

      if (data.profile) {
        setProfile((prev) => prev ? { ...prev, ...data.profile } : null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected execution error occurred.";
      setFeedbackBanner({ type: "error", msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center py-32 space-y-3 ${
        isDark ? "text-white" : "text-stone-900"
      }`}>
        <div className="w-6 h-6 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
        <span className={`text-[10px] uppercase font-bold tracking-widest ${
          isDark ? "text-neutral-500" : "text-stone-500"
        }`}>Opening Profile Settings...</span>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 max-w-2xl mx-auto md:mx-0 pb-20 animate-fade-in transition-colors duration-300 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* MOBILE-RESPONSIVE TOP HEADER BAR */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>
        <div>
          <h1 className={`text-lg sm:text-xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Painter Business Profile
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Configure your public profile, skills, experience, and communication channels.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-[#FF8C38]/15 hover:bg-[#FF8C38] border border-[#FF8C38]/30 text-[#FF8C38] hover:text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs text-center"
          >
            ⚙️ Password & Security
          </button>

          <button
            type="button"
            onClick={logout}
            className="block sm:hidden px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs text-center"
          >
            Logout 👋
          </button>
        </div>
      </div>

      {feedbackBanner && (
        <div className={`p-3.5 text-xs rounded-xl border font-semibold ${
          feedbackBanner.type === "success"
            ? "bg-[#FF8C38]/15 border-[#FF8C38]/40 text-[#FF8C38]"
            : "bg-red-500/10 border-red-500/30 text-red-500"
        }`}>
          {feedbackBanner.type === "success" ? "✅" : "⚠️"} {feedbackBanner.msg}
        </div>
      )}

      {/* AVATAR MANAGEMENT BLOCK */}
      <div className={`p-5 sm:p-6 border rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-5 shadow-md relative overflow-hidden ${
        isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
      }`}>
        <div className="w-16 h-16 rounded-2xl bg-[#FF8C38] text-black font-bold text-2xl flex items-center justify-center tracking-widest relative overflow-hidden shrink-0 shadow-xs select-none">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar profile view" className="w-full h-full object-cover" />
          ) : (
            <span>{fullName.charAt(0).toUpperCase() || "P"}</span>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left w-full sm:w-auto">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-stone-900"}`}>
              Profile Photo / Company Logo
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              Upload a clean portrait photo or company logo vector (PNG/JPG up to 3MB).
            </p>
          </div>
          <label className={`inline-block cursor-pointer px-4 py-2 border text-xs font-bold uppercase tracking-wider rounded-xl transition-all select-none ${
            isDark
              ? "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white"
              : "bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200"
          }`}>
            {isUploadingAvatar ? "Uploading Photo..." : "Choose Photo File"}
            <input
              type="file"
              accept="image/*"
              disabled={isUploadingAvatar}
              onChange={handleAvatarFileSelection}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleProfileSave} className={`space-y-5 border rounded-2xl p-5 sm:p-6 shadow-md ${
        isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
      }`}>

        {/* Read-Only Grid Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1.5 ${
              isDark ? "text-neutral-500" : "text-stone-500"
            }`}>Email Address</label>
            <div className={`w-full px-3.5 py-2.5 border rounded-xl text-xs select-all cursor-not-allowed font-medium truncate ${
              isDark ? "bg-neutral-900/40 border-neutral-900 text-neutral-400" : "bg-stone-100 border-stone-200 text-stone-600"
            }`}>
              {profile?.email}
            </div>
          </div>
          <div>
            <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1.5 text-left sm:text-center ${
              isDark ? "text-neutral-500" : "text-stone-500"
            }`}>Account Tier</label>
            <div className="w-full px-3.5 py-2.5 bg-[#FF8C38]/15 border border-[#FF8C38]/30 rounded-xl text-xs text-[#FF8C38] font-bold uppercase tracking-wider text-center select-none cursor-not-allowed">
              🛡️ {profile?.role === "painter" ? "Contractor" : "Homeowner"}
            </div>
          </div>
        </div>

        {/* Account Identity Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1.5 ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>Full Name</label>
            <input
              type="text"
              disabled
              value={fullName}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs cursor-not-allowed font-medium ${
                isDark ? "bg-neutral-900/40 border-neutral-900 text-neutral-400" : "bg-stone-100 border-stone-200 text-stone-600"
              }`}
            />
          </div>
          <div>
            <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1.5 ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>Phone Line (WhatsApp preferred)</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., +234 812 345 6789"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors font-medium focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1.5 ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>Location / Base Area</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Bodija, Ibadan"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors font-medium focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>
          <div>
            <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1.5 ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>Years of Experience</label>
            <input
              type="number"
              min={0}
              max={50}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors font-medium focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900"
              }`}
            />
          </div>
        </div>

        {/* Finish Specializations */}
        {profile?.role === "painter" && (
          <div className="space-y-1.5 animate-fade-in">
            <label className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>
              Finish Specializations (Comma Separated)
              <InfoTooltip
                title="Specialist Swatches"
                what="A list of specific finishes or texturing styles you offer."
                why="Clients look for these skills to verify you can execute advanced remodeling work."
              />
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g., Satin Finishes, Matte Coatings, POP Screeding, Stucco Texturing"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors font-medium focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />

            {skillsInput.trim().length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {skillsInput.split(",").map((skill, index) => {
                  const cleanSkill = skill.trim();
                  if (!cleanSkill) return null;
                  return (
                    <span key={index} className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-md uppercase tracking-wide ${
                      isDark ? "bg-black border-neutral-800 text-neutral-300" : "bg-stone-100 border-stone-300 text-stone-700"
                    }`}>
                      ⚡ {cleanSkill}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1.5 ${
            isDark ? "text-neutral-400" : "text-stone-600"
          }`}>Professional Bio Description</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell prospective clients about your finish techniques, quality standards, and workspace cleanup guarantees..."
            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors font-medium resize-none focus:outline-none focus:border-[#FF8C38] ${
              isDark
                ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
            }`}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-[#FF8C38] hover:bg-[#ff9e54] disabled:bg-stone-300 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
          >
            {isSaving ? "Saving Profile..." : "Save Profile Setup ➔"}
          </button>
        </div>

      </form>
    </div>
  );
}