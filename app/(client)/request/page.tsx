"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

function RequestFormWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const painterId = searchParams.get("painterId") || "08e04f03-4d8d-44d4-aac7-df458827a04c";

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    projectLocation: "",
    spaceType: "Residential Living Room",
    finishStyle: "Satin Finishes",
    budget: "",
    projectNotes: ""
  });

  const BACKEND_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const executeFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorBanner(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painterId, ...formData })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit project request.");

      setSuccessState(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error during submission.";
      setErrorBanner(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successState) {
    return (
      <div className={`max-w-md mx-auto text-center py-16 border rounded-3xl p-8 space-y-4 shadow-2xl animate-fade-in ${
        isDark ? "bg-neutral-950 border-neutral-900 text-white" : "bg-white border-stone-200 text-stone-900"
      }`}>
        <div className="w-12 h-12 rounded-full bg-[#FF8C38]/15 border border-[#FF8C38] flex items-center justify-center text-xl mx-auto text-[#FF8C38]">🎉</div>
        <h2 className={`text-base font-bold uppercase tracking-wide ${isDark ? "text-white" : "text-stone-900"}`}>Project Request Sent!</h2>
        <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
          Your project specifications have been sent to the painter contractor workspace.
        </p>
        <button
          onClick={() => router.push("/search/painters")}
          className="w-full mt-4 py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
        >
          Return to Marketplace Directory
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-lg mx-auto space-y-6 animate-fade-in pb-16 transition-colors duration-300 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>

      {/* Stepper Header Tracker */}
      <div className={`border-b pb-4 text-center sm:text-left flex items-center justify-between ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>
        <div>
          <h1 className={`text-lg font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            Consultation Request
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
            Specify job criteria to receive an accurate quote.
          </p>
        </div>
        <span className={`text-[10px] font-mono border px-3 py-1 rounded-lg font-bold uppercase tracking-wider ${
          isDark ? "bg-neutral-900 border-neutral-800 text-neutral-400" : "bg-stone-100 border-stone-300 text-stone-700"
        }`}>
          Step {step} of 3
        </span>
      </div>

      {errorBanner && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-medium">
          ⚠️ {errorBanner}
        </div>
      )}

      <form onSubmit={executeFormSubmission} className={`border rounded-3xl p-6 space-y-5 shadow-xl ${
        isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
      }`}>

        {/* STEP 1: CONTACT INFO */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF8C38] mb-2">Communication Info</h3>
            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase font-bold block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Your Full Name</label>
              <input
                type="text"
                name="clientName"
                required
                value={formData.clientName}
                onChange={handleInputChange}
                placeholder="e.g., Idowu Tijesunimi"
                className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                  isDark ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600" : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
                }`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase font-bold block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Email Address</label>
                <input
                  type="email"
                  name="clientEmail"
                  required
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="name@domain.com"
                  className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                    isDark ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600" : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase font-bold block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Phone Line</label>
                <input
                  type="tel"
                  name="clientPhone"
                  required
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="e.g., +234..."
                  className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                    isDark ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600" : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: REMODELING SCOPE */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF8C38] mb-2">Space & Painting Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase font-bold block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Target Space</label>
                <select
                  name="spaceType"
                  value={formData.spaceType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                    isDark ? "bg-black border-neutral-800 text-white" : "bg-[#FAF8F5] border-stone-300 text-stone-900"
                  }`}
                >
                  <option value="Residential Living Room">Residential Room</option>
                  <option value="Full Duplex Transformation">Full Duplex Transformation</option>
                  <option value="Commercial Office Workspace">Commercial Office Workspace</option>
                  <option value="Cinematic Accent Wall Structure">Accent Wall</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase font-bold block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Desired Finish</label>
                <select
                  name="finishStyle"
                  value={formData.finishStyle}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                    isDark ? "bg-black border-neutral-800 text-white" : "bg-[#FAF8F5] border-stone-300 text-stone-900"
                  }`}
                >
                  <option value="Satin Finishes">Premium Satin / Silk Coat</option>
                  <option value="Stucco Texturing">Velvet Stucco Texturing</option>
                  <option value="POP Screeding Calibration">POP Screeding</option>
                  <option value="Metallic Epoxy Layers">Metallic Epoxy Coating</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase font-bold block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Site Location</label>
              <input
                type="text"
                name="projectLocation"
                required
                value={formData.projectLocation}
                onChange={handleInputChange}
                placeholder="e.g., Bodija, Ibadan, Nigeria"
                className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                  isDark ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600" : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
                }`}
              />
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET & NOTES */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF8C38] mb-2">Budget & Project Notes</h3>
            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase font-bold block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Estimated Allocation Budget (₦)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="e.g., 450000"
                className={`w-full px-4 py-3 border rounded-xl text-xs focus:outline-none focus:border-[#FF8C38] ${
                  isDark ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600" : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase font-bold block ${isDark ? "text-neutral-400" : "text-stone-600"}`}>Project Notes / Details</label>
              <textarea
                name="projectNotes"
                rows={4}
                value={formData.projectNotes}
                onChange={handleInputChange}
                placeholder="Detail spatial layout, wall condition, or clean-up parameters..."
                className={`w-full px-4 py-3 border rounded-xl text-xs transition-colors focus:outline-none focus:border-[#FF8C38] resize-none ${
                  isDark ? "bg-black border-neutral-800 text-white placeholder:text-neutral-600" : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder:text-stone-400"
                }`}
              />
            </div>
          </div>
        )}

        {/* Wizard Control Buttons */}
        <div className={`flex items-center justify-between pt-4 border-t ${
          isDark ? "border-neutral-900" : "border-stone-200"
        }`}>
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className={`px-4 py-2 border rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
              isDark ? "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white" : "bg-stone-100 border-stone-300 text-stone-700 hover:text-stone-900"
            }`}
          >
            ← Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:bg-stone-300"
            >
              {isSubmitting ? "Sending Request..." : "Send Brief Request ➔"}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}

export default function PublicRequestFormWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[40vh] w-full flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RequestFormWizardContent />
    </Suspense>
  );
}