"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send reset code.");

      sessionStorage.setItem("paintit_verification_email", email.toLowerCase().trim());
      showToast({ message: "Reset code sent! Redirecting to verification...", severity: "success" });

      setTimeout(() => {
        router.push("/verify-otp?purpose=recovery");
      }, 1200);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error occurred.";
      showToast({ message: msg, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-left">
      <div>
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
          Recover Account Password
        </h2>
        <p className={`text-xs mt-1 leading-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
          Enter your registered email address to receive a 6-digit security code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="recoveryEmail" className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Registered Email
          </label>
          <input
            id="recoveryEmail"
            type="email"
            required
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

        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="w-full py-3 mt-1 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            "Send Reset Code"
          )}
        </button>
      </form>

      <div className={`text-center text-xs pt-3 border-t ${isDark ? "border-neutral-800 text-neutral-400" : "border-stone-200 text-stone-600"}`}>
        Remember your password?{" "}
        <Link href="/login" className="text-[#FF8C38] font-bold hover:underline">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}