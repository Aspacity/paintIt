import { NextResponse } from "next/server";

export interface FeedbackItem {
  id: number;
  userId: string | number | null;
  user_id?: number | null;
  userRole: string;
  user_role?: string;
  userName: string;
  user_name?: string;
  userEmail: string | null;
  user_email?: string | null;
  category: string;
  subject: string;
  rating: number;
  message: string;
  pageUrl: string;
  page_url?: string;
  status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  adminResponse?: string | null;
  admin_response?: string | null;
  respondedBy?: string | null;
  createdAt: string;
  created_at?: string;
}

// In-memory feedback store for PaintIT
const feedbackStore: FeedbackItem[] = [
  {
    id: 1,
    userId: "101",
    user_id: 101,
    userRole: "PAINTER",
    user_role: "PAINTER",
    userName: "Idowu Tijesunimi",
    userEmail: "idowu@paintit.app",
    category: "FEATURE_REQUEST",
    subject: "Wall Splitter dual-color customizer",
    rating: 5,
    message: "It would be amazing if we could split a single wall into 2 or 3 horizontal and vertical sections to preview accent wall combinations!",
    pageUrl: "/designs",
    status: "RESOLVED",
    adminResponse: "Hey Idowu! The Wall Splitter feature has been officially released on the Playground page with multi-section paint controls!",
    respondedBy: "Master Admin Team",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    userId: "102",
    user_id: 102,
    userRole: "CLIENT",
    user_role: "CLIENT",
    userName: "Sarah Jenkins",
    userEmail: "sarah.j@gmail.com",
    category: "BUG_REPORT",
    subject: "Bulb light toggle state persistence",
    rating: 4,
    message: "Noticed when turning off ambient bulbs in the 3D scene, switching camera views turned them back on.",
    pageUrl: "/playground",
    status: "RESOLVED",
    adminResponse: "Thank you Sarah! We fixed the bulb state listener so ambient lighting choices remain locked across view toggles.",
    respondedBy: "PaintIT Tech Lead",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const admin = searchParams.get("admin") === "true";

  let items = [...feedbackStore];

  if (!admin && userId) {
    items = items.filter((f) => String(f.userId) === String(userId) || String(f.user_id) === String(userId));
  }

  // Format response for both camelCase and snake_case consumers
  const formattedFeedbacks = items.map((fb) => ({
    ...fb,
    user_id: fb.user_id ?? (typeof fb.userId === "number" ? fb.userId : null),
    user_role: fb.user_role || fb.userRole,
    user_name: fb.user_name || fb.userName,
    user_email: fb.user_email || fb.userEmail,
    page_url: fb.page_url || fb.pageUrl,
    admin_response: fb.admin_response || fb.adminResponse || null,
    created_at: fb.created_at || fb.createdAt,
  }));

  return NextResponse.json({
    success: true,
    feedbacks: formattedFeedbacks,
    totalCount: feedbackStore.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Admin responds or updates status
    if (action === "ADMIN_REPLY") {
      const { id, status, adminResponse, respondedBy } = body;
      const target = feedbackStore.find((f) => f.id === Number(id));
      if (!target) {
        return NextResponse.json({ error: "Feedback entry not found" }, { status: 404 });
      }

      if (status) target.status = status;
      if (adminResponse !== undefined) {
        target.adminResponse = adminResponse;
        target.admin_response = adminResponse;
      }
      target.respondedBy = respondedBy || "Master Admin Team";

      return NextResponse.json({ success: true, feedback: target });
    }

    // 2. User submits new feedback
    const { userId, userRole, userName, userEmail, category, subject, rating, message, pageUrl } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const newEntry: FeedbackItem = {
      id: Date.now(),
      userId: userId || null,
      user_id: userId ? Number(userId) : null,
      userRole: (userRole || "CLIENT").toUpperCase(),
      user_role: (userRole || "CLIENT").toUpperCase(),
      userName: userName || "Anonymous User",
      user_name: userName || "Anonymous User",
      userEmail: userEmail || null,
      user_email: userEmail || null,
      category: category || "GENERAL",
      subject: subject || (message.length > 30 ? message.slice(0, 30) + "..." : message),
      rating: rating ? Number(rating) : 5,
      message: message.trim(),
      pageUrl: pageUrl || "/feedback",
      page_url: pageUrl || "/feedback",
      status: "PENDING",
      adminResponse: null,
      admin_response: null,
      respondedBy: null,
      createdAt: nowIso,
      created_at: nowIso,
    };

    feedbackStore.unshift(newEntry);

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully!",
      feedback: newEntry,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, adminResponse, respondedBy } = body;

    const target = feedbackStore.find((f) => f.id === Number(id));
    if (!target) {
      return NextResponse.json({ error: "Feedback entry not found" }, { status: 404 });
    }

    if (status) target.status = status;
    if (adminResponse !== undefined) {
      target.adminResponse = adminResponse;
      target.admin_response = adminResponse;
    }
    target.respondedBy = respondedBy || "Master Admin Team";

    return NextResponse.json({ success: true, feedback: target });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}
