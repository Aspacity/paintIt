"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const emailContext = searchParams?.get("email") || null;
  const tokenContext = searchParams?.get("token") || null;
  const hasValidToken = !!(emailContext && tokenContext && tokenContext.length === 6);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword || !hasValidToken) return;

    if (password.length < 6) {
      showToast({ message: "Password must be at least 6 characters long.", severity: "error" });
      return;
    }

    if (password !== confirmPassword) {
      showToast({ message: "Passwords do not match.", severity: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailContext,
          otpCode: tokenContext,
          newPassword: password,
        }),
      });

      if (response.ok) {
        showToast({ message: "Password updated successfully! Redirecting to sign in...", severity: "success" });
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      } else {
        const data = await response.json();
        showToast({ message: data.error || "Failed to update password.", severity: "error" });
      }
    } catch {
      showToast({ message: "Network connection error.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-left">
      <div>
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
          Set New Password
        </h2>
        <p className={`text-xs mt-1 leading-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
          Enter and confirm your new password below.
        </p>
      </div>

      {!hasValidToken && (
        <div className="p-3 text-xs rounded-xl border font-medium bg-red-950/20 border-red-900/40 text-red-400">
          ⚠️ Missing or invalid reset verification code link.
        </div>
      )}

      <form onSubmit={handleResetSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <label htmlFor="newPassword" className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            disabled={!hasValidToken}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors focus:outline-none focus:border-[#FF8C38] ${
              isDark
                ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
            }`}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            disabled={!hasValidToken}
            required
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

        <button
          type="submit"
          disabled={isSubmitting || !password || !confirmPassword || !hasValidToken}
          className="w-full py-3 mt-1 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            "Save New Password"
          )}
        </button>
      </form>

      <div className={`text-center text-xs pt-3 border-t ${isDark ? "border-neutral-800 text-neutral-400" : "border-stone-200 text-stone-600"}`}>
        Back to{" "}
        <Link href="/login" className="text-[#FF8C38] font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-6 text-xs text-neutral-400">Loading password setup...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}