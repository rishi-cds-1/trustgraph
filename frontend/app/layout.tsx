import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono, Silkscreen } from "next/font/google";
import { Suspense } from "react";
import { ClerkUserSync } from "@/components/auth/ClerkUserSync";
import { LoadingScreen } from "@/components/providers/LoadingScreen";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { meta } from "@/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

function siteMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return new URL(raw.includes("://") ? raw : `https://${raw}`);
}

export const metadata: Metadata = {
  metadataBase: siteMetadataBase(),
  title: meta.defaultTitle,
  description: meta.defaultDescription,
  openGraph: {
    type: "website",
    siteName: "TrustGraph",
    title: meta.defaultTitle,
    description: meta.defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: meta.defaultTitle,
    description: meta.defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${silkscreen.variable} h-full antialiased`}
    >
      <head>
        {/* Retro dot-matrix display font for the homepage hero — served from
            OnlineWebFonts, a third-party font CDN not otherwise used in this
            project. Flagged for Mercari's External Service Review. */}
        <link
          href="https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <LoadingScreen />
        <SmoothScroll>
          <ClerkProvider>
            <Suspense fallback={null}>
              <ClerkUserSync />
            </Suspense>
            {children}
          </ClerkProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
