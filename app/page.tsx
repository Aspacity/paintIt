"use client";

import React from "react";
import { StudioProvider } from "@/context/StudioContext";
import { AlertProvider } from "@/context/AlertContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import ProcessSection from "@/components/landing/ProcessSection";
import TwoSidesSection from "@/components/landing/TwoSidesSection";
import ConnectionStorySection from "@/components/landing/ConnectionStorySection";
import InteractiveDemoSection from "@/components/landing/InteractiveDemoSection";
import WhyVisualizationSection from "@/components/landing/WhyVisualizationSection";
import ForPaintersSection from "@/components/landing/ForPaintersSection";
import ForHomeownersSection from "@/components/landing/ForHomeownersSection";
import ShareCollaborateSection from "@/components/landing/ShareCollaborateSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import FooterSection from "@/components/landing/FooterSection";
import CookieConsentBanner from "@/components/landing/CookieConsentBanner";

function LandingPageContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 selection:bg-[#FF8C38]/30 selection:text-[#FF8C38] relative overflow-x-hidden ${
      isDark ? "bg-black text-white" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      {/* Sticky Navigation */}
      <LandingNavbar />

      {/* Main Landing Sections */}
      <main className="relative z-10">
        {/* 1. Hero Section + Interactive Room Visual */}
        <Hero />

        {/* 2. Section 2: The Problem (Lighting Shift Comparison) */}
        <ProblemSection />

        {/* 3. Section 3: The 4-Step PaintIT Journey */}
        <ProcessSection />

        {/* 4. Section 4: Two Sides of PaintIT (Homeowner & Painter Split) */}
        <TwoSidesSection />

        {/* 5. Section 5: The Connection (Story Arc) */}
        <ConnectionStorySection />

        {/* 6. Section 6: Interactive Product Showcase (Dark Studio UI) */}
        <InteractiveDemoSection />

        {/* 7. Section 7: Why Visualization Matters (3 Pillars) */}
        <WhyVisualizationSection />

        {/* 8. Section 8: Dedicated For Painting Professionals */}
        <ForPaintersSection />

        {/* 9. Section 9: Dedicated For Homeowners (Transformation) */}
        <ForHomeownersSection />

        {/* 10. Section 10: Concept Link Sharing & Collaboration */}
        <ShareCollaborateSection />

        {/* 11. Section 11: Concise Honest FAQ */}
        <FAQSection />

        {/* 12. Final High Impact Conversion CTA */}
        <FinalCTASection />
      </main>

      {/* Footer */}
      <FooterSection />

      {/* Discrete Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
}

export default function Home() {
  return (
    <AlertProvider>
      <ThemeProvider>
        <StudioProvider>
          <LandingPageContent />
        </StudioProvider>
      </ThemeProvider>
    </AlertProvider>
  );
}