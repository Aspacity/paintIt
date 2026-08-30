import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TrafficTracker } from "@/components/analytics/TrafficTracker";
import { ServiceWorkerRegisterEngine } from "./ServiceWorkerRegisterEngine"; // Rendered below
import { FeedbackModalPopup } from "@/components/ui/FeedbackModalPopup";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: false,
});

// ✅ SAFE SERVER-SIDE SEO EXTRACTIONS (No "use client" at the top)
export const metadata: Metadata = {
  title: {
    default: "PaintIt // Interactive 3D Room Studio & Color Customizer",
    template: "%s | PaintIT",
  },
  manifest: "/manifest.json",
  description: "See your colors before the first brush stroke. The premium architectural visualization tool designed for modern interior designers, decorators, and painters to close bids faster.",
  keywords: [
    "3D interior visualization",
    "Paint simulator",
    "Room customizer",
    "Interior design software",
    "Hostel painting portfolio",
    "Architectural paint visualizer"
  ],
  authors: [{ name: "PaintIT Team" }],
  creator: "PaintIT",
  publisher: "PaintIT",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://paintit-six.vercel.app",
    title: "See Your Room Colors Instantly in 3D | PaintIT",
    description: "Eradicate paint choice guesswork. Let clients customize walls, view ambient daylight shifts, and finalize space aesthetics interactively before buying paint.",
    siteName: "PaintIT",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PaintIt Interactive 3D Architecture Canvas Framework Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PaintIT // Immersive Spatial Finishes Preview Engine",
    description: "Stop carrying paper color swatches to client briefs. Win your project contracts using interactive 3D visualization.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
    >
      <body className={`${jakarta.variable} font-sans bg-black text-neutral-100 antialiased overflow-x-hidden`}>
        {/* ✅ Injects browser runtime hooks cleanly on server-side layouts */}
        <ServiceWorkerRegisterEngine />

        <ThemeProvider>
          <AlertProvider>
            <AuthProvider>
              <TrafficTracker />
              {children}
              <FeedbackModalPopup />
            </AuthProvider>
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}