"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

function VerifyOTPForm() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useAlert();
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const isRecoveryFlow = useMemo(() => {
    return searchParams?.get("purpose") === "recovery";
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const triggerAutoSubmit = async (completeCode: string) => {
    const verificationEmail = sessionStorage.getItem("paintit_verification_email");

    if (!verificationEmail) {
      showToast({ message: "Verification context missing. Please request a code again.", severity: "error" });
      router.push(isRecoveryFlow ? "/forgot-password" : "/register");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          otpCode: completeCode,
          isRecovery: isRecoveryFlow,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code.");
      }

      showToast({ message: "Account activated successfully!", severity: "success" });

      if (isRecoveryFlow) {
        sessionStorage.removeItem("paintit_verification_email");
        router.push(`/reset-password?email=${encodeURIComponent(verificationEmail)}&token=${completeCode}`);
      } else {
        sessionStorage.removeItem("paintit_verification_email");
        if (data.accessToken && data.refreshToken && data.user) {
          login(data.accessToken, data.refreshToken, {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.fullName || data.user.full_name || "User Account",
            role: data.user.role,
          });
          router.push(data.user.role === "ADMIN" ? "/admin/playground" : "/dashboard");
        } else {
          router.push("/login");
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification error occurred.";
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const processPastedCode = (pastedText: string) => {
    const digitsOnly = pastedText.replace(/[^0-9]/g, "").substring(0, 6);
    if (digitsOnly.length > 0) {
      const newOtp = new Array(6).fill("");
      for (let i = 0; i < digitsOnly.length; i++) {
        newOtp[i] = digitsOnly[i];
      }
      setOtp(newOtp);

      if (digitsOnly.length === 6) {
        showToast({ message: "6-digit code detected! Verifying...", severity: "info" });
        if (inputRefs.current[5]) {
          inputRefs.current[5].focus();
        }
        triggerAutoSubmit(digitsOnly);
      } else {
        const nextIndex = Math.min(digitsOnly.length, 5);
        if (inputRefs.current[nextIndex]) {
          inputRefs.current[nextIndex].focus();
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    processPastedCode(pastedData);
  };

  const handleClipboardButtonClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText) {
          processPastedCode(clipboardText);
        } else {
          showToast({ message: "Clipboard is empty.", severity: "info" });
        }
      } else {
        showToast({ message: "Please use Ctrl+V / Cmd+V on any digit box to paste.", severity: "info" });
      }
    } catch {
      showToast({ message: "Paste using Ctrl+V or Cmd+V directly in the input boxes.", severity: "info" });
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newOtp = [...otp];
    const singleDigit = value.substring(value.length - 1);
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    const currentFullCode = newOtp.join("");
    if (currentFullCode.length === 6) {
      triggerAutoSubmit(currentFullCode);
      return;
    }

    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (newOtp[index] !== "") {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const completeCode = otp.join("");

    if (completeCode.length !== 6) {
      showToast({ message: "Please enter the complete 6-digit verification code.", severity: "error" });
      return;
    }

    await triggerAutoSubmit(completeCode);
  };

  const handleResendOtpCode = async () => {
    const verificationEmail = sessionStorage.getItem("paintit_verification_email");
    if (!verificationEmail) {
      showToast({ message: "Verification session expired. Please request again.", severity: "error" });
      return;
    }

    setResending(true);
    try {
      const endpoint = isRecoveryFlow ? "/api/auth/forgot-password" : "/api/auth/resend-otp";

      const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });

      if (!response.ok) throw new Error("Failed to dispatch fresh OTP code.");

      showToast({ message: "A fresh 6-digit code has been sent to your email.", severity: "success" });
      setCountdown(60);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend code.";
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-center">
      <div>
        <div className="w-12 h-12 bg-[#FF8C38]/15 border border-[#FF8C38]/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
          <svg className="w-6 h-6 text-[#FF8C38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-7.618 3.013C5.4 10.016 7.421 17.152 12 21a11.955 11.955 0 007.618-15.043z" />
          </svg>
        </div>
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
          Verify Your Account
        </h2>
        <p className={`text-xs mt-1.5 px-2 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
          Enter or paste the 6-digit security code sent to your email.
        </p>
      </div>

      <form onSubmit={handleSubmitVerification} className="space-y-4">
        {/* 6 Digit Input Grid */}
        <div className="grid grid-cols-6 max-w-xs mx-auto gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => { if (el) inputRefs.current[index] = el; }}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className={`w-full aspect-square border text-center text-lg font-bold rounded-xl focus:border-[#FF8C38] focus:outline-none transition-all flex items-center justify-center p-0 ${
                isDark
                  ? "bg-black border-neutral-800 text-[#FF8C38]"
                  : "bg-[#FAF8F5] border-stone-300 text-stone-900"
              }`}
            />
          ))}
        </div>

        {/* Quick Paste Code Action */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleClipboardButtonClick}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              isDark
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
            }`}
          >
            <span>📋</span>
            <span>Paste Code from Clipboard</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            "Verify & Continue"
          )}
        </button>
      </form>

      {/* Resend Code Section */}
      <div className={`text-xs pt-3 border-t ${isDark ? "border-neutral-800 text-neutral-400" : "border-stone-200 text-stone-600"}`}>
        Didn&apos;t receive the code?{" "}
        {countdown > 0 ? (
          <span className="font-semibold text-neutral-500">Resend in {countdown}s</span>
        ) : (
          <button
            onClick={handleResendOtpCode}
            disabled={resending}
            className="text-[#FF8C38] font-bold hover:underline bg-transparent border-none outline-none cursor-pointer"
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center py-6 text-xs text-neutral-400">Loading verification session...</div>}>
      <VerifyOTPForm />
    </Suspense>
  );
}