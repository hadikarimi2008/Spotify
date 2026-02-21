/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

import { Montserrat } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout-wrapper";
import Providers from "@/components/providers";
import SpotifyPlayer from "@/components/spotifyPlayer";
import MobileNavbar from "@/components/mobileNavbar";
import Playerontainer from "@/components/playerContainer";

const spotifyFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata = {
  title: "Hadi's Spotify - Music Streaming",
  description:
    "A professional Spotify clone built by Hadi. Proprietary Project - All Rights Reserved.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://github.com/hadikarimi2008/Spotify",
  ),
  keywords: [
    "music",
    "spotify clone",
    "streaming",
    "hadi",
    "nextjs project",
    "react",
  ],
  authors: [{ name: "Hadi", url: "https://github.com/hadikarimi2008" }],
  creator: "Hadi",
  publisher: "Hadi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url:
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://github.com/hadikarimi2008/Spotify",
    siteName: "Hadi's Spotify",
    title: "Hadi's Spotify - Professional Project",
    description:
      "This is a private project created by Hadi. Unauthorized copying or hosting is strictly prohibited.",
    images: [
      {
        url: "/logo/spotify.png",
        width: 1200,
        height: 630,
        alt: "Spotify Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hadi's Spotify",
    description: "Exclusive project built by Hadi",
    images: ["/logo/spotify.png"],
    creator: "@hadikarimi",
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
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://github.com/hadikarimi2008/Spotify",
  },
};

export default function RootLayout({ children }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo/spotify.png" />
        <link rel="apple-touch-icon" href="/logo/spotify.png" />
        <meta name="theme-color" content="#1DB954" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Spotify",
              url: baseUrl,
              description: "Music streaming platform",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${baseUrl}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={spotifyFont.className} suppressHydrationWarning>
        <Providers>
          <LayoutWrapper>
            {children}
            <Playerontainer />
            <SpotifyPlayer />
            <MobileNavbar />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
