"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { login } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleExecuteLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast({ message: "Please enter your email and password.", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password
        }),
      });

      const data = await response.json();

      if (response.status === 403 && (data.error?.includes("verify") || data.requiresVerification)) {
        const targetEmail = data.email || email.toLowerCase().trim();
        sessionStorage.setItem("paintit_verification_email", targetEmail);
        showToast({ message: "Account unverified. Verification code sent!", severity: "info" });
        window.location.href = "/verify-otp";
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      showToast({ message: "Login successful! Syncing profile...", severity: "success" });

      login(data.accessToken, data.refreshToken, {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName || data.user.full_name || "User Account",
        role: data.user.role
      });

      if (redirect) {
        setTimeout(() => {
          window.location.href = redirect;
        }, 100);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected login error occurred.";
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    showToast({ message: "Google Sign-In initiated. Redirecting...", severity: "info" });
    window.location.href = `${BACKEND_API_URL}/api/auth/google`;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
          Sign In with Aspacity
        </h2>
        <p className={`text-xs mt-1 leading-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
          Your Aspacity account gives you access to PAINTIT and other Aspacity products.
        </p>
      </div>

      {/* Google Sign-In Feature */}
      <button
        type="button"
        onClick={handleGoogleLogin}
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
        <span>Sign in with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center my-3">
        <div className={`grow border-t ${isDark ? "border-neutral-800" : "border-stone-200"}`} />
        <span className={`shrink mx-3 text-[10px] uppercase font-bold tracking-wider ${isDark ? "text-neutral-500" : "text-stone-400"}`}>
          or sign in with email
        </span>
        <div className={`grow border-t ${isDark ? "border-neutral-800" : "border-stone-200"}`} />
      </div>

      <form onSubmit={handleExecuteLogin} className="space-y-3.5">
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

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
              Password
            </label>
            <Link href="/forgot-password" className="text-[10px] font-bold text-[#FF8C38] hover:underline uppercase tracking-wider">
              Forgot?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 mt-1 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign In to Account"
          )}
        </button>
      </form>

      <div className={`text-center text-xs pt-3 border-t ${isDark ? "border-neutral-800 text-neutral-400" : "border-stone-200 text-stone-600"}`}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#FF8C38] font-bold hover:underline">
          Register Here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="py-8 text-center text-xs text-neutral-400">
        Loading sign in portal...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}