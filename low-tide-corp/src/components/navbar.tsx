"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/setup", label: "Idea Setup" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/build-brief", label: "Build Brief" },
  { href: "/workdays", label: "Workdays" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg/80 backdrop-blur">
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          Low Tide Corp
        </Link>
        <ul className="flex items-center gap-1 text-sm">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={clsx(
                    "rounded-full px-3 py-1.5 font-medium transition-colors",
                    active ? "bg-white/10 text-white" : "text-muted hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
