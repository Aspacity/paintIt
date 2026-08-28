import React from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";

export const metadata = {
  title: "Terms of Service | PaintIT Studio",
  description: "Terms of Service for PaintIT Studio visualization platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans">
      <LandingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="mb-8">
          <Link href="/" className="text-xs font-bold text-[#C86D51] uppercase tracking-wider hover:underline">
            ← Back to PaintIT Studio
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mt-3 text-stone-900">
            Terms of Service
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-mono">
            Last Updated: August 2026 • PaintIT Studio Legal Terms Placeholder
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-stone-700 leading-relaxed bg-[#F4F1EA] p-8 rounded-3xl border border-stone-300">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PaintIT Studio, you agree to comply with these Terms of Service. PaintIT Studio provides interior paint simulation and spatial visualization tools.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">2. Visualization Disclaimer</h2>
            <p>
              PaintIT Studio renderings are digital simulations intended to assist in spatial decisions. Actual physical paint performance depends on ambient lighting, paint manufacturer formulas, surface preparation, and contractor application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">3. User Conduct & Content</h2>
            <p>
              Users agree not to upload harmful, offensive, or unauthorized images to the studio canvas.
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
