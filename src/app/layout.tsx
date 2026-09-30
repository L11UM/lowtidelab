import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CommandPalette } from "@/components/command-palette";
import { BlogAnalytics } from "@/components/blog-analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = "https://lowtidelab.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Low Tide Lab — Ocean Intelligence",
    template: "%s — Low Tide Lab",
  },
  description:
    "Tide predictions, marine conditions, and coastal cameras from Low Tide Lab.",
  keywords: ["Low Tide Lab", "ocean", "tides", "deep sea", "marine life", "coastal conditions"],
  authors: [{ name: "Low Tide Lab" }],
  creator: "Low Tide Lab",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Low Tide Lab — Ocean Intelligence",
    description: "Tide predictions, marine conditions, and coastal cameras from Low Tide Lab.",
    siteName: "Low Tide Lab",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Low Tide Lab — Ocean Intelligence",
    description: "Tide predictions, marine conditions, and coastal cameras from Low Tide Lab.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} relative min-h-screen bg-background font-sans`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" />
        <BlogAnalytics />
        <CommandPalette />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
