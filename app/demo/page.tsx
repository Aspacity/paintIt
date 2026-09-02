'use client';

import { StudioProvider } from '@/context/StudioContext';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Showcase from '@/components/sections/Showcase';
import NoiseOverlay from '@/components/ui/NoiseOverlay';

export default function Home() {
  return (
    <StudioProvider>
      <main className="relative w-full min-h-screen bg-black text-white selection:bg-white selection:text-black antialiased">
        <NoiseOverlay />
        <Hero />
        <Features />
        <Showcase />
      </main>
    </StudioProvider>
  );
}