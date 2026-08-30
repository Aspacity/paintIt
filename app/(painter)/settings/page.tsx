"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function PainterAccountSettingsPage() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");

  // Security Credentials Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State Triggers
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!accessToken) return;

    const fetchCurrentIdentityContext = async () => {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/profile/me`, {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const body = await res.json();
          if (body.profile) {
            setFullName(body.profile.full_name || "");
            setLocation(body.profile.location || "");
          }
        }
      } catch (err) {
        console.error("Failed loading current account variables:", err);
      }
    };

    fetchCurrentIdentityContext();
  }, [accessToken, BACKEND_API_URL]);

  const validateAndPromptConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword !== confirmPassword) {
        showToast({ message: "New password fields do not match.", severity: "error" });
        return;
      }
      if (newPassword.length < 6) {
        showToast({ message: "New password must be at least 6 characters long.", severity: "error" });
        return;
      }
      if (!currentPassword) {
        showToast({ message: "Please input your current password to authorize security changes.", severity: "error" });
        return;
      }
    }

    setSuccessState(false);
    setConfirmOpen(true);
  };

  const executeUpdatePipeline = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/update-account`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          location,
          currentPassword: currentPassword || null,
          newPassword: newPassword || null
        })
      });

      if (response.ok) {
        setSuccessState(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          setConfirmOpen(false);
        }, 1500);
      } else {
        const data = await response.json();
        showToast({ message: data.error || "Failed updating account parameters.", severity: "error" });
        setConfirmOpen(false);
      }
    } catch (err) {
      console.error("Update request transaction dropped:", err);
      showToast({ message: "Network connection error.", severity: "error" });
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full space-y-8 animate-fade-in pb-16 transition-colors duration-300 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* HEADER */}
      <div className={`border-b pb-5 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
        <h1 className={`text-xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
          Security & Account Settings
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
          Modify your studio branding credentials and update your security passwords.
        </p>
      </div>

      <form onSubmit={validateAndPromptConfirm} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">

        {/* LEFT COLUMN: PROFILE DETAILS */}
        <div className={`border rounded-2xl p-6 space-y-4 shadow-md ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b ${
            isDark ? "text-neutral-400 border-neutral-850" : "text-stone-700 border-stone-200"
          }`}>
            Studio Details
          </h3>

          <div className="space-y-1.5">
            <label className={`text-[10px] uppercase font-bold tracking-wider block pl-0.5 ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>
              Full Contractor Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Samuel Tijesunimi"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] uppercase font-bold tracking-wider block pl-0.5 ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>
              Operating Location Area
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ibadan, Nigeria"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY & PASSWORD */}
        <div className={`border rounded-2xl p-6 space-y-4 shadow-md ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b ${
            isDark ? "text-neutral-400 border-neutral-850" : "text-stone-700 border-stone-200"
          }`}>
            Update Security Password
          </h3>

          <div className="space-y-1.5">
            <label className={`text-[10px] uppercase font-bold tracking-wider block pl-0.5 ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>
              New Password Choice
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] uppercase font-bold tracking-wider block pl-0.5 ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>

          <div className={`space-y-1.5 pt-2 border-t ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
            <label className="text-[10px] uppercase tracking-wider text-[#FF8C38] font-bold block pl-0.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required to commit updates..."
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>
        </div>

        {/* BUTTON */}
        <div className="md:col-span-2 flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center active:scale-95"
          >
            Save Account Settings ➔
          </button>
        </div>

      </form>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeUpdatePipeline}
        title={successState ? "Settings Saved Successfully" : "Commit Profile Changes?"}
        message={
          successState
            ? "Your identity modifications and password hashes were successfully updated."
            : "Are you sure you want to write these modifications into your profile?"
        }
        confirmText={isSubmitting ? "Updating..." : "Confirm Save"}
        cancelText="Cancel"
        isSuccessState={successState}
      />

    </div>
  );
}