"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

export function FeedbackModalPopup() {
  const { user } = useAuth();
  const { showToast } = useAlert();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
      "Palette Tools",
      "Feature Request",
    ],
    ADMIN: [
      "Platform Speed & Load Time",
      "Lead Quality & Distribution",
      "System Performance",
      "General Admin Feedback",
    ],
    GUEST: [
      "Website Experience",
      "Color Visualizer",
      "Finding Painters",
      "General Feedback",
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
    } catch (err: any) {
      showToast({ message: "Error connecting to server: " + (err.message || "Unknown error"), severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Global Floating Feedback Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-emerald-400 font-black text-xs uppercase tracking-wider rounded-full shadow-2xl border border-emerald-500/30 hover:border-emerald-400 transition-all flex items-center gap-2 group backdrop-blur-xl animate-fade-in cursor-pointer active:scale-95 select-none"
      >
        <span className="text-sm group-hover:rotate-12 transition-transform">💬</span>
        <span>Feedback</span>
      </button>

      {/* Role-Tailored Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-850 rounded-3xl p-6 shadow-2xl space-y-4 text-white relative font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span>💬 Share Your Feedback</span>
                </h3>
                <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">
                  Tailored for <span className="text-white font-bold">{userRole}</span> Users
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Control */}
              <div>
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1.5">
                  How was your experience?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-xl transition-transform hover:scale-125 ${
                        star <= rating ? "text-amber-400" : "text-neutral-700"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Role-Tailored Category Selector */}
              <div>
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1.5">
                  Feedback Topic ({userRole})
                </label>
                <select
                  value={activeCategory}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Text Area */}
              <div>
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1.5">
                  Your Suggestions & Feedback
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Tell us how we can make PaintIt better for ${userRole.toLowerCase()}s...`}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href="/feedback"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 font-mono underline"
                >
                  View Past Submissions ➔
                </a>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Send Feedback 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
