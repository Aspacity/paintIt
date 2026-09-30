"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import FeatureVotingPollCard from "@/components/ui/FeatureVotingPollCard";

interface PollOption {
  id: string;
  label: string;
  votes: number;
  percentage?: number;
  voters: string[];
}

interface FeaturePollAdmin {
  id: string;
  title: string;
  description: string;
  targetRole: "ALL" | "PAINTER" | "CLIENT" | "CONSUMER";
  expiresAt: string;
  isLive: boolean;
  isExpired: boolean;
  totalVotes: number;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
}

export default function AdminPollsManagementPage() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const [polls, setPolls] = useState<FeaturePollAdmin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingPoll, setEditingPoll] = useState<FeaturePollAdmin | null>(null);

  // Selected Poll for Voter Details Modal
  const [selectedVoterPoll, setSelectedVoterPoll] = useState<FeaturePollAdmin | null>(null);

  // Form State
  const [pollTitle, setPollTitle] = useState("");
  const [pollDescription, setPollDescription] = useState("");
  const [pollTargetRole, setPollTargetRole] = useState<"ALL" | "PAINTER" | "CLIENT">("ALL");
  const [pollDurationDays, setPollDurationDays] = useState<number>(7);
  const [pollIsLive, setPollIsLive] = useState<boolean>(true);
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAdminPolls = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/polls?admin=true");
      if (res.ok) {
        const data = await res.json();
        setPolls(data.polls || []);
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "Could not fetch admin feature polls.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdminPolls();
  }, [accessToken, fetchAdminPolls]);

  const handleOpenCreateModal = () => {
    setEditingPoll(null);
    setPollTitle("");
    setPollDescription("");
    setPollTargetRole("ALL");
    setPollDurationDays(7);
    setPollIsLive(true);
    setOptions(["Option 1", "Option 2"]);
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (poll: FeaturePollAdmin) => {
    setEditingPoll(poll);
    setPollTitle(poll.title);
    setPollDescription(poll.description || "");
    setPollTargetRole((poll.targetRole === "CONSUMER" ? "CLIENT" : poll.targetRole) as any);
    setPollDurationDays(7);
    setPollIsLive(poll.isLive);
    setOptions(poll.options.map((o) => o.label));
    setShowCreateModal(true);
  };

  const handleAddOptionField = () => {
    setOptions((prev) => [...prev, `Option ${prev.length + 1}`]);
  };

  const handleRemoveOptionField = (idx: number) => {
    if (options.length <= 2) {
      showToast({ message: "A feature poll must have at least 2 options.", severity: "info" });
      return;
    }
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx: number, val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSavePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);

    if (!pollTitle.trim()) {
      showToast({ message: "Please enter a poll title.", severity: "info" });
      return;
    }

    if (cleanOptions.length < 2) {
      showToast({ message: "At least 2 feature options are required.", severity: "info" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPoll) {
        const res = await fetch("/api/polls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPDATE_POLL",
            pollId: editingPoll.id,
            title: pollTitle,
            description: pollDescription,
            targetRole: pollTargetRole,
            isLive: pollIsLive,
            options: cleanOptions,
          }),
        });

        if (res.ok) {
          showToast({ message: "Poll updated successfully!", severity: "success" });
          setShowCreateModal(false);
          fetchAdminPolls();
        } else {
          showToast({ message: "Failed to update poll.", severity: "error" });
        }
      } else {
        const res = await fetch("/api/polls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "CREATE_POLL",
            title: pollTitle,
            description: pollDescription,
            targetRole: pollTargetRole,
            durationDays: pollDurationDays,
            isLive: pollIsLive,
            options: cleanOptions,
          }),
        });

        if (res.ok) {
          showToast({ message: "Feature poll created and published successfully!", severity: "success" });
          setShowCreateModal(false);
          fetchAdminPolls();
        } else {
          showToast({ message: "Failed to create poll.", severity: "error" });
        }
      }
    } catch (err) {
      showToast({ message: "Network error saving poll.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLive = async (pollId: string, currentLiveState: boolean) => {
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_LIVE",
          pollId,
          isLive: !currentLiveState,
        }),
      });

      if (res.ok) {
        showToast({ message: `Poll ${!currentLiveState ? "set to LIVE" : "PAUSED"}`, severity: "success" });
        setPolls((prev) =>
          prev.map((p) => (p.id === pollId ? { ...p, isLive: !currentLiveState } : p))
        );
      }
    } catch (err) {
      showToast({ message: "Failed to toggle live state.", severity: "error" });
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm("Are you sure you want to delete this feature poll?")) return;

    try {
      const res = await fetch(`/api/polls?pollId=${pollId}`, { method: "DELETE" });
      if (res.ok) {
        showToast({ message: "Poll deleted successfully.", severity: "success" });
        setPolls((prev) => prev.filter((p) => p.id !== pollId));
      }
    } catch (err) {
      showToast({ message: "Failed to delete poll.", severity: "error" });
    }
  };

  const livePollsCount = polls.filter((p) => p.isLive).length;
  const totalVotesAcrossPolls = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs font-mono uppercase tracking-[0.2em] text-neutral-450">
        ⚡ Loading Admin Feature Polls Hub...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-neutral-950 min-h-screen font-sans text-white">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="text-xs font-bold text-[#FF8C38] hover:underline flex items-center gap-1"
            >
              <span>← Back to Control Center</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-100 mt-1 flex items-center gap-2">
            <span>🗳️ Dedicated Admin Feature Polls Control Center</span>
          </h1>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Configure community roadmap polls, control live vs paused status, set expiration timers, and view real-time voter metrics.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 shrink-0"
        >
          ➕ Create New Feature Poll
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Total Polls</span>
          <span className="text-3xl font-black text-white mt-1 block">{polls.length}</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Live Active Polls</span>
          <span className="text-3xl font-black text-emerald-400 mt-1 block">{livePollsCount}</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Total Votes Cast</span>
          <span className="text-3xl font-black text-amber-400 mt-1 block">{totalVotesAcrossPolls}</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Paused / Inactive</span>
          <span className="text-3xl font-black text-neutral-400 mt-1 block">{polls.length - livePollsCount}</span>
        </div>
      </div>

      {/* Main Polls Directory Table & Live Toggle Manager */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase text-[#FF8C38] tracking-wider flex items-center gap-2">
              <span>📋 All Configured Feature Polls ({polls.length})</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Decide which polls are LIVE for painters/clients, toggle active status, or edit options.
            </p>
          </div>
        </div>

        {polls.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 text-xs font-mono space-y-2">
            <span className="text-4xl block">🗳️</span>
            <p className="font-bold text-neutral-300">No Feature Polls Configured Yet</p>
            <p className="text-[10px]">Click "Create New Feature Poll" above to publish your first poll!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="p-5 bg-neutral-950 border border-neutral-850 rounded-2xl space-y-4 shadow-md hover:border-neutral-800 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        poll.isLive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}>
                        {poll.isLive ? "🟢 LIVE" : "🔴 PAUSED"}
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded border border-neutral-800">
                        Target: {poll.targetRole}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white mt-1.5">{poll.title}</h3>
                    {poll.description && (
                      <p className="text-xs text-neutral-400 mt-0.5">{poll.description}</p>
                    )}
                  </div>

                  {/* Actions & Live Toggle Switch */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleLive(poll.id, poll.isLive)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all shadow-sm ${
                        poll.isLive
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                      }`}
                    >
                      {poll.isLive ? "Pause Poll ⏸️" : "Set Live 🟢"}
                    </button>

                    <button
                      onClick={() => setSelectedVoterPoll(poll)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-bold rounded-xl transition-all"
                    >
                      👥 Voters ({poll.totalVotes})
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(poll)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-cyan-400 border border-neutral-800 text-xs font-bold rounded-xl transition-all"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => handleDeletePoll(poll.id)}
                      className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Candidate Feature Options Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {poll.options.map((opt) => (
                    <div key={opt.id} className="p-3 bg-neutral-900 border border-neutral-850 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
                        <span>{opt.label}</span>
                        <span className="text-amber-400 font-mono">{opt.percentage || 0}% ({opt.votes} votes)</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#FF8C38] h-full" style={{ width: `${opt.percentage || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT POLL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white relative">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h3 className="text-sm font-black uppercase text-[#FF8C38] tracking-wider">
                {editingPoll ? "✏️ Edit Feature Roadmap Poll" : "🗳️ Create New Feature Roadmap Poll"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePoll} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Poll Question / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Which feature should we build next month?"
                  value={pollTitle}
                  onChange={(e) => setPollTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-[#FF8C38]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Description / Context (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide context on what these candidate features do..."
                  value={pollDescription}
                  onChange={(e) => setPollDescription(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 focus:outline-none resize-none"
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
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-neutral-200 focus:outline-none"
                  >
                    <option value="ALL">🌐 All Users</option>
                    <option value="PAINTER">🎨 Painters Only</option>
                    <option value="CLIENT">🏡 Clients Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Live Status
                  </label>
                  <select
                    value={pollIsLive ? "LIVE" : "PAUSED"}
                    onChange={(e) => setPollIsLive(e.target.value === "LIVE")}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold focus:outline-none ${
                      pollIsLive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-neutral-900 text-neutral-400 border-neutral-800"
                    }`}
                  >
                    <option value="LIVE">🟢 Set LIVE Immediately</option>
                    <option value="PAUSED">🔴 Save as PAUSED (Draft)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Candidate Options (Minimum 2)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOptionField}
                    className="text-[10px] font-bold text-[#FF8C38] hover:underline"
                  >
                    + Add Option Field
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {options.map((optVal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={optVal}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOptionField(idx)}
                        className="w-8 h-8 rounded-xl bg-neutral-900 text-neutral-500 hover:text-red-400 flex items-center justify-center font-bold text-xs border border-neutral-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving Poll..." : editingPoll ? "Save Poll Changes ➔" : "Publish Feature Poll 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOTER DETAILS MODAL */}
      {selectedVoterPoll && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white relative">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h3 className="text-xs font-black uppercase text-[#FF8C38] tracking-wider">
                👥 Voter Breakdown: {selectedVoterPoll.title}
              </h3>
              <button
                onClick={() => setSelectedVoterPoll(null)}
                className="w-7 h-7 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedVoterPoll.options.map((opt) => (
                <div key={opt.id} className="p-3 bg-neutral-900 border border-neutral-850 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{opt.label}</span>
                    <span className="text-[#FF8C38] font-mono">{opt.votes} Votes</span>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 bg-neutral-950 p-2 rounded-xl border border-neutral-850">
                    {opt.voters.length === 0 ? (
                      <span className="italic text-neutral-600">No votes recorded yet for this option</span>
                    ) : (
                      <span>Voter IDs: {opt.voters.join(", ")}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
