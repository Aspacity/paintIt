/**
 * PaintIT Device Fingerprinting & Security Engine
 * Identifies user devices, tracks session fingerprints, and detects suspicious device mismatches.
 */

export interface DeviceProfile {
  deviceId: string;
  platform: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  registeredAt: string;
  lastActive: string;
  isSuspicious: boolean;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let deviceId = localStorage.getItem("paintit_device_id");
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("paintit_device_id", deviceId);
  }
  return deviceId;
}

export function getDeviceProfile(): DeviceProfile {
  if (typeof window === "undefined") {
    return {
      deviceId: "server",
      platform: "server",
      userAgent: "",
      screenResolution: "0x0",
      timezone: "UTC",
      registeredAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isSuspicious: false,
    };
  }

  const deviceId = getOrCreateDeviceId();
  const ua = window.navigator.userAgent;
  const platform = /iphone|ipad|ipod/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
    ? "Android"
    : /macintosh|mac os x/i.test(ua)
    ? "Mac"
    : /windows/i.test(ua)
    ? "Windows"
    : "WebBrowser";

  const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return {
    deviceId,
    platform,
    userAgent: ua,
    screenResolution: screenRes,
    timezone,
    registeredAt: localStorage.getItem("paintit_device_reg_date") || new Date().toISOString(),
    lastActive: new Date().toISOString(),
    isSuspicious: false,
  };
}

export function registerCurrentDevice(userId?: string | number): DeviceProfile {
  if (typeof window === "undefined") return getDeviceProfile();

  const profile = getDeviceProfile();
  const signature = `${profile.deviceId}_${profile.platform}_${profile.screenResolution}_${profile.timezone}`;

  localStorage.setItem("paintit_device_signature", signature);
  if (!localStorage.getItem("paintit_device_reg_date")) {
    localStorage.setItem("paintit_device_reg_date", profile.registeredAt);
  }

  // Send device telemetry to backend
  fetch("/api/analytics/pwa-install", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "DEVICE_REGISTERED",
      timestamp: new Date().toISOString(),
      platform: profile.platform,
      userAgent: profile.userAgent,
      userId,
      deviceId: profile.deviceId,
      timezone: profile.timezone,
    }),
  }).catch(() => {});

  return profile;
}

export function verifyDeviceSecurity(): { valid: boolean; reason?: string } {
  if (typeof window === "undefined") return { valid: true };

  const currentProfile = getDeviceProfile();
  const storedSignature = localStorage.getItem("paintit_device_signature");

  if (!storedSignature) {
    // First time device setup
    registerCurrentDevice();
    return { valid: true };
  }

  const currentSig = `${currentProfile.deviceId}_${currentProfile.platform}_${currentProfile.screenResolution}_${currentProfile.timezone}`;

  // If device signature drastically changes under the same auth token (e.g. token hijacked across OS)
  if (storedSignature !== currentSig) {
    const storedDeviceId = storedSignature.split("_")[0];
    if (storedDeviceId !== currentProfile.deviceId) {
      console.warn("[Device Security Alert] Device ID mismatch detected!");
      return { valid: false, reason: "Suspicious device activity detected. Re-authentication required for your security." };
    }
  }

  return { valid: true };
}
