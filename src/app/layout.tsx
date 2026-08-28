import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
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

const siteUrl = "https://liamthompson.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Liam Thompson — Builder & AI Tinkerer",
    template: "%s — Liam Thompson",
  },
  description:
    "Personal site of Liam Thompson — ideas, projects, and experiments, including RocketGPT, an AI chatbot.",
  keywords: ["portfolio", "RocketGPT", "AI chatbot", "software engineer", "Next.js"],
  authors: [{ name: "Liam Thompson" }],
  creator: "Liam Thompson",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Liam Thompson — Builder & AI Tinkerer",
    description:
      "Personal site of Liam Thompson — ideas, projects, and experiments, including RocketGPT, an AI chatbot.",
    siteName: "Liam Thompson",
  },
  twitter: {
    card: "summary_large_image",
    title: "Liam Thompson — Builder & AI Tinkerer",
    description:
      "Personal site of Liam Thompson — ideas, projects, and experiments, including RocketGPT, an AI chatbot.",
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
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
