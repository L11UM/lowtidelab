"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Rocket, Check } from "lucide-react";
import { monetization } from "@/lib/config";

type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "submitting") return;
    setStatus("submitting");

    try {
      const res = await fetch(monetization.waitlistFormEndpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "rocketgpt-waitlist" }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4 text-sm text-white">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Check className="h-4 w-4" />
        </span>
        You&apos;re on the list — I&apos;ll email you when RocketGPT Pro launches.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="glass flex items-center gap-2 rounded-full p-1.5 pl-4">
        <Mail className="h-4 w-4 shrink-0 text-muted" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={status === "submitting"}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "submitting" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Rocket className="h-3.5 w-3.5" />
          )}
          Get early access
        </motion.button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">
          Something went wrong — please try again in a moment.
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        Join the waitlist for RocketGPT Pro. No spam, unsubscribe anytime.
      </p>
    </form>
  );
}
