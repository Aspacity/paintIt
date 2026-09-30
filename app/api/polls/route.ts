import { NextResponse } from "next/server";

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  voters: string[]; // List of user IDs who voted for this option
}

export interface FeaturePoll {
  id: string;
  title: string;
  description: string;
  targetRole: "ALL" | "PAINTER" | "CLIENT" | "CONSUMER";
  expiresAt: string; // ISO date timestamp
  isLive: boolean; // Admin live status toggle
  options: PollOption[];
  createdBy: string;
  createdAt: string;
}

// In-memory poll store (starts empty per user request - no dummy polls)
const pollsStore: FeaturePoll[] = [];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userRole = (searchParams.get("role") || "ALL").toUpperCase();
  const userId = searchParams.get("userId");
  const isAdmin = searchParams.get("admin") === "true";

  const now = new Date();

  // Filter polls by role & live state
  const relevant = pollsStore.filter((p) => {
    // If not admin, only show LIVE polls
    if (!isAdmin && !p.isLive) return false;

    if (p.targetRole === "ALL") return true;
    if (userRole === "PAINTER" && p.targetRole === "PAINTER") return true;
    if ((userRole === "CLIENT" || userRole === "CONSUMER" || userRole === "HOMEOWNER") && (p.targetRole === "CLIENT" || p.targetRole === "CONSUMER")) return true;
    return false;
  });

  const formatted = relevant.map((poll) => {
    const isExpired = new Date(poll.expiresAt) <= now;
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    // Find if user already voted in this poll
    let userVotedOptionId: string | null = null;
    if (userId) {
      for (const opt of poll.options) {
        if (opt.voters.includes(String(userId))) {
          userVotedOptionId = opt.id;
          break;
        }
      }
    }

    const optionsWithPct = poll.options.map((opt) => ({
      ...opt,
      percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
    }));

    return {
      ...poll,
      isExpired,
      totalVotes,
      userVotedOptionId,
      options: optionsWithPct,
    };
  });

  return NextResponse.json({
    success: true,
    polls: formatted,
    totalPolls: pollsStore.length,
    livePollsCount: pollsStore.filter((p) => p.isLive).length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Admin creates a new poll
    if (action === "CREATE_POLL") {
      const { title, description, targetRole, durationDays, isLive, options } = body;

      if (!title || !options || !Array.isArray(options) || options.length < 2) {
        return NextResponse.json({ error: "Title and at least 2 options are required" }, { status: 400 });
      }

      const days = parseInt(String(durationDays || 7), 10);
      const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

      const newPoll: FeaturePoll = {
        id: `poll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        description: description || "",
        targetRole: (targetRole || "ALL").toUpperCase(),
        expiresAt,
        isLive: isLive ?? true,
        options: options.map((optLabel: string, idx: number) => ({
          id: `opt_${Date.now()}_${idx}`,
          label: typeof optLabel === "string" ? optLabel : (optLabel as any).label || `Option ${idx + 1}`,
          votes: 0,
          voters: [],
        })),
        createdBy: "Master Admin",
        createdAt: new Date().toISOString(),
      };

      pollsStore.unshift(newPoll);

      return NextResponse.json({ success: true, poll: newPoll });
    }

    // 2. Admin toggles Poll Live Status
    if (action === "TOGGLE_LIVE") {
      const { pollId, isLive } = body;
      const targetPoll = pollsStore.find((p) => p.id === pollId);
      if (!targetPoll) {
        return NextResponse.json({ error: "Poll not found" }, { status: 404 });
      }

      targetPoll.isLive = typeof isLive === "boolean" ? isLive : !targetPoll.isLive;
      return NextResponse.json({ success: true, poll: targetPoll });
    }

    // 3. Admin updates an existing poll
    if (action === "UPDATE_POLL") {
      const { pollId, title, description, targetRole, isLive, options } = body;
      const targetPoll = pollsStore.find((p) => p.id === pollId);
      if (!targetPoll) {
        return NextResponse.json({ error: "Poll not found" }, { status: 404 });
      }

      if (title) targetPoll.title = title;
      if (description !== undefined) targetPoll.description = description;
      if (targetRole) targetPoll.targetRole = targetRole.toUpperCase();
      if (typeof isLive === "boolean") targetPoll.isLive = isLive;

      if (Array.isArray(options) && options.length >= 2) {
        targetPoll.options = options.map((opt: any, idx: number) => ({
          id: opt.id || `opt_${Date.now()}_${idx}`,
          label: typeof opt === "string" ? opt : opt.label || `Option ${idx + 1}`,
          votes: opt.votes || 0,
          voters: opt.voters || [],
        }));
      }

      return NextResponse.json({ success: true, poll: targetPoll });
    }

    // 4. User casts a vote
    if (action === "CAST_VOTE") {
      const { pollId, optionId, userId } = body;

      if (!pollId || !optionId || !userId) {
        return NextResponse.json({ error: "pollId, optionId, and userId required" }, { status: 400 });
      }

      const poll = pollsStore.find((p) => p.id === pollId);
      if (!poll) {
        return NextResponse.json({ error: "Poll not found" }, { status: 404 });
      }

      if (!poll.isLive) {
        return NextResponse.json({ error: "This poll is currently not live." }, { status: 400 });
      }

      if (new Date(poll.expiresAt) <= new Date()) {
        return NextResponse.json({ error: "This feature poll has expired and is closed for voting." }, { status: 400 });
      }

      // Check if user already voted in this poll
      const existingVoteOpt = poll.options.find((opt) => opt.voters.includes(String(userId)));
      if (existingVoteOpt) {
        if (existingVoteOpt.id === optionId) {
          return NextResponse.json({ message: "You already voted for this option!" }, { status: 200 });
        }
        existingVoteOpt.votes = Math.max(0, existingVoteOpt.votes - 1);
        existingVoteOpt.voters = existingVoteOpt.voters.filter((v) => v !== String(userId));
      }

      const targetOpt = poll.options.find((opt) => opt.id === optionId);
      if (targetOpt) {
        targetOpt.votes += 1;
        targetOpt.voters.push(String(userId));
      }

      return NextResponse.json({ success: true, pollId, optionId });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process poll operation" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pollId = searchParams.get("pollId");

    if (!pollId) {
      return NextResponse.json({ error: "pollId required" }, { status: 400 });
    }

    const idx = pollsStore.findIndex((p) => p.id === pollId);
    if (idx !== -1) {
      pollsStore.splice(idx, 1);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 });
  }
}
