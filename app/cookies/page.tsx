import React from "react";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";

export const metadata = {
  title: "Cookie Policy | PaintIT Studio",
  description: "Cookie Policy for PaintIT Studio visualization platform.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans">
      <LandingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="mb-8">
          <Link href="/" className="text-xs font-bold text-[#C86D51] uppercase tracking-wider hover:underline">
            ← Back to PaintIT Studio
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mt-3 text-stone-900">
            Cookie Policy
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-mono">
            Last Updated: August 2026 • PaintIT Studio Policy Placeholder
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-stone-700 leading-relaxed bg-[#F4F1EA] p-8 rounded-3xl border border-stone-300">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device that allow PaintIT Studio to remember your active room color preferences and workspace state.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">2. Essential Cookies</h2>
            <p>
              We use essential session storage cookies to save your active color swatches, daylight preview settings, and user authentication state.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">3. Managing Preferences</h2>
            <p>
              You can adjust your cookie preferences at any time via your browser settings or our discrete bottom consent drawer.
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
