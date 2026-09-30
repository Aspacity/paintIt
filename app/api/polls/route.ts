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
  options: PollOption[];
  createdBy: string;
  createdAt: string;
}

// In-memory poll store pre-populated with active community feature polls
const pollsStore: FeaturePoll[] = [
  {
    id: "poll_1",
    title: "🚀 Which next feature should we prioritize building?",
    description: "Vote on the official PaintIT roadmap! Features with the highest votes will be developed first by our team.",
    targetRole: "ALL",
    expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    options: [
      { id: "opt_1", label: "📱 AR Live Camera Room Paint Visualizer", votes: 18, voters: [] },
      { id: "opt_2", label: "🤖 AI Room Paint & Texture Color Recommender", votes: 24, voters: [] },
      { id: "opt_3", label: "📄 Instant Painter Invoice & PDF Quote Generator", votes: 15, voters: [] },
      { id: "opt_4", label: "💬 Real-time Painter & Client In-App Chat", votes: 9, voters: [] },
    ],
    createdBy: "Admin Team",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "poll_2",
    title: "🎨 Painter Workspace Experience Enhancement",
    description: "Help us improve Contractor OS for professional painters.",
    targetRole: "PAINTER",
    expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    options: [
      { id: "opt_p1", label: "📊 Detailed Lead Analytics & Conversion Metrics", votes: 12, voters: [] },
      { id: "opt_p2", label: "🏷️ Custom Paint Brand Swatch Importer", votes: 19, voters: [] },
      { id: "opt_p3", label: "📅 Automated Client Booking Calendar Sync", votes: 8, voters: [] },
    ],
    createdBy: "Admin Team",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userRole = (searchParams.get("role") || "ALL").toUpperCase();
  const userId = searchParams.get("userId");

  const now = new Date();

  // Filter polls by role
  const relevant = pollsStore.filter((p) => {
    if (p.targetRole === "ALL") return true;
    if (userRole === "PAINTER" && p.targetRole === "PAINTER") return true;
    if ((userRole === "CLIENT" || userRole === "CONSUMER" || userRole === "HOMEOWNER") && (userRole === "CLIENT" || userRole === "CONSUMER")) return true;
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
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Admin creates a new poll
    if (action === "CREATE_POLL") {
      const { title, description, targetRole, durationDays, options } = body;

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
        options: options.map((optLabel: string, idx: number) => ({
          id: `opt_${Date.now()}_${idx}`,
          label: optLabel,
          votes: 0,
          voters: [],
        })),
        createdBy: "Admin Team",
        createdAt: new Date().toISOString(),
      };

      pollsStore.unshift(newPoll);

      return NextResponse.json({ success: true, poll: newPoll });
    }

    // 2. User casts a vote
    if (action === "CAST_VOTE") {
      const { pollId, optionId, userId } = body;

      if (!pollId || !optionId || !userId) {
        return NextResponse.json({ error: "pollId, optionId, and userId required" }, { status: 400 });
      }

      const poll = pollsStore.find((p) => p.id === pollId);
      if (!poll) {
        return NextResponse.json({ error: "Poll not found" }, { status: 404 });
      }

      if (new Date(poll.expiresAt) <= new Date()) {
        return NextResponse.json({ error: "This feature poll has expired and is closed for voting." }, { status: 400 });
      }

      // Check if user already voted in this poll
      const existingVoteOpt = poll.options.find((opt) => opt.voters.includes(String(userId)));
      if (existingVoteOpt) {
        // Switch vote or reject duplicate
        if (existingVoteOpt.id === optionId) {
          return NextResponse.json({ message: "You already voted for this option!" }, { status: 200 });
        }
        // Remove vote from previous option
        existingVoteOpt.votes = Math.max(0, existingVoteOpt.votes - 1);
        existingVoteOpt.voters = existingVoteOpt.voters.filter((v) => v !== String(userId));
      }

      // Add vote to target option
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
