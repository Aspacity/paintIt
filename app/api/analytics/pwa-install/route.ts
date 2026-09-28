import { NextResponse } from "next/server";

// In-memory metrics cache & fallback logger
interface InstallEventRecord {
  id: string;
  action: string;
  timestamp: string;
  platform: string;
  userAgent?: string;
}

const installLogs: InstallEventRecord[] = [];
let totalPrompts = 0;
let totalAccepted = 0;
let totalDismissed = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, timestamp, platform, userAgent } = body;

    const record: InstallEventRecord = {
      id: `pwa_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action: action || "UNKNOWN",
      timestamp: timestamp || new Date().toISOString(),
      platform: platform || "unknown",
      userAgent,
    };

    installLogs.push(record);
    if (installLogs.length > 500) {
      installLogs.shift(); // Keep latest 500 records in memory
    }

    if (action === "PROMPT_SHOWN" || action === "USER_CLICKED_INSTALL_BUTTON") {
      totalPrompts += 1;
    } else if (action === "PROMPT_ACCEPTED" || action === "INSTALLED_SUCCESS") {
      totalAccepted += 1;
    } else if (action === "PROMPT_DISMISSED") {
      totalDismissed += 1;
    }

    console.log(`[PWA Analytics] Event: ${record.action} | Platform: ${record.platform}`);

    return NextResponse.json({
      success: true,
      tracked: record,
      summary: {
        totalPrompts,
        totalAccepted,
        totalDismissed,
        conversionRate: totalPrompts > 0 ? `${((totalAccepted / totalPrompts) * 100).toFixed(1)}%` : "0%",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to record PWA install event" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    totalPrompts,
    totalAccepted,
    totalDismissed,
    conversionRate: totalPrompts > 0 ? `${((totalAccepted / totalPrompts) * 100).toFixed(1)}%` : "0%",
    recentLogs: installLogs.slice(-20),
  });
}
