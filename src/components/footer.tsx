import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

const socials = [
  { href: "https://github.com", label: "GitHub", icon: Github },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "mailto:hello@example.com", label: "Email", icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container-x flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <div className="text-center text-sm text-muted sm:text-left">
          <p>&copy; {new Date().getFullYear()} yourname. Built with Next.js &amp; Tailwind.</p>
        </div>

        <div className="flex items-center gap-2">
          {socials.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary/50 hover:text-white"
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </div>

        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/projects" className="hover:text-white">
            Projects
          </Link>
          <Link href="/lab" className="hover:text-white">
            Lab
          </Link>
          <Link href="/about" className="hover:text-white">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
