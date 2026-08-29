"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const role = searchParams.get("role") || "CONSUMER";
    const email = searchParams.get("email") || "";
    const name = searchParams.get("name") || "User Account";
    const error = searchParams.get("error");

    if (error) {
      showToast({ message: `Google Sign-In Error: ${error}`, severity: "error" });
      router.push("/login");
      return;
    }

    if (token && refreshToken) {
      showToast({ message: "Google authentication validated! Syncing session...", severity: "success" });

      login(token, refreshToken, {
        id: "google_user",
        email,
        fullName: name,
        role,
      });

      setTimeout(() => {
        if (role === "ADMIN") {
          router.push("/admin/playground");
        } else if (role === "PAINTER") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 500);
    } else {
      showToast({ message: "Invalid callback params. Please try logging in again.", severity: "error" });
      router.push("/login");
    }
  }, [searchParams, login, router, showToast]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 text-center ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      <div className="space-y-4 max-w-sm">
        <div className="w-12 h-12 border-4 border-[#FF8C38] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-lg font-bold">Completing Google Sign-In</h2>
        <p className="text-xs text-neutral-400">Authenticating credentials with PaintIT Studio OS...</p>
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
