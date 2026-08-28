"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Command,
  Home,
  FolderGit2,
  FlaskConical,
  User,
  Mail,
  Github,
  Heart,
  ArrowRight,
  Search,
} from "lucide-react";
import { monetization } from "@/lib/config";

type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const items: PaletteItem[] = useMemo(
    () => [
      { id: "home", label: "Go to Home", icon: Home, action: () => router.push("/") },
      {
        id: "projects",
        label: "Go to Projects",
        icon: FolderGit2,
        action: () => router.push("/projects"),
        keywords: "rocketgpt work",
      },
      {
        id: "lab",
        label: "Go to Idea Lab",
        icon: FlaskConical,
        action: () => router.push("/lab"),
        keywords: "ideas concepts experiments",
      },
      { id: "about", label: "Go to About", icon: User, action: () => router.push("/about") },
      {
        id: "email",
        label: "Send an email",
        hint: "opens mail client",
        icon: Mail,
        action: () => window.open("mailto:hello@liamthompson.dev", "_self"),
      },
      {
        id: "github",
        label: "Open GitHub",
        icon: Github,
        action: () => window.open("https://github.com", "_blank", "noreferrer"),
      },
      {
        id: "support",
        label: "Support this project",
        hint: "buy me a coffee",
        icon: Heart,
        action: () => window.open(monetization.stripeTipLink, "_blank", "noreferrer"),
        keywords: "tip donate coffee sponsor",
      },
    ],
    [router]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords?.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isToggle = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isToggle) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (!open) return;

      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item) {
          item.action();
          close();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, activeIndex, close]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 pt-[12vh]"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.21, 0.47, 0.32, 0.98] }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-lg overflow-hidden rounded-2xl shadow-glow"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, actions…"
                className="w-full bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
              />
              <kbd className="shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted">
                esc
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  No matches — try something else.
                </p>
              )}
              {filtered.map((item, i) => {
                const Icon = item.icon;
                const active = i === activeIndex;
                return (
                  <button
                    key={item.id}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => {
                      item.action();
                      close();
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      active ? "bg-white/10 text-white" : "text-white/80"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary-light" />
                    <span className="flex-1">{item.label}</span>
                    {item.hint && (
                      <span className="text-xs text-muted">{item.hint}</span>
                    )}
                    {active && <ArrowRight className="h-3.5 w-3.5 text-muted" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CommandPaletteTrigger() {
  return (
    <button
      onClick={() =>
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true })
        )
      }
      className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-white/30 hover:text-white sm:flex"
    >
      <Command className="h-3.5 w-3.5" />
      <span>K</span>
    </button>
  );
}
