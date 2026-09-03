import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TrafficTracker } from "@/components/analytics/TrafficTracker";
import { ServiceWorkerRegisterEngine } from "./ServiceWorkerRegisterEngine";
import { FeedbackModalPopup } from "@/components/ui/FeedbackModalPopup";
import { ConsentBanner } from "@/components/consent/ConsentBanner";

// ✅ SAFE SERVER-SIDE SEO EXTRACTIONS
export const metadata: Metadata = {
  title: {
    default: "PaintIt // Interactive 3D Room Studio & Color Customizer",
    template: "%s | PaintIT",
  },
  manifest: "/manifest.json",
  description:
    "Empowering paint contractors and clients with photorealistic 3D spatial room visualization, real-time lighting previews, and seamless bid estimation.",
  keywords: [
    "3D Room Painting",
    "Paint Customizer",
    "Painter Contractor Tools",
    "Dulux Paints 3D",
    "PaintIt Studio",
  ],
  authors: [{ name: "PaintIT Engineering Team" }],
  creator: "PaintIT",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://paint-it-six.vercel.app",
    title: "PaintIT // Win Painting Bids with Photorealistic 3D Visualizations",
    description:
      "Transform flat color swatches into immersive 3D room experiences. Give clients absolute confidence before the first drop of paint touches their wall.",
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
      <body className="font-sans bg-black text-neutral-100 antialiased overflow-x-hidden">
        {/* ✅ Injects browser runtime hooks cleanly on server-side layouts */}
        <ServiceWorkerRegisterEngine />

        <ThemeProvider>
          <AlertProvider>
            <AuthProvider>
              <TrafficTracker />
              {children}
              <FeedbackModalPopup />
              <ConsentBanner />
            </AuthProvider>
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}