// components/analytics/TrafficTracker.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { paintitApi } from "@/lib/apiClient";

export function TrafficTracker() {
  const pathname = usePathname();
  const currentSectionRef = useRef<string>("HERO");

  // 📡 1. Heartbeat Interval Loop (Kept Lightweight)
  useEffect(() => {
    let visitorToken = localStorage.getItem("paintit_visitor_session_token");
    if (!visitorToken) {
      visitorToken = "vt_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("paintit_visitor_session_token", visitorToken);
    }

    let runningDuration = 0;
    const heartbeatTimer = setInterval(() => {
      runningDuration += 10;
      paintitApi
        .post("/api/analytics/heartbeat", {
          visitorToken,
          duration: runningDuration,
          currentSection: currentSectionRef.current,
          deviceType: window.innerWidth < 768 ? "MOBILE" : "DESKTOP",
        })
        .catch(() => null);
    }, 10000);

    return () => clearInterval(heartbeatTimer);
  }, []);

  // 🗺️ 2. Route Path Tracker Engine
  useEffect(() => {
    if (!pathname) return;

    let visitorToken = localStorage.getItem("paintit_visitor_session_token");
    if (!visitorToken) {
      visitorToken = "vt_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("paintit_visitor_session_token", visitorToken);
    }

    let trackingType = "platform_landing";
    let painterId: string | null = null;

    const pathSegments = pathname.split("/").filter(Boolean);

    if (pathSegments[0] === "painter" && pathSegments[1]) {
      painterId = pathSegments[1];
      trackingType = "profile_view";

      if (pathSegments[2] === "designs") {
        trackingType = "design_view";
      }
    } else if (pathSegments[0] === "dashboard") {
      const cachedUserData = localStorage.getItem("paintit_user_data");
      if (cachedUserData) {
        try {
          const parsed = JSON.parse(cachedUserData);
          painterId = parsed.id || parsed._id;
          trackingType = "profile_view";
        } catch { /**/ }
      }
    }

    const sessionTrackingKey = `tracked_${trackingType}_${painterId || "platform"}`;
    const alreadyTrackedInThisSession = sessionStorage.getItem(sessionTrackingKey);

    const startTime = Date.now();

    if (!alreadyTrackedInThisSession && painterId) {
      paintitApi
        .post("/api/analytics/track", {
          pagePath: pathname,
          type: trackingType,
          painterId,
          visitorToken,
          isExitEvent: false,
        })
        .then(() => {
          sessionStorage.setItem(sessionTrackingKey, "true");
        })
        .catch(() => null);
    }

    return () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      const exitPayload = JSON.stringify({
        pagePath: pathname,
        type: trackingType,
        painterId,
        visitorToken,
        durationSeconds,
        isExitEvent: true,
      });

      const backendUrl = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${backendUrl}/api/analytics/track`, new Blob([exitPayload], { type: "application/json" }));
      } else {
        paintitApi
          .post("/api/analytics/track", {
            pagePath: pathname,
            type: trackingType,
            painterId,
            visitorToken,
            durationSeconds,
            isExitEvent: true,
          })
          .catch(() => null);
      }
    };
  }, [pathname]);

  return null;
}