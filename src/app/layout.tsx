import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ParticleField } from "@/components/particle-field";
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
    "Tides, coastal conditions, and deep-sea life from Low Tide Lab's ocean intelligence dashboard.",
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
    description: "Tides, coastal conditions, and deep-sea life from the Low Tide Lab submarine desk.",
    siteName: "Low Tide Lab",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Low Tide Lab — Ocean Intelligence",
    description: "Tides, coastal conditions, and deep-sea life from the Low Tide Lab submarine desk.",
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
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <ParticleField />
        <BlogAnalytics />
        <CommandPalette />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
