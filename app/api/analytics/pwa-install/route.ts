import { NextResponse } from "next/server";

export interface InstallEventRecord {
  id: string;
  action: string;
  timestamp: string;
  platform: string;
  userAgent?: string;
  userId?: string | number;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export interface InstalledUserRecord {
  userId: string | number;
  userName: string;
  userEmail: string;
  userRole: string;
  platform: string;
  installedAt: string;
  lastActive: string;
}

const installLogs: InstallEventRecord[] = [];
const installedUsersMap = new Map<string, InstalledUserRecord>();

let totalPrompts = 0;
let totalAccepted = 0;
let totalDismissed = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, timestamp, platform, userAgent, userId, userName, userEmail, userRole } = body;

    const record: InstallEventRecord = {
      id: `pwa_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action: action || "UNKNOWN",
      timestamp: timestamp || new Date().toISOString(),
      platform: platform || "unknown",
      userAgent,
      userId,
      userName,
      userEmail,
      userRole,
    };

    installLogs.push(record);
    if (installLogs.length > 500) {
      installLogs.shift();
    }

    if (action === "PROMPT_SHOWN" || action === "USER_CLICKED_INSTALL_BUTTON") {
      totalPrompts += 1;
    } else if (action === "PROMPT_ACCEPTED" || action === "INSTALLED_SUCCESS") {
      totalAccepted += 1;

      // Log user as installed if user metadata is present
      const uid = userId ? String(userId) : userEmail || `anon_${Date.now()}`;
      installedUsersMap.set(uid, {
        userId: userId || uid,
        userName: userName || "PaintIT User",
        userEmail: userEmail || "Anonymous",
        userRole: (userRole || "CONSUMER").toUpperCase(),
        platform: platform || "Unknown",
        installedAt: timestamp || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
    } else if (action === "PROMPT_DISMISSED") {
      totalDismissed += 1;
    }

    // If active in standalone PWA, refresh lastActive for user
    if (userId || userEmail) {
      const uid = userId ? String(userId) : String(userEmail);
      if (installedUsersMap.has(uid)) {
        const existing = installedUsersMap.get(uid)!;
        existing.lastActive = new Date().toISOString();
        installedUsersMap.set(uid, existing);
      }
    }

    return NextResponse.json({
      success: true,
      tracked: record,
      summary: {
        totalPrompts,
        totalAccepted,
        totalDismissed,
        totalInstalledUsers: installedUsersMap.size,
        conversionRate: totalPrompts > 0 ? `${((totalAccepted / totalPrompts) * 100).toFixed(1)}%` : "0%",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to record PWA install event" }, { status: 400 });
  }
}

export async function GET() {
  const installedUsersList = Array.from(installedUsersMap.values());

  return NextResponse.json({
    success: true,
    totalPrompts,
    totalAccepted,
    totalDismissed,
    totalInstalledUsers: installedUsersList.length,
    conversionRate: totalPrompts > 0 ? `${((totalAccepted / totalPrompts) * 100).toFixed(1)}%` : "0%",
    installedUsers: installedUsersList,
    recentLogs: installLogs.slice(-20),
  });
}
