"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface PWAInstallMetrics {
  prompts: number;
  accepted: number;
  dismissed: number;
  lastOutcome: string | null;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "ios_guide" | "unavailable">;
  showIOSModal: boolean;
  setShowIOSModal: (val: boolean) => void;
  metrics: PWAInstallMetrics;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<PWAInstallMetrics>({
    prompts: 0,
    accepted: 0,
    dismissed: 0,
    lastOutcome: null,
  });

  useEffect(() => {
    // 1. Detect if running inside standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isStoredInstalled = localStorage.getItem("paintit_pwa_installed") === "true";

      if (isStandaloneMedia || isIOSStandalone || isStoredInstalled) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    // 2. Detect iOS Safari platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // 3. Listen for browser 'beforeinstallprompt' event (Chrome, Android, Edge, Opera)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      // Track prompt event
      trackInstallAnalytics("PROMPT_SHOWN", { platform: getPlatformName() });
    };

    // 4. Listen for browser 'appinstalled' event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.setItem("paintit_pwa_installed", "true");

      setMetrics((prev) => ({
        ...prev,
        accepted: prev.accepted + 1,
        lastOutcome: "installed_event",
      }));

      trackInstallAnalytics("INSTALLED_SUCCESS", { platform: getPlatformName() });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const getPlatformName = (): string => {
    if (typeof window === "undefined") return "unknown";
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    if (/macintosh|mac os x/.test(ua)) return "mac";
    if (/windows/.test(ua)) return "windows";
    return "other";
  };

  const trackInstallAnalytics = async (action: string, extraData: Record<string, any> = {}) => {
    try {
      await fetch("/api/analytics/pwa-install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          timestamp: new Date().toISOString(),
          platform: getPlatformName(),
          userAgent: window.navigator.userAgent,
          ...extraData,
        }),
      });
    } catch (err) {
      console.warn("PWA install tracking failed silently:", err);
    }
  };

  const promptInstall = async (): Promise<"accepted" | "dismissed" | "ios_guide" | "unavailable"> => {
    if (isIOS && !isInstalled) {
      setShowIOSModal(true);
      trackInstallAnalytics("IOS_GUIDE_TRIGGERED", { platform: "ios" });
      return "ios_guide";
    }

    if (!deferredPrompt) {
      console.log("No deferred PWA install prompt available.");
      return "unavailable";
    }

    setMetrics((prev) => ({ ...prev, prompts: prev.prompts + 1 }));
    trackInstallAnalytics("USER_CLICKED_INSTALL_BUTTON", { platform: getPlatformName() });

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      const outcome = choiceResult.outcome as "accepted" | "dismissed";

      setMetrics((prev) => ({
        ...prev,
        accepted: outcome === "accepted" ? prev.accepted + 1 : prev.accepted,
        dismissed: outcome === "dismissed" ? prev.dismissed + 1 : prev.dismissed,
        lastOutcome: outcome,
      }));

      trackInstallAnalytics(outcome === "accepted" ? "PROMPT_ACCEPTED" : "PROMPT_DISMISSED", {
        platform: getPlatformName(),
      });

      if (outcome === "accepted") {
        setIsInstalled(true);
        localStorage.setItem("paintit_pwa_installed", "true");
      }

      setDeferredPrompt(null);
      setIsInstallable(false);
      return outcome;
    } catch (err) {
      console.error("Error triggering PWA install prompt:", err);
      return "unavailable";
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        promptInstall,
        showIOSModal,
        setShowIOSModal,
        metrics,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWAInstall = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWAInstall must be used within a PWAProvider");
  }
  return context;
};
