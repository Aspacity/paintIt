"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface ConsentPreferences {
  analytics: boolean;
  aiTraining: boolean;
  timestamp: string;
}

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(true);
  const [aiConsent, setAiConsent] = useState<boolean>(true);

  useEffect(() => {
    const savedConsent = localStorage.getItem("paintit_consent_preferences");
    if (!savedConsent) {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (analytics: boolean, aiTraining: boolean) => {
    const preferences: ConsentPreferences = {
      analytics,
      aiTraining,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("paintit_consent_preferences", JSON.stringify(preferences));
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Bottom Cookie & AI Training Consent Bar */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-neutral-900/95 backdrop-blur-md border border-neutral-800 text-white p-4 rounded-2xl shadow-2xl z-50 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF8C38]/20 border border-[#FF8C38]/40 flex items-center justify-center shrink-0 text-[#FF8C38]">
            🧠
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-white text-sm">Privacy & AI Model Improvement Consent</h3>
            <p className="text-neutral-300 leading-relaxed">
              We track anonymized usage metrics and 3D spatial color interactions to improve platform performance and train our spatial color intelligence AI models.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <Link href="/privacy" className="text-[#FF8C38] font-semibold underline hover:text-[#ff9e54]">
                Privacy Policy
              </Link>
              <span className="text-neutral-600">•</span>
              <button
                type="button"
                onClick={() => setShowPreferencesModal(true)}
                className="text-neutral-400 font-semibold underline hover:text-white"
              >
                Customize Preferences
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => saveConsent(false, false)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all"
          >
            Decline All
          </button>
          <button
            type="button"
            onClick={() => saveConsent(true, true)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#FF8C38] hover:bg-[#ff9e54] text-black shadow-sm transition-all"
          >
            Accept & Continue
          </button>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Customize Privacy & Data Preferences</h3>
            <p className="text-xs text-neutral-400">
              Control how your interaction metadata is processed across Aspacity and PAINTIT.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold text-white">Platform Usage Analytics</h4>
                  <p className="text-[11px] text-neutral-400">Helps us monitor visit frequencies, page speeds, and UI responsiveness.</p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="w-4 h-4 accent-[#FF8C38] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold text-white">Spatial Color AI Training Data</h4>
                  <p className="text-[11px] text-neutral-400">Allows anonymized 3D paint selections and surface finishes to inform our color harmony AI model.</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                  className="w-4 h-4 accent-[#FF8C38] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveConsent(analyticsConsent, aiConsent)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#FF8C38] hover:bg-[#ff9e54] text-black"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
