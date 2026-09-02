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

function LandingPageContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen relative font-sans selection:bg-[#FF8C38] selection:text-black transition-colors duration-300 ${
      isDark ? "bg-black text-neutral-100" : "bg-[#FAF8F5] text-stone-900"
    }`}>
      {/* 1. Universal Top Header Navbar Navigation Engine */}
      <LandingNavbar />

      <main className="space-y-0">
        {/* 2. Section 1: Hero Section */}
        <Hero />

        {/* 3. Section 2: Pain Point Problem / Solution Gap */}
        <ProblemSection />

        {/* 4. Section 3: Step-by-Step 3D Studio Process Workflow */}
        <ProcessSection />

        {/* 5. Section 4: Dual Product Ecosystem (Painters + Homeowners) */}
        <TwoSidesSection />

        {/* 6. Section 5: Real Connection Story (Ibadan Hostel Refurbishment Proof) */}
        <ConnectionStorySection />

        {/* 7. Section 6: Interactive 3D Room Color Customizer Demo Studio */}
        <InteractiveDemoSection />

        {/* 7. Section 7: Why Visualization Closes Painting Bids Faster */}
        <WhyVisualizationSection />

        {/* 8. Section 8: Dedicated For Painters / Contractors */}
        <ForPaintersSection />

        {/* 9. Section 9: Dedicated For Homeowners */}
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