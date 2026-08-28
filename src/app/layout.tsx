import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ParticleField } from "@/components/particle-field";
import { CommandPalette } from "@/components/command-palette";
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
    default: "Low Tide Lab — Ideas, Experiments & RocketGPT",
    template: "%s — Low Tide Lab",
  },
  description:
    "Low Tide Lab is a home base for ideas, experiments, and builds — including RocketGPT, an AI chatbot, and a daily AI-written blog.",
  keywords: ["Low Tide Lab", "RocketGPT", "AI chatbot", "lab", "experiments", "Next.js"],
  authors: [{ name: "Low Tide Lab" }],
  creator: "Low Tide Lab",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Low Tide Lab — Ideas, Experiments & RocketGPT",
    description:
      "Low Tide Lab is a home base for ideas, experiments, and builds — including RocketGPT, an AI chatbot, and a daily AI-written blog.",
    siteName: "Low Tide Lab",
  },
  twitter: {
    card: "summary_large_image",
    title: "Low Tide Lab — Ideas, Experiments & RocketGPT",
    description:
      "Low Tide Lab is a home base for ideas, experiments, and builds — including RocketGPT, an AI chatbot, and a daily AI-written blog.",
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
        <CommandPalette />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
