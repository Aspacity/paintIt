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

// In-memory store for broadcast notifications (starts empty per user request - no dummy notifications)
const notificationsStore: NotificationRecord[] = [];

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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("notificationId");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      notificationsStore.length = 0;
      return NextResponse.json({ success: true, message: "All notifications cleared" });
    }

    if (notificationId) {
      const idx = notificationsStore.findIndex((n) => n.id === notificationId);
      if (idx !== -1) {
        notificationsStore.splice(idx, 1);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "notificationId or clearAll required" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
