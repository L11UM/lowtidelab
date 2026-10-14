"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { ClipboardList, Flame, HeartPulse } from "lucide-react";
import { CommandPaletteTrigger } from "@/components/command-palette";

const links = [
  { href: "/#catalog", label: "Training", icon: ClipboardList },
  { href: "/#ems", label: "EMS", icon: HeartPulse },
  { href: "/#fire", label: "Fire", icon: Flame },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("catalog");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.2, 0.5] });
    document.querySelectorAll("#catalog, #ems, #fire, #shared").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled ? "border-b border-white/10 bg-background/90 backdrop-blur-md" : "border-b border-transparent bg-background/70"
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
            const section = link.href.split("#")[1];
            const active = pathname === "/" && section === activeSection;
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
