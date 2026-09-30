import { NextResponse } from "next/server";

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  category: "ANNOUNCEMENT" | "NEW_FEATURE" | "FIXED_ISSUE" | "NEW_DEVELOPMENT" | "SYSTEM_ALERT";
  targetRole: "ALL" | "PAINTER" | "CLIENT" | "CONSUMER";
  priority: "normal" | "high" | "urgent";
  actionUrl?: string;
  createdAt: string;
  readBy: string[]; // List of user IDs who marked read
}

// In-memory store for broadcast notifications with initial pre-seeded updates
const notificationsStore: NotificationRecord[] = [
  {
    id: "notif_1",
    title: "🎨 3D Wall Splitter Feature Live!",
    body: "You can now split walls horizontally, vertically, or diagonally inside the 3D Studio to paint multi-color designs.",
    category: "NEW_FEATURE",
    targetRole: "ALL",
    priority: "high",
    actionUrl: "/search/designs",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    readBy: [],
  },
  {
    id: "notif_2",
    title: "🛠️ Fixed Canvas Lighting Toggle Issue",
    body: "Resolved the issue where turning off ambient bulbs would auto-reset. Realistic lighting now persists accurately.",
    category: "FIXED_ISSUE",
    targetRole: "ALL",
    priority: "normal",
    actionUrl: "/search/designs",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    readBy: [],
  },
  {
    id: "notif_3",
    title: "🚀 Contractor Job Leads Dashboard Updated",
    body: "Painters can now view client project inquiries directly in the Leads & Inbox section with instant estimate calculator.",
    category: "NEW_DEVELOPMENT",
    targetRole: "PAINTER",
    priority: "high",
    actionUrl: "/gigs",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    readBy: [],
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userRole = (searchParams.get("role") || "ALL").toUpperCase();
  const userId = searchParams.get("userId");

  // Filter notifications relevant to user's role
  const relevant = notificationsStore.filter((n) => {
    if (n.targetRole === "ALL") return true;
    if (userRole === "PAINTER" && n.targetRole === "PAINTER") return true;
    if ((userRole === "CLIENT" || userRole === "CONSUMER" || userRole === "HOMEOWNER") && (n.targetRole === "CLIENT" || n.targetRole === "CONSUMER")) return true;
    return false;
  });

  // Calculate unread count for user
  const formatted = relevant.map((n) => ({
    ...n,
    isRead: userId ? n.readBy.includes(String(userId)) : false,
  }));

  const unreadCount = formatted.filter((f) => !f.isRead).length;

  return NextResponse.json({
    success: true,
    notifications: formatted,
    unreadCount,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: notifBody, category, targetRole, priority, actionUrl } = body;

    if (!title || !notifBody) {
      return NextResponse.json({ error: "Title and message body are required" }, { status: 400 });
    }

    const newNotif: NotificationRecord = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      body: notifBody,
      category: category || "ANNOUNCEMENT",
      targetRole: (targetRole || "ALL").toUpperCase(),
      priority: priority || "normal",
      actionUrl: actionUrl || "",
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    notificationsStore.unshift(newNotif);

    return NextResponse.json({
      success: true,
      notification: newNotif,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to broadcast notification" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { notificationId, userId } = body;

    if (!notificationId || !userId) {
      return NextResponse.json({ error: "notificationId and userId required" }, { status: 400 });
    }

    const target = notificationsStore.find((n) => n.id === notificationId);
    if (target) {
      if (!target.readBy.includes(String(userId))) {
        target.readBy.push(String(userId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
