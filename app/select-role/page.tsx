"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import { UserRole } from "@/types";
import RoleSelectionCardGroup from "@/components/auth/RoleSelectionCardGroup";
import Logo from "@/components/common/Logo";

function SelectRoleFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUser, isAuthenticated } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const defaultRoleFromParam = searchParams.get("role") === "painter" ? "PAINTER" : "CONSUMER";
  const currentRole: UserRole = user?.role ? (user.role as UserRole) : defaultRoleFromParam;

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role as UserRole);
    }
  }, [user?.role]);

  const handleConfirmRole = async () => {
    setSubmitting(true);
    try {
      // Update local auth context & session storage
      updateUser({ role: selectedRole });

      // Save role selection in local storage for persistence across reloads
      const storedUserData = localStorage.getItem("paintit_user_data");
      if (storedUserData) {
        try {
          const parsed = JSON.parse(storedUserData);
          parsed.role = selectedRole;
          localStorage.setItem("paintit_user_data", JSON.stringify(parsed));
        } catch (e) {
          console.warn("Error updating user data in local storage:", e);
        }
      }

      showToast({
        message: `Account set up as ${selectedRole === "PAINTER" ? "Professional Painter" : "Homeowner / Client"}!`,
        severity: "success",
      });

      // Redirect to correct workspace domain
      if (selectedRole === "PAINTER") {
        router.push("/dashboard");
      } else {
        router.push("/hub");
      }
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : "Failed to update role.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-x-hidden ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      {/* Background Ambient Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-96 rounded-full blur-[140px] pointer-events-none ${
        isDark ? "bg-[#FF8C38]/15" : "bg-[#FF8C38]/10"
      }`} />

      {/* Header Context Brand Mark */}
      <div className="mb-6 text-center z-10">
        <Logo size="lg" textColor={isDark ? "text-white" : "text-stone-900"} />
      </div>

      <div className={`w-full max-w-xl relative z-10 border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${
        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-stone-200"
      }`}>
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8C38]/15 text-[#FF8C38] text-[11px] font-bold border border-[#FF8C38]/30">
            <span>✨</span>
            <span>Welcome to Aspacity PaintIT</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Choose Your Account Type
          </h1>

          <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Please select how you plan to use PaintIT. This configures your dashboard, 3D studio tools, and project features.
          </p>
        </div>

        {/* Role Cards */}
        <RoleSelectionCardGroup
          selectedRole={selectedRole}
          onSelectRole={(role) => setSelectedRole(role)}
          disabled={submitting}
        />

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirmRole}
            disabled={submitting}
            className="w-full py-3.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-sm rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>
                Continue as {selectedRole === "PAINTER" ? "Professional Painter 🎨" : "Homeowner / Client 🏡"}
              </span>
            )}
          </button>
        </div>

        <p className={`text-[11px] text-center ${isDark ? "text-neutral-500" : "text-stone-400"}`}>
          Registered by mistake? You can switch account types anytime in your Profile & Account Settings.
        </p>
      </div>
    </div>
  );
}

export default function SelectRolePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xs">
        Loading Role Portal...
      </div>
    }>
      <SelectRoleFormContent />
    </Suspense>
  );
}
