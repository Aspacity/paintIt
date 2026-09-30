"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

export interface PollOptionWithPct {
  id: string;
  label: string;
  votes: number;
  percentage: number;
  voters: string[];
}

export interface FeaturePollData {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  expiresAt: string;
  isExpired: boolean;
  totalVotes: number;
  userVotedOptionId: string | null;
  options: PollOptionWithPct[];
}

interface FeatureVotingPollCardProps {
  poll: FeaturePollData;
  onVoteSuccess?: () => void;
}

export default function FeatureVotingPollCard({ poll, onVoteSuccess }: FeatureVotingPollCardProps) {
  const { user } = useAuth();
  const { showToast } = useAlert();

  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localPoll, setLocalPoll] = useState<FeaturePollData>(poll);

  useEffect(() => {
    setLocalPoll(poll);
  }, [poll]);

  // Live countdown timer calculation effect (adapted from time-trade timer logic)
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const target = new Date(localPoll.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeftStr("Poll Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeftStr(`${days}d ${hours}h ${minutes}m left`);
      } else {
        setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s left`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [localPoll.expiresAt]);

  const handleVote = async (optionId: string) => {
    if (!user?.id) {
      showToast({ message: "Please log in to vote on feature polls.", severity: "info" });
      return;
    }

    if (localPoll.isExpired) {
      showToast({ message: "This poll has expired and is closed for voting.", severity: "info" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CAST_VOTE",
          pollId: localPoll.id,
          optionId,
          userId: user.id,
        }),
      });

      if (res.ok) {
        showToast({ message: "Vote submitted successfully!", severity: "success" });

        // Update local state immediately for instant feedback
        setLocalPoll((prev) => {
          const userIdStr = String(user.id);
          const newOptions = prev.options.map((opt) => {
            let votes = opt.votes;
            let voters = [...opt.voters];

            // If user previously voted for a different option, decrement it
            if (prev.userVotedOptionId === opt.id && opt.id !== optionId) {
              votes = Math.max(0, votes - 1);
              voters = voters.filter((v) => v !== userIdStr);
            }

            // Increment target option
            if (opt.id === optionId) {
              votes += 1;
              if (!voters.includes(userIdStr)) voters.push(userIdStr);
            }

            return { ...opt, votes, voters };
          });

          const totalVotes = newOptions.reduce((sum, o) => sum + o.votes, 0);
          const formattedOptions = newOptions.map((o) => ({
            ...o,
            percentage: totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0,
          }));

          return {
            ...prev,
            totalVotes,
            userVotedOptionId: optionId,
            options: formattedOptions,
          };
        });

        if (onVoteSuccess) onVoteSuccess();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast({ message: errData.error || "Could not cast vote.", severity: "error" });
      }
    } catch (err) {
      showToast({ message: "Network error casting vote.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpired = localPoll.isExpired || timeLeftStr === "Poll Expired";

  return (
    <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-5 space-y-4 shadow-xl text-white font-sans transition-all">
      {/* Poll Header & Expiration Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-900 pb-3">
        <div>
          <span className="text-[9px] font-mono uppercase bg-[#FF8C38]/15 text-[#FF8C38] px-2 py-0.5 rounded-full border border-[#FF8C38]/30 font-bold">
            🗳️ Roadmap Feature Poll
          </span>
          <h3 className="text-sm font-extrabold text-white mt-1.5 leading-tight">
            {localPoll.title}
          </h3>
        </div>

        {/* Live Expiration Timer Badge */}
        <div
          className={`shrink-0 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
            isExpired
              ? "bg-red-500/15 border-red-500/30 text-red-400"
              : "bg-amber-500/15 border-amber-500/30 text-amber-300 animate-pulse"
          }`}
        >
          <span>⏳</span>
          <span>{timeLeftStr}</span>
        </div>
      </div>

      {localPoll.description && (
        <p className="text-xs text-neutral-400 font-medium leading-relaxed">
          {localPoll.description}
        </p>
      )}

      {/* Feature Voting Options */}
      <div className="space-y-3">
        {localPoll.options.map((opt) => {
          const isVoted = localPoll.userVotedOptionId === opt.id;

          return (
            <div
              key={opt.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-2 relative overflow-hidden ${
                isVoted
                  ? "bg-[#FF8C38]/15 border-[#FF8C38]/50 shadow-md"
                  : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              {/* Option Details */}
              <div className="flex items-center justify-between gap-3 relative z-10">
                <span className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                  {isVoted && <span className="text-[#FF8C38] text-sm">✓</span>}
                  <span>{opt.label}</span>
                </span>

                {/* Vote Action Button / Stats */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-black text-amber-400">
                    {opt.percentage}% <span className="text-[10px] text-neutral-500 font-normal">({opt.votes} votes)</span>
                  </span>

                  <button
                    disabled={isExpired || isSubmitting}
                    onClick={() => handleVote(opt.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all shadow-sm ${
                      isVoted
                        ? "bg-[#FF8C38] text-black"
                        : "bg-neutral-800 hover:bg-[#FF8C38] hover:text-black text-neutral-300 border border-neutral-700"
                    } disabled:opacity-50`}
                  >
                    {isVoted ? "Voted ✓" : "Vote"}
                  </button>
                </div>
              </div>

              {/* Live Percentage Progress Bar */}
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800 relative z-10">
                <div
                  className={`h-full transition-all duration-500 ${
                    isVoted ? "bg-[#FF8C38]" : "bg-[#FF8C38]/80"
                  }`}
                  style={{ width: `${opt.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
        <span>Total votes: {localPoll.totalVotes}</span>
        <span>Target role: {localPoll.targetRole}</span>
      </div>
    </div>
  );
}
