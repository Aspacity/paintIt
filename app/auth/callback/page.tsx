"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import { UserRole } from "@/types";
import RoleSelectionCardGroup from "@/components/auth/RoleSelectionCardGroup";
import Logo from "@/components/common/Logo";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, updateUser } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [showRoleStep, setShowRoleStep] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("PAINTER");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const roleParam = searchParams.get("role");
    const promptRoleParam = searchParams.get("prompt_role") === "true";
    const role: UserRole = (roleParam === "PAINTER" || roleParam === "ADMIN") ? (roleParam as UserRole) : "CONSUMER";
    const email = searchParams.get("email") || "";
    const name = searchParams.get("name") || "User Account";
    const error = searchParams.get("error");

    if (error) {
      showToast({ message: `Google Sign-In Error: ${error}`, severity: "error" });
      router.push("/login");
      return;
    }

    if (token && refreshToken) {
      login(token, refreshToken, {
        id: "google_user",
        email,
        fullName: name,
        role,
      });

      setSelectedRole(role);

      // If prompt_role is explicitly set or if new registration flow, allow immediate role confirmation
      if (promptRoleParam) {
        setShowRoleStep(true);
      } else {
        showToast({ message: "Google authentication validated!", severity: "success" });
        setTimeout(() => {
          if (role === "ADMIN") {
            router.push("/admin/playground");
          } else if (role === "PAINTER") {
            router.push("/dashboard");
          } else {
            router.push("/hub");
          }
        }, 500);
      }
    } else {
      showToast({ message: "Invalid callback params. Please try logging in again.", severity: "error" });
      router.push("/login");
    }
  }, [searchParams, login, router, showToast]);

  const handleConfirmRole = async () => {
    setSubmitting(true);
    try {
      updateUser({ role: selectedRole });
      showToast({
        message: `Account configured as ${selectedRole === "PAINTER" ? "Professional Painter" : "Homeowner / Client"}!`,
        severity: "success",
      });

      if (selectedRole === "PAINTER") {
        router.push("/dashboard");
      } else {
        router.push("/hub");
      }
    } catch {
      showToast({ message: "Error updating account role.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (showRoleStep) {
    return (
      <div className={`min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-x-hidden ${
        isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
      }`}>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-96 rounded-full blur-[140px] pointer-events-none ${
          isDark ? "bg-[#FF8C38]/15" : "bg-[#FF8C38]/10"
        }`} />

        <div className="mb-6 text-center z-10">
          <Logo size="lg" textColor={isDark ? "text-white" : "text-stone-900"} />
        </div>

        <div className={`w-full max-w-xl relative z-10 border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-stone-200"
        }`}>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8C38]/15 text-[#FF8C38] text-[11px] font-bold border border-[#FF8C38]/30">
              <span>🎉</span>
              <span>Google Registration Complete</span>
            </div>

            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
              Confirm Your Account Type
            </h1>

            <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              Are you using PaintIT as a professional painter or as a client/homeowner?
            </p>
          </div>

          <RoleSelectionCardGroup
            selectedRole={selectedRole}
            onSelectRole={(role) => setSelectedRole(role)}
            disabled={submitting}
          />

          <button
            type="button"
            onClick={handleConfirmRole}
            disabled={submitting}
            className="w-full py-3.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Continue to Dashboard as {selectedRole === "PAINTER" ? "Painter 🎨" : "Client 🏡"}</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 text-center ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      <div className="space-y-4 max-w-sm">
        <div className="w-12 h-12 border-4 border-[#FF8C38] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-lg font-bold">Completing Google Sign-In</h2>
        <p className="text-xs text-neutral-400">Authenticating credentials with PaintIT...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xs">
        Loading OAuth Session...
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
