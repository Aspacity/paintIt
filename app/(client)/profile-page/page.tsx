"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function ClientProfilePage() {
  const { accessToken, logout } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Profile data states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  // Security passphrase states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation modal triggers
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!accessToken) return;

    const fetchClientIdentity = async () => {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/profile/me`, {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });

        if (res.ok) {
          const body = await res.json();
          if (body.profile) {
            setEmail(body.profile.email || "");
            setFullName(body.profile.full_name || "");
          }
        }
      } catch (err) {
        console.error("Failed loading client profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientIdentity();
  }, [accessToken, BACKEND_API_URL]);

  const handleValidationCheck = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast({ message: "Name field cannot be empty.", severity: "error" });
      return;
    }

    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword !== confirmPassword) {
        showToast({ message: "Your new passwords do not match.", severity: "error" });
        return;
      }
      if (newPassword.length < 6) {
        showToast({ message: "New password must be at least 6 characters long.", severity: "error" });
        return;
      }
      if (!currentPassword) {
        showToast({ message: "Current password is required to verify changes.", severity: "error" });
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
        showToast({ message: data.error || "Failed updating profile settings.", severity: "error" });
        setConfirmOpen(false);
      }
    } catch (err) {
      console.error("Client identity update error:", err);
      showToast({ message: "Network transaction error.", severity: "error" });
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center py-32 space-y-3 ${
        isDark ? "text-white" : "text-stone-900"
      }`}>
        <div className="w-5 h-5 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
        <span className={`text-[10px] uppercase font-bold tracking-widest ${
          isDark ? "text-neutral-500" : "text-stone-500"
        }`}>Opening Profile...</span>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 max-w-2xl mx-auto md:mx-0 pb-20 animate-fade-in transition-colors duration-300 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* RESPONSIVE HEADER BAR */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>
        <div>
          <h1 className={`text-lg sm:text-xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            My Account Profile
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Manage your personal profile and security credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="self-start sm:self-auto px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-bold text-xs rounded-xl transition-all shadow-xs"
        >
          Logout 👋
        </button>
      </div>

      {/* CORE PROFILE CARDS */}
      <form onSubmit={handleValidationCheck} className="space-y-6">

        <div className={`border rounded-2xl p-5 sm:p-6 space-y-4 shadow-md ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-2 ${
            isDark ? "text-neutral-400 border-neutral-900" : "text-stone-500 border-stone-200"
          }`}>
            Identity Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className={`text-[10px] uppercase font-bold tracking-wider block ${
                isDark ? "text-neutral-500" : "text-stone-500"
              }`}>Email Address</label>
              <div className={`w-full px-3.5 py-2.5 border rounded-xl text-xs select-all cursor-not-allowed font-medium truncate ${
                isDark ? "bg-neutral-900/40 border-neutral-900 text-neutral-400" : "bg-stone-100 border-stone-200 text-stone-600"
              }`}>
                {email}
              </div>
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-bold tracking-wider block text-left sm:text-center ${
                isDark ? "text-neutral-500" : "text-stone-500"
              }`}>Account Tier</label>
              <div className="w-full px-3.5 py-2.5 bg-[#FF8C38]/15 border border-[#FF8C38]/30 rounded-xl text-xs text-[#FF8C38] font-bold uppercase tracking-wider text-center select-none cursor-not-allowed">
                🏡 Homeowner
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className={`text-[10px] uppercase font-bold tracking-wider block ${
              isDark ? "text-neutral-400" : "text-stone-600"
            }`}>
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Adebayo Ibrahim"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900"
              }`}
            />
          </div>
        </div>

        <div className={`border rounded-2xl p-5 sm:p-6 space-y-4 shadow-md ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-2 ${
            isDark ? "text-neutral-400 border-neutral-900" : "text-stone-500 border-stone-200"
          }`}>
            Password Rotation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-bold tracking-wider block ${
                isDark ? "text-neutral-400" : "text-stone-600"
              }`}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors focus:outline-none focus:border-[#FF8C38] ${
                  isDark
                    ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                    : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-bold tracking-wider block ${
                isDark ? "text-neutral-400" : "text-stone-600"
              }`}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors focus:outline-none focus:border-[#FF8C38] ${
                  isDark
                    ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                    : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
                }`}
              />
            </div>
          </div>

          <div className={`space-y-1 pt-3 border-t ${
            isDark ? "border-neutral-900" : "border-stone-200"
          }`}>
            <label className="text-[10px] uppercase tracking-wider text-[#FF8C38] font-bold block">
              Verify Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Input current password to authorize changes..."
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors focus:outline-none focus:border-[#FF8C38] ${
                isDark
                  ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
              }`}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
          >
            Update Profile Setup ➔
          </button>
        </div>

      </form>

      {/* CONFIRMATION OVERLAY MODAL */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeUpdatePipeline}
        title={successState ? "Changes Saved" : "Save Profile Updates?"}
        message={
          successState
            ? "Your client profile settings have been synchronized."
            : "Are you sure you want to save these modifications to your account?"
        }
        confirmText={isSubmitting ? "Saving..." : "Apply Updates"}
        cancelText="Cancel Changes"
        isSuccessState={successState}
      />

    </div>
  );
}