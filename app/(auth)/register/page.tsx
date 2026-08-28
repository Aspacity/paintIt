"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import { UserRole } from "@/types";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isPainterParam = searchParams.get("role") === "painter";
  const initialRole: UserRole = isPainterParam ? "PAINTER" : "CONSUMER";

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleExecuteSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      showToast({ message: "Please fill out all registration fields.", severity: "error" });
      return;
    }

    if (password.length < 6) {
      showToast({ message: "Password must be at least 6 characters long.", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          role: initialRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Account registration rejected.");
      }

      sessionStorage.setItem("paintit_verification_email", email.toLowerCase().trim());
      showToast({ message: "Registration successful! Verification token sent.", severity: "success" });
      router.push("/verify-otp");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "A network exception occurred.";
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    showToast({ message: "Google Sign-Up initiated. Redirecting to OAuth provider...", severity: "info" });
    window.location.href = `${BACKEND_API_URL}/api/auth/google`;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header Context */}
      <div className="text-center">
        {isPainterParam ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8C38]/15 text-[#FF8C38] text-[11px] font-bold mb-2 border border-[#FF8C38]/30">
            <span>🎨</span>
            <span>Professional Contractor Registration</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8C38]/15 text-[#FF8C38] text-[11px] font-bold mb-2 border border-[#FF8C38]/30">
            <span>🏡</span>
            <span>Homeowner / Visitor Account</span>
          </div>
        )}

        <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
          {isPainterParam ? "Grow Your Painting Business" : "Create Your Account"}
        </h2>
        <p className={`text-xs mt-1 leading-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
          {isPainterParam
            ? "Present visual room concepts, win more client bids, and close projects faster."
            : "See your colors before the first brush stroke."}
        </p>
      </div>

      {/* Google Sign-Up Feature */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs ${
          isDark
            ? "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
            : "bg-white hover:bg-stone-50 text-stone-800 border-stone-300"
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign up with Google</span>
      </button>

      {/* Divider Line */}
      <div className="relative flex items-center my-3">
        <div className={`grow border-t ${isDark ? "border-neutral-800" : "border-stone-200"}`} />
        <span className={`shrink mx-3 text-[10px] uppercase font-bold tracking-wider ${isDark ? "text-neutral-500" : "text-stone-400"}`}>
          or register with email
        </span>
        <div className={`grow border-t ${isDark ? "border-neutral-800" : "border-stone-200"}`} />
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleExecuteSignup} className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1">
          <label htmlFor="fullName" className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            disabled={submitting}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Sarah Jenkins"
            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors focus:outline-none focus:border-[#FF8C38] ${
              isDark
                ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
            }`}
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label htmlFor="email" className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@example.com"
            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs transition-colors focus:outline-none focus:border-[#FF8C38] ${
              isDark
                ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600"
                : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
            }`}
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="password" className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            disabled={submitting}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 mt-1 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : isPainterParam ? (
            "Create Professional Account"
          ) : (
            "Create Free Account"
          )}
        </button>
      </form>

      {/* Bottom Signpost Links */}
      <div className={`space-y-2 text-center text-xs pt-3 border-t ${isDark ? "border-neutral-800 text-neutral-400" : "border-stone-200 text-stone-600"}`}>
        <div>
          Already have an account?{" "}
          <Link href="/login" className="text-[#FF8C38] font-bold hover:underline">
            Log In
          </Link>
        </div>

        {isPainterParam ? (
          <div>
            Looking to visualize your space as a homeowner?{" "}
            <Link href="/register" className="text-[#FF8C38] font-bold hover:underline">
              Sign up as Homeowner
            </Link>
          </div>
        ) : (
          <div>
            Are you a painter or contractor?{" "}
            <Link href="/register?role=painter" className="text-[#FF8C38] font-bold hover:underline">
              Sign up as Professional
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="py-8 text-center text-xs text-neutral-400">
        Loading onboarding portal...
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}