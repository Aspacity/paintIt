"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { PainterVideoWalkthroughPlayer } from "@/components/dashboard/PainterVideoWalkthroughPlayer";
import { paintitApi } from "@/lib/apiClient";
import FeatureVotingPollCard, { FeaturePollData } from "@/components/ui/FeatureVotingPollCard";

interface SessionLog {
  id: string;
  visitor_token: string;
  email: string | null;
  duration_seconds: number;
  most_visited_section: string;
  device_type: string;
  created_at: string;
}

interface InteractionLog {
  id: number;
  interaction_type: string;
  visitor_token: string;
  painter_name: string | null;
  created_at: string;
}

interface RoleCount {
  role: string;
  count: string;
}

interface UserFeedbackEntry {
  id: number;
  user_id: number | null;
  user_role: string;
  user_name: string;
  user_email: string | null;
  category: string;
  rating: number;
  message: string;
  page_url: string;
  status: string;
  created_at: string;
}

interface InstalledUserRecord {
  userId: string | number;
  userName: string;
  userEmail: string;
  userRole: string;
  platform: string;
  installedAt: string;
  lastActive: string;
}

interface AnalyticsData {
  summary: {
    totalVisits: number;
    avgDurationSeconds: number;
    identifiedVisitors: number;
    waitlistCount: number;
  };
  rolesBreakdown: RoleCount[];
  sessions: SessionLog[];
  interactions: InteractionLog[];
}

export default function AdminAnalyticsDashboard() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [feedbacks, setFeedbacks] = useState<UserFeedbackEntry[]>([]);
  const [installedUsers, setInstalledUsers] = useState<InstalledUserRecord[]>([]);
  const [polls, setPolls] = useState<FeaturePollData[]>([]);
  const [pwaSummary, setPwaSummary] = useState({ totalPrompts: 0, totalAccepted: 0, conversionRate: "0%" });
  const [loading, setLoading] = useState<boolean>(true);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Broadcast Notification Form State
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifCategory, setNotifCategory] = useState<"ANNOUNCEMENT" | "NEW_FEATURE" | "FIXED_ISSUE" | "NEW_DEVELOPMENT">("ANNOUNCEMENT");
  const [notifTargetRole, setNotifTargetRole] = useState<"ALL" | "PAINTER" | "CLIENT">("ALL");
  const [notifActionUrl, setNotifActionUrl] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Poll Creation Form State
  const [pollTitle, setPollTitle] = useState("");
  const [pollDesc, setPollDesc] = useState("");
  const [pollTargetRole, setPollTargetRole] = useState<"ALL" | "PAINTER" | "CLIENT">("ALL");
  const [pollDurationDays, setPollDurationDays] = useState(7);
  const [pollOption1, setPollOption1] = useState("");
  const [pollOption2, setPollOption2] = useState("");
  const [pollOption3, setPollOption3] = useState("");
  const [pollOption4, setPollOption4] = useState("");
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const json = await paintitApi.get<AnalyticsData>("/api/admin/analytics").catch(() => null);
      if (json) setData(json);

      const fbJson = await paintitApi.get<{ feedbacks: UserFeedbackEntry[] }>("/api/feedback/admin/all").catch(() => ({ feedbacks: [] }));
      setFeedbacks(fbJson.feedbacks || []);

      // Fetch PWA installed users directory
      const pwaRes = await fetch("/api/analytics/pwa-install").then((r) => r.json()).catch(() => null);
      if (pwaRes) {
        setInstalledUsers(pwaRes.installedUsers || []);
        setPwaSummary({
          totalPrompts: pwaRes.totalPrompts || 0,
          totalAccepted: pwaRes.totalAccepted || 0,
          conversionRate: pwaRes.conversionRate || "0%",
        });
      }

      // Fetch polls
      const pollsRes = await fetch("/api/polls?role=ALL").then((r) => r.json()).catch(() => null);
      if (pollsRes) {
        setPolls(pollsRes.polls || []);
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "⚠️ Could not sync admin metrics directory.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchAdminData();
    });
  }, [accessToken, fetchAdminData]);

  const handleMarkResolved = async (id: number) => {
    try {
      await paintitApi.put(`/api/feedback/admin/${id}/status`, { status: "RESOLVED" });
      showToast({ message: "Feedback marked as RESOLVED!", severity: "success" });
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "RESOLVED" } : f))
      );
    } catch (err) {
      showToast({ message: "Feedback marked as RESOLVED locally.", severity: "success" });
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "RESOLVED" } : f))
      );
    }
  };

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) {
      showToast({ message: "Please provide a title and message body for broadcast.", severity: "info" });
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notifTitle,
          body: notifBody,
          category: notifCategory,
          targetRole: notifTargetRole,
          actionUrl: notifActionUrl,
          priority: "high",
        }),
      });

      if (res.ok) {
        showToast({ message: "Notification broadcast sent successfully to target users!", severity: "success" });
        setNotifTitle("");
        setNotifBody("");
        setNotifActionUrl("");
      } else {
        showToast({ message: "Could not send notification broadcast.", severity: "error" });
      }
    } catch (err) {
      showToast({ message: "Error sending notification broadcast.", severity: "error" });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = [pollOption1, pollOption2, pollOption3, pollOption4].filter((o) => o.trim().length > 0);

    if (!pollTitle.trim() || options.length < 2) {
      showToast({ message: "Please enter a poll title and at least 2 feature options.", severity: "info" });
      return;
    }

    setIsCreatingPoll(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_POLL",
          title: pollTitle,
          description: pollDesc,
          targetRole: pollTargetRole,
          durationDays: pollDurationDays,
          options,
        }),
      });

      if (res.ok) {
        showToast({ message: "Feature Roadmap Poll created successfully!", severity: "success" });
        setPollTitle("");
        setPollDesc("");
        setPollOption1("");
        setPollOption2("");
        setPollOption3("");
        setPollOption4("");
        fetchAdminData();
      } else {
        showToast({ message: "Failed to create feature poll.", severity: "error" });
      }
    } catch (err) {
      showToast({ message: "Network error creating poll.", severity: "error" });
    } finally {
      setIsCreatingPoll(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs font-mono uppercase tracking-[0.2em] text-neutral-450">
        ⚡ Initializing Master Admin Dashboard...
      </div>
    );
  }

  const summary = data?.summary || { totalVisits: 0, avgDurationSeconds: 0, identifiedVisitors: 0, waitlistCount: 0 };
  const roles = data?.rolesBreakdown || [];
  const sessions = data?.sessions || [];
  const interactions = data?.interactions || [];

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesRole = roleFilter === "ALL" || fb.user_role.toUpperCase() === roleFilter.toUpperCase();
    const matchesStatus = statusFilter === "ALL" || fb.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesRole && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-neutral-950 min-h-screen font-sans text-white">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-100 flex items-center gap-2">
            <span>👑 Master Admin Control Center</span>
          </h1>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Monitor site analytics, PWA installs, send broadcast notifications, and configure feature roadmap polls.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-[#FF8C38] font-bold rounded-xl transition-all"
        >
          🔄 Refresh Directory
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Site Visits</span>
          <span className="text-3xl font-black text-neutral-100 mt-2">{summary.totalVisits}</span>
          <span className="text-[9px] text-[#FF8C38] mt-1 font-mono">⚡ Running sessions</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Installed PWA Users</span>
          <span className="text-3xl font-black text-emerald-400 mt-2">{installedUsers.length}</span>
          <span className="text-[9px] text-emerald-300 mt-1 font-mono">📲 Standalone app users ({pwaSummary.conversionRate} conv)</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">User Feedbacks</span>
          <span className="text-3xl font-black text-[#FF8C38] mt-2">{feedbacks.length}</span>
          <span className="text-[9px] text-cyan-400 mt-1 font-mono">💬 Submitted across roles</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Identified Contacts</span>
          <span className="text-3xl font-black text-neutral-100 mt-2">{summary.identifiedVisitors}</span>
          <span className="text-[9px] text-cyan-400 mt-1 font-mono">👥 Accounts linked</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Feature Polls</span>
          <span className="text-3xl font-black text-amber-400 mt-2">{polls.length}</span>
          <span className="text-[9px] text-amber-300 mt-1 font-mono">🗳️ Active roadmap polls</span>
        </div>
      </div>

      {/* 🎬 PAINTER PRO VIDEO WALKTHROUGH MODULE */}
      <PainterVideoWalkthroughPlayer />

      {/* ========================================================== */}
      {/* 📱 INSTALLED PWA USERS TELEMETRY DIRECTORY                 */}
      {/* ========================================================== */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <span>📱 Installed PaintIT App Users Directory ({installedUsers.length})</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Identified painters & clients who have installed PaintIT on their mobile or desktop devices.
            </p>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            {pwaSummary.totalAccepted} Total Prompts Accepted
          </span>
        </div>

        {installedUsers.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-xs font-mono">
            No logged-in users registered as installed yet. Users who trigger & accept PWA prompts will appear here automatically!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                  <th className="pb-2">User / Contact</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Platform / Device</th>
                  <th className="pb-2">Installed Date</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-xs font-mono">
                {installedUsers.map((u, idx) => (
                  <tr key={idx} className="hover:bg-neutral-950/60">
                    <td className="py-3 font-bold text-neutral-100">
                      <div>{u.userName}</div>
                      <span className="text-[10px] text-neutral-500 font-normal">{u.userEmail}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        u.userRole === "PAINTER" ? "bg-[#FF8C38]/20 text-[#FF8C38]" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {u.userRole}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-300 uppercase font-bold">{u.platform}</td>
                    <td className="py-3 text-neutral-400">{new Date(u.installedAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right text-emerald-400 font-bold">✓ Installed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* 📢 ADMIN BROADCAST & POLL CONFIGURATION GRID                */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Notification Form */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
          <div className="border-b border-neutral-850 pb-3">
            <h3 className="text-sm font-black uppercase text-[#FF8C38] tracking-wider flex items-center gap-2">
              <span>📢 Broadcast Notification to Users</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Send site-wide notifications about new features, fixed issues, or announcements to painters or clients.
            </p>
          </div>

          <form onSubmit={handleBroadcastNotification} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Notification Category
              </label>
              <select
                value={notifCategory}
                onChange={(e) => setNotifCategory(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-[#FF8C38] focus:outline-none"
              >
                <option value="ANNOUNCEMENT">📢 Announcement</option>
                <option value="NEW_FEATURE">✨ New Feature Release</option>
                <option value="FIXED_ISSUE">🛠️ Fixed Issue / Bug Fix</option>
                <option value="NEW_DEVELOPMENT">🚀 Platform Development</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Target Audience
                </label>
                <select
                  value={notifTargetRole}
                  onChange={(e) => setNotifTargetRole(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-neutral-200 focus:outline-none"
                >
                  <option value="ALL">🌐 All Users (Painters & Clients)</option>
                  <option value="PAINTER">🎨 Painters Only</option>
                  <option value="CLIENT">🏡 Clients / Homeowners Only</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  CTA Action URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="/search/designs"
                  value={notifActionUrl}
                  onChange={(e) => setNotifActionUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Notification Title
              </label>
              <input
                type="text"
                placeholder="e.g. 🎨 Wall Splitter Feature is Now Live!"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Message Body
              </label>
              <textarea
                rows={3}
                placeholder="Explain the update, fixed bug, or announcement..."
                value={notifBody}
                onChange={(e) => setNotifBody(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isBroadcasting}
              className="w-full py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isBroadcasting ? "Sending Broadcast..." : "🚀 Broadcast Notification Now"}
            </button>
          </form>
        </div>

        {/* Feature Poll Configurator Form */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
          <div className="border-b border-neutral-850 pb-3">
            <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
              <span>🗳️ Configure Feature Roadmap Poll</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              List upcoming feature options, set expiration countdown timers, and collect votes from users.
            </p>
          </div>

          <form onSubmit={handleCreatePoll} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Poll Title
              </label>
              <input
                type="text"
                placeholder="e.g. Which feature should we build next month?"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Target Audience
                </label>
                <select
                  value={pollTargetRole}
                  onChange={(e) => setPollTargetRole(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs font-bold text-neutral-200 focus:outline-none"
                >
                  <option value="ALL">🌐 All Users</option>
                  <option value="PAINTER">🎨 Painters Only</option>
                  <option value="CLIENT">🏡 Clients Only</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Expiration Timer Duration
                </label>
                <select
                  value={pollDurationDays}
                  onChange={(e) => setPollDurationDays(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs font-bold text-amber-300 focus:outline-none"
                >
                  <option value={3}>⏳ Expires in 3 Days</option>
                  <option value={7}>⏳ Expires in 7 Days (1 Week)</option>
                  <option value={14}>⏳ Expires in 14 Days (2 Weeks)</option>
                  <option value={30}>⏳ Expires in 30 Days (1 Month)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Feature Candidates (Minimum 2)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option 1 (e.g. AR Live Camera Paint)"
                  value={pollOption1}
                  onChange={(e) => setPollOption1(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Option 2 (e.g. AI Color Recommender)"
                  value={pollOption2}
                  onChange={(e) => setPollOption2(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Option 3 (e.g. Instant Invoice Generator)"
                  value={pollOption3}
                  onChange={(e) => setPollOption3(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Option 4 (e.g. In-App Chat)"
                  value={pollOption4}
                  onChange={(e) => setPollOption4(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingPoll}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isCreatingPoll ? "Publishing Poll..." : "🗳️ Publish Feature Poll"}
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 📊 ACTIVE FEATURE POLL VOTE RANKINGS                       */}
      {/* ========================================================== */}
      {polls.length > 0 && (
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-2xl">
          <div className="border-b border-neutral-850 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                <span>📊 Live Feature Roadmap Rankings ({polls.length} Polls)</span>
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Features sorted by total votes so you can decide what to build next based on highest community demand!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {polls.map((poll) => (
              <FeatureVotingPollCard key={poll.id} poll={poll} onVoteSuccess={fetchAdminData} />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 💬 MASTER ADMIN USER FEEDBACK MANAGEMENT HUB MODULE         */}
      {/* ========================================================== */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-4">
          <div>
            <h3 className="text-sm font-black uppercase text-[#FF8C38] tracking-wider flex items-center gap-2">
              <span>💬 Master Admin User Feedback Hub ({feedbacks.length})</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Review feedback and feature requests submitted by Painters, Homeowners, and Designers.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs font-bold text-[#FF8C38] rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All User Roles</option>
              <option value="PAINTER">Painters</option>
              <option value="HOMEOWNER">Homeowners</option>
              <option value="CLIENT">Clients</option>
              <option value="DESIGNER">Designers</option>
              <option value="ADMIN">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs font-bold text-amber-400 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New Submissions</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {filteredFeedbacks.length === 0 ? (
          <div className="py-12 text-center text-neutral-600 space-y-2">
            <span className="text-3xl block">💬</span>
            <p className="text-xs font-bold uppercase">No feedback matching filters</p>
            <p className="text-[10px] text-neutral-600">Submissions from floating feedback buttons will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeedbacks.map((fb) => {
              const roleColorClass =
                fb.user_role === "PAINTER"
                  ? "bg-[#FF8C38]/25 text-orange-300 border-[#FF8C38]/40"
                  : fb.user_role === "DESIGNER"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                  : fb.user_role === "ADMIN"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30";

              return (
                <div
                  key={fb.id}
                  className="p-4 bg-neutral-950 border border-neutral-850 rounded-2xl space-y-3 flex flex-col justify-between hover:border-neutral-800 transition-all shadow-md"
                >
                  <div className="space-y-2">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${roleColorClass}`}>
                        {fb.user_role}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">
                        {"★".repeat(fb.rating)}
                      </span>
                    </div>

                    {/* Topic Category */}
                    <h4 className="text-xs font-black text-white truncate">{fb.category}</h4>

                    {/* User Info */}
                    <div className="text-[10px] font-mono text-neutral-400 truncate">
                      <span>{fb.user_name}</span>
                      {fb.user_email && <span className="text-neutral-600 block">{fb.user_email}</span>}
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-900">
                      {fb.message}
                    </p>
                  </div>

                  {/* Footer Action & Page URL */}
                  <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-neutral-500 truncate max-w-[120px]" title={fb.page_url}>
                      {fb.page_url}
                    </span>

                    {fb.status === "RESOLVED" ? (
                      <span className="text-[#FF8C38] font-bold flex items-center gap-1">
                        ✓ Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkResolved(fb.id)}
                        className="px-2.5 py-1 bg-[#FF8C38]/25 hover:bg-[#FF8C38]/30 text-[#FF8C38] font-bold rounded-lg border border-[#FF8C38]/40 transition-all"
                      >
                        Mark Resolved ✓
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown by Roles */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
        <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4">👥 Registered Cohort Roles</h3>
        {roles.length === 0 ? (
          <p className="text-[11px] text-neutral-500 font-mono">No registered users in system database.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {roles.map((r) => (
              <div key={r.role} className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl text-center">
                <span className="text-[9px] font-mono text-neutral-500 uppercase block">{r.role}</span>
                <span className="text-xl font-black text-white mt-1 block">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visitor Sessions & Interaction Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visitor Sessions Log */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4">⏱️ Active Session Heartbeats</h3>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[9px] uppercase tracking-wider text-neutral-500">
                  <th className="pb-2">Token / Client</th>
                  <th className="pb-2">Device</th>
                  <th className="pb-2">Section</th>
                  <th className="pb-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {sessions.map((s) => (
                  <tr key={s.id} className="text-[10px] font-mono text-neutral-300">
                    <td className="py-2.5 max-w-[150px] truncate">
                      {s.email ? (
                        <span className="text-cyan-400 font-bold">{s.email}</span>
                      ) : (
                        <span className="text-neutral-500">{s.visitor_token.slice(0, 12)}...</span>
                      )}
                    </td>
                    <td className="py-2.5 uppercase">{s.device_type}</td>
                    <td className="py-2.5 text-neutral-400">{s.most_visited_section}</td>
                    <td className="py-2.5 text-right font-bold text-neutral-100">{s.duration_seconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Interactions Log */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4">⚡ Client Interaction Stream</h3>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[9px] uppercase tracking-wider text-neutral-500">
                  <th className="pb-2">Interaction Type</th>
                  <th className="pb-2">Target Painter</th>
                  <th className="pb-2">Client Device</th>
                  <th className="pb-2 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {interactions.map((i) => (
                  <tr key={i.id} className="text-[10px] font-mono text-neutral-300">
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-[9px] uppercase font-bold text-[#FF8C38]">
                        {i.interaction_type}
                      </span>
                    </td>
                    <td className="py-2.5 text-neutral-400">{i.painter_name || "Platform-wide"}</td>
                    <td className="py-2.5 text-neutral-500">{i.visitor_token?.slice(0, 10)}...</td>
                    <td className="py-2.5 text-right text-neutral-500">
                      {new Date(i.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
