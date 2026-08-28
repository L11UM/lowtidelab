import Link from "next/link";
import { Coffee, Heart, Sparkles } from "lucide-react";
import { monetization } from "@/lib/config";

export function SupportCTA() {
  return (
    <div className="glass grid gap-6 rounded-2xl p-6 sm:grid-cols-2 sm:p-8">
      <div>
        <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-light">
          <Heart className="h-3.5 w-3.5" />
          Support this project
        </span>
        <h3 className="text-lg font-semibold tracking-tight">
          Help keep RocketGPT and the Lab running
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Everything here is free to use. If something I&apos;ve built saved
          you time or sparked an idea, you can chip in to cover hosting and
          API costs — one-time or monthly.
        </p>
      </div>

      <div className="flex flex-col justify-center gap-3">
        <Link
          href={monetization.stripeTipLink}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Coffee className="h-4 w-4" />
          Buy me a coffee
        </Link>
        <Link
          href={monetization.stripeMembershipLink}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-white/30 hover:bg-white/5"
        >
          <Sparkles className="h-4 w-4" />
          Become a monthly supporter
        </Link>
        <p className="text-center text-xs text-muted">
          Also on{" "}
          <Link href={monetization.koFiUrl} target="_blank" rel="noreferrer noopener" className="underline hover:text-white">
            Ko-fi
          </Link>{" "}
          and{" "}
          <Link href={monetization.githubSponsorsUrl} target="_blank" rel="noreferrer noopener" className="underline hover:text-white">
            GitHub Sponsors
          </Link>
        </p>
      </div>
    </div>
  );
}
