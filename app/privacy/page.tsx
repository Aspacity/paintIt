import React from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";

export const metadata = {
  title: "Privacy Policy | PaintIT Studio",
  description: "Privacy Policy for PaintIT Studio visualization platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans">
      <LandingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="mb-8">
          <Link href="/" className="text-xs font-bold text-[#C86D51] uppercase tracking-wider hover:underline">
            ← Back to PaintIT Studio
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mt-3 text-stone-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-mono">
            Last Updated: August 2026 • PaintIT Studio Legal Placeholder Structure
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-stone-700 leading-relaxed bg-[#F4F1EA] p-8 rounded-3xl border border-stone-300">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">1. Information We Collect</h2>
            <p>
              PaintIT Studio collects minimal technical and session data necessary to provide room visualization previews. This may include uploaded room photos, custom wall color selections, and basic analytics metrics to improve performance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">2. Use of Room Visualizations</h2>
            <p>
              Photos uploaded to the PaintIT interactive canvas are processed strictly for real-time visualization and lighting rendering. We do not sell or license your personal room images to third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">3. Data Security & Storage</h2>
            <p>
              We implement industry-standard encryption and temporary caching controls to protect your custom interior design projects.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">4. Contact Us</h2>
            <p>
              For privacy inquiries or data request modifications, please contact legal@paintit.studio.
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
