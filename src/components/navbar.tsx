"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Fish, Home, Map as MapIcon, Radio, Video, Waves } from "lucide-react";
import { CommandPaletteTrigger } from "@/components/command-palette";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tides", label: "Tides", icon: Waves },
  { href: "/piers", label: "Piers", icon: Video },
  { href: "/map", label: "Map", icon: MapIcon },
  { href: "/coast", label: "Conditions", icon: Radio },
  { href: "/blog", label: "Creature Log", icon: Fish },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled ? "glass shadow-glow-sm" : "bg-transparent"
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Low Tide Lab" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <ul className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  aria-label={link.label}
                  title={link.label}
                  className={clsx(
                    "relative flex items-center justify-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium transition-colors sm:px-4",
                    active ? "text-white" : "text-muted hover:text-white"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className="relative h-4 w-4 sm:hidden" aria-hidden="true" />
                  <span className="relative hidden sm:inline">{link.label}</span>
                </Link>
              </li>
            );
          })}
          </ul>

          <CommandPaletteTrigger />
        </div>
      </nav>
    </header>
  );
}
