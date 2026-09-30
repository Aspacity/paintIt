"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";

interface PastFeedback {
  id: number;
  category: string;
  subject?: string;
  rating: number;
  message: string;
  status: string;
  adminResponse?: string | null;
  admin_response?: string | null;
  respondedBy?: string | null;
  createdAt?: string;
  created_at?: string;
}

const CATEGORIES_BY_ROLE: Record<string, { id: string; label: string }[]> = {
  PAINTER: [
    { id: "GENERAL", label: "General Feedback" },
    { id: "BUG_REPORT", label: "Bug / Technical Issue" },
    { id: "FEATURE_REQUEST", label: "Feature Request" },
    { id: "VISUALIZER", label: "3D Visualizer & Wall Splitter" },
    { id: "LEADS_BOOKING", label: "Customer Leads & Booking Profile" },
    { id: "APP_EXPERIENCE", label: "Platform Navigation & PWA" },
  ],
  CLIENT: [
    { id: "GENERAL", label: "General Feedback" },
    { id: "BUG_REPORT", label: "Bug / Technical Issue" },
    { id: "FEATURE_REQUEST", label: "Feature Request" },
    { id: "VISUALIZER", label: "3D Playground & Wall Splitter" },
    { id: "PAINTER_SEARCH", label: "Finding & Hiring Local Painters" },
    { id: "APP_EXPERIENCE", label: "Platform Experience" },
  ],
  HOMEOWNER: [
    { id: "GENERAL", label: "General Feedback" },
    { id: "BUG_REPORT", label: "Bug / Technical Issue" },
    { id: "FEATURE_REQUEST", label: "Feature Request" },
    { id: "VISUALIZER", label: "3D Playground & Wall Splitter" },
    { id: "PAINTER_SEARCH", label: "Finding & Hiring Local Painters" },
    { id: "APP_EXPERIENCE", label: "Platform Experience" },
  ],
  GUEST: [
    { id: "GENERAL", label: "General Feedback" },
    { id: "BUG_REPORT", label: "Bug / Technical Issue" },
    { id: "FEATURE_REQUEST", label: "Feature Request" },
    { id: "APP_EXPERIENCE", label: "Platform Experience" },
  ],
};

export default function UserFeedbackView() {
  const { user } = useAuth();
  const { showToast } = useAlert();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const userRole = (user?.role || "GUEST").toUpperCase();
  const categories = CATEGORIES_BY_ROLE[userRole] || CATEGORIES_BY_ROLE.GUEST;

  // Form State
  const [category, setCategory] = useState<string>(categories[0].id);
  const [subject, setSubject] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // History State
  const [pastFeedbacks, setPastFeedbacks] = useState<PastFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPastFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const targetUrl = user?.id
        ? `/api/feedback?userId=${user.id}`
        : `/api/feedback`;

      const res = await fetch(targetUrl);
      if (res.ok) {
        const data = await res.json();
        setPastFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error("Error fetching feedback history:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPastFeedbacks();
  }, [fetchPastFeedbacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast({ message: "Please provide both a subject title and detailed message.", severity: "info" });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCategoryObj = categories.find((c) => c.id === category);
      const categoryLabel = selectedCategoryObj ? selectedCategoryObj.label : category;

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ? String(user.id) : null,
          userRole,
          userName: user?.fullName || user?.full_name || "Anonymous User",
          userEmail: user?.email || null,
          category: categoryLabel,
          subject: subject.trim(),
          rating,
          message: message.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.pathname : "/feedback",
        }),
      });

      if (res.ok) {
        showToast({ message: "Thank you! Your feedback has been sent to the PaintIT Admin team.", severity: "success" });
        setSubject("");
        setMessage("");
        setRating(5);
        fetchPastFeedbacks();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast({ message: errData.error || "Could not submit feedback.", severity: "error" });
      }
    } catch (err) {
      showToast({ message: "Network error submitting feedback.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full text-[10px]">
            ✓ Resolved
          </span>
        );
      case "IN_PROGRESS":
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold px-2 py-0.5 rounded-full text-[10px]">
            ✨ Under Review
          </span>
        );
      case "DISMISSED":
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 bg-neutral-800 text-neutral-400 border border-neutral-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full text-[10px]">
            ⏳ Pending Review
          </span>
        );
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto py-4 space-y-6 animate-fade-in font-sans transition-colors ${
      isDark ? "text-white" : "text-stone-900"
    }`}>
      {/* Page Header */}
      <div className={`border-b pb-4 space-y-1.5 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#FF8C38]/20 text-[#FF8C38] border border-[#FF8C38]/40 text-[10px] font-mono font-bold uppercase tracking-wider">
            COMMUNITY FEEDBACK & SUPPORT
          </span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-neutral-100" : "text-stone-900"}`}>
          Feedback & Suggestions
        </h1>
        <p className={`text-xs max-w-2xl ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
          Have questions, ideas, or technical feedback? Drop your thoughts below. The PaintIT team reviews every submission to continuously improve the visualizer, painter search, and 3D playground!
        </p>
      </div>

      {/* 2-Column Grid Layout (Reference: time-trade feedback layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submit New Feedback Form */}
        <div className="lg:col-span-5">
          <div className={`border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl ${
            isDark ? "bg-neutral-950 border-neutral-850" : "bg-white border-stone-200"
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? "border-neutral-900" : "border-stone-200"
            }`}>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#FF8C38] flex items-center gap-2">
                <span>💬 Submit New Feedback</span>
              </h2>
              <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                isDark ? "bg-neutral-900 text-neutral-400 border-neutral-800" : "bg-stone-100 text-stone-600 border-stone-300"
              }`}>
                {userRole} User
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                  isDark ? "text-neutral-400" : "text-stone-700"
                }`}>
                  Topic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 text-xs font-bold text-[#FF8C38] focus:outline-none focus:border-[#FF8C38] ${
                    isDark ? "bg-neutral-900 border-neutral-800" : "bg-stone-100 border-stone-300"
                  }`}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                  isDark ? "text-neutral-400" : "text-stone-700"
                }`}>
                  Subject Title
                </label>
                <input
                  type="text"
                  placeholder="Brief title or summary of your feedback..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className={`w-full border rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-[#FF8C38] ${
                    isDark ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600" : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder-stone-400"
                  }`}
                />
              </div>

              {/* Satisfaction Rating */}
              <div>
                <label className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                  isDark ? "text-neutral-400" : "text-stone-700"
                }`}>
                  Satisfaction Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-125 ${
                        star <= rating ? "text-amber-400" : isDark ? "text-neutral-800" : "text-stone-300"
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

              {/* Detailed Message Textarea */}
              <div>
                <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                  isDark ? "text-neutral-400" : "text-stone-700"
                }`}>
                  Detailed Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Explain your feedback, issue, or request in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={`w-full border rounded-2xl p-3 text-xs font-medium focus:outline-none focus:border-[#FF8C38] resize-none ${
                    isDark ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600" : "bg-[#FAF8F5] border-stone-300 text-stone-900 placeholder-stone-400"
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                <span>{isSubmitting ? "Submitting Feedback..." : "Send Feedback to Admin"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: My Submitted Feedback & Admin Responses (time-trade layout) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-base font-black ${isDark ? "text-neutral-100" : "text-stone-900"}`}>
              My Submitted Feedback
            </h2>
            <span className="text-xs text-neutral-400 font-bold">{pastFeedbacks.length} submissions</span>
          </div>

          {loading ? (
            <div className={`border rounded-3xl p-8 text-center text-xs font-mono ${
              isDark ? "bg-neutral-950 border-neutral-850 text-neutral-500" : "bg-white border-stone-200 text-stone-500"
            }`}>
              ⚡ Loading your submitted feedback...
            </div>
          ) : pastFeedbacks.length === 0 ? (
            <div className={`border rounded-3xl p-8 text-center space-y-2 shadow-xl ${
              isDark ? "bg-neutral-950 border-neutral-850" : "bg-white border-stone-200"
            }`}>
              <span className="text-3xl block">💬</span>
              <h3 className={`text-sm font-bold ${isDark ? "text-neutral-300" : "text-stone-700"}`}>
                No Feedback Submitted Yet
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                When you submit feedback or bug reports, your submissions and official responses from the PaintIT team will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
              {pastFeedbacks.map((fb) => {
                const adminReplyText = fb.adminResponse || fb.admin_response;
                const dateStr = fb.createdAt || fb.created_at;

                return (
                  <div
                    key={fb.id}
                    className={`border rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl transition-all ${
                      isDark ? "bg-neutral-950 border-neutral-850 hover:border-neutral-800" : "bg-white border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {/* Item Header */}
                    <div className={`flex flex-wrap items-start justify-between gap-2 border-b pb-3 ${
                      isDark ? "border-neutral-900" : "border-stone-200"
                    }`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            isDark ? "bg-neutral-900 text-[#FF8C38] border border-neutral-800" : "bg-stone-100 text-[#FF8C38] border border-stone-300"
                          }`}>
                            {fb.category}
                          </span>
                          {getStatusBadge(fb.status)}
                        </div>
                        <h3 className={`text-sm font-black ${isDark ? "text-neutral-100" : "text-stone-900"}`}>
                          {fb.subject || "Feedback Submission"}
                        </h3>
                      </div>

                      <div className="text-right">
                        <div className="text-amber-400 text-xs font-bold">
                          {"★".repeat(fb.rating || 5)}
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                          {dateStr ? new Date(dateStr).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }) : "Recent"}
                        </span>
                      </div>
                    </div>

                    {/* Feedback Message Content */}
                    <p className={`text-xs font-medium leading-relaxed whitespace-pre-wrap ${
                      isDark ? "text-neutral-300" : "text-stone-700"
                    }`}>
                      {fb.message}
                    </p>

                    {/* Official Admin Response Box (Matching time-trade design) */}
                    {adminReplyText && (
                      <div className="bg-[#FF8C38]/10 border border-[#FF8C38]/30 rounded-2xl p-3.5 sm:p-4 space-y-1.5 mt-2">
                        <div className="flex items-center justify-between text-xs text-[#FF8C38] font-bold">
                          <span className="inline-flex items-center gap-1.5">
                            <span>💬</span>
                            <span>Response from {fb.respondedBy || "PaintIT Admin Team"}</span>
                          </span>
                          <span className="text-[9px] font-mono uppercase bg-[#FF8C38]/20 px-2 py-0.5 rounded text-[#FF8C38] font-bold">
                            Official Response
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed pl-5 whitespace-pre-wrap ${
                          isDark ? "text-neutral-200" : "text-stone-800"
                        }`}>
                          {adminReplyText}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
