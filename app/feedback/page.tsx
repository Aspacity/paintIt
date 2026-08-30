"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

interface PastFeedback {
  id: number;
  category: string;
  rating: number;
  message: string;
  status: string;
  created_at: string;
}

export default function UserFeedbackHubPage() {
  const { user } = useAuth();
  const { showToast } = useAlert();

  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [pastFeedbacks, setPastFeedbacks] = useState<PastFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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

  const fetchPastFeedbacks = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/feedback/my?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPastFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error("Error fetching past feedbacks:", err);
    } finally {
      setLoading(false);
    }
  }, [user, BACKEND_API_URL]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchPastFeedbacks();
    });
  }, [fetchPastFeedbacks]);

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
          pageUrl: typeof window !== "undefined" ? window.location.pathname : "/feedback",
        }),
      });

      if (res.ok) {
        showToast({ message: "Thank you! Your feedback has been saved to the database.", severity: "success" });
        setMessage("");
        fetchPastFeedbacks();
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 text-white animate-fade-in font-sans">
      {/* Header */}
      <div className="border-b border-neutral-900 pb-5">
        <h1 className="text-xl font-black uppercase tracking-wider text-neutral-100 flex items-center gap-2">
          <span>💬 User Feedback & Feature Requests</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Help us craft the ultimate architectural visualization & painter platform. Your feedback directly shapes our feature updates!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Role-Tailored Feedback Form */}
        <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#FF8C38]">
              Submit Feedback ({userRole})
            </h3>
            <span className="text-[9px] font-mono uppercase bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded border border-neutral-800">
              {userRole} User
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1">
                Satisfaction Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-transform hover:scale-125 ${
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

            {/* Category */}
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1">
                Feedback Topic
              </label>
              <select
                value={activeCategory}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-bold text-[#FF8C38] focus:outline-none focus:border-[#FF8C38]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Textarea */}
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-1">
                Your Feedback & Suggestions
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Share your experience or feature suggestions as a ${userRole.toLowerCase()}...`}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF8C38] font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#FF8C38] hover:bg-[#FF8C38] text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting Feedback..." : "Submit Feedback 🚀"}
            </button>
          </form>
        </div>

        {/* Right Column: User Past Submissions History */}
        <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-neutral-900 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">
              📋 My Feedback Submissions ({pastFeedbacks.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Loading your feedback history...
            </div>
          ) : pastFeedbacks.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <span className="text-3xl block">💬</span>
              <p className="text-xs text-neutral-400 font-bold uppercase">No Past Submissions</p>
              <p className="text-[10px] text-neutral-500">
                Your submitted feedback and feature suggestions will appear here with resolution updates!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 no-scrollbar">
              {pastFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FF8C38]">{fb.category}</span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        fb.status === "RESOLVED"
                          ? "bg-[#FF8C38]/25 text-orange-300 border border-[#FF8C38]/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {fb.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 font-medium leading-relaxed">{fb.message}</p>

                  <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 pt-1 border-t border-neutral-850">
                    <span className="text-amber-400 font-bold">{"★".repeat(fb.rating)}</span>
                    <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
