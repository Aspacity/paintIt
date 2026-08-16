"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

interface FeedbackModalContextType {
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  isOpen: boolean;
}

const FeedbackModalContext = createContext<FeedbackModalContextType>({
  openFeedbackModal: () => {},
  closeFeedbackModal: () => {},
  isOpen: false,
});

export const useFeedbackModal = () => useContext(FeedbackModalContext);

export function FeedbackModalPopup() {
  const { user } = useAuth();
  const { showToast } = useAlert();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Listen for custom window trigger event "open-paintit-feedback"
  useEffect(() => {
    const handleTrigger = () => setIsOpen(true);
    window.addEventListener("open-paintit-feedback", handleTrigger);
    return () => window.removeEventListener("open-paintit-feedback", handleTrigger);
  }, []);

  // Role Detection Engine for Role-Tailored Categories
  const userRole = (user?.role || "GUEST").toUpperCase();

  const roleCategoriesMap: Record<string, string[]> = {
    PAINTER: [
      "Customer Job Leads",
      "Color Visualizer Accuracy",
      "Uploading Work Photos",
      "Profile & Booking Page",
      "App Navigation & Ease of Use",
      "Bug Report / Feature Request",
    ],
    CLIENT: [
      "Color Visualizer Experience",
      "Finding Local Painters",
      "Quote / Pricing Clarity",
      "Mobile Navigation",
      "General Feedback",
      "Bug Report",
    ],
    HOMEOWNER: [
      "Color Visualizer Experience",
      "Finding Local Painters",
      "Quote / Pricing Clarity",
      "Mobile Navigation",
      "General Feedback",
      "Bug Report",
    ],
    DESIGNER: [
      "3D Room Assembling Studio",
      "Paint Brand & Deck Accuracy",
      "Exporting Client Visuals",
      "Portfolio Presentation",
      "Bug Report / Feature Request",
    ],
    ADMIN: [
      "Master Admin Metrics",
      "Platform Performance",
      "User Feedback Hub",
      "System Configuration",
    ],
    GUEST: [
      "Site First Impression",
      "Navigation & Usability",
      "Feature Suggestion",
      "Bug Report",
    ],
  };

  const categories = roleCategoriesMap[userRole] || roleCategoriesMap.GUEST;
  const activeCategory = category || categories[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast({ message: "Please enter your feedback message.", severity: "info" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ? String(user.id) : null,
          userRole,
          userName: user?.fullName || user?.full_name || "Anonymous User",
          userEmail: user?.email || null,
          category: activeCategory,
          rating,
          message,
          pageUrl: typeof window !== "undefined" ? window.location.pathname : "/",
        }),
      });

      if (res.ok) {
        showToast({ message: "Thank you! Your feedback has been saved to the database.", severity: "success" });
        setMessage("");
        setIsOpen(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast({ message: errData.error || "Could not save feedback to database.", severity: "error" });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      showToast({ message: "Error connecting to server: " + errorMsg, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FeedbackModalContext.Provider
      value={{
        openFeedbackModal: () => setIsOpen(true),
        closeFeedbackModal: () => setIsOpen(false),
        isOpen,
      }}
    >
      {/* Role-Tailored Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-850 rounded-3xl p-6 shadow-2xl space-y-4 text-white relative font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span>💬 Share Your Feedback</span>
                </h3>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  Logged in as <span className="text-white font-bold">{userRole}</span>
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Feedback Topic
                </label>
                <select
                  value={activeCategory}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Overall Experience Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-xl transition-all transform hover:scale-125 ${
                        star <= rating ? "text-amber-400" : "text-neutral-700"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-neutral-400 ml-2">
                    {rating} / 5
                  </span>
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Your Thoughts or Feature Requests
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={`Tell us how we can make PaintIt better for ${userRole.toLowerCase()}s...`}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded-2xl p-3.5 focus:border-emerald-500 focus:outline-none placeholder:text-neutral-600 leading-relaxed resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback ➔"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FeedbackModalContext.Provider>
  );
}

// Global Helper Function to open feedback modal from anywhere
export function triggerGlobalFeedbackModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("open-paintit-feedback"));
  }
}
