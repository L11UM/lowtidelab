"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { trackBlogEvent } from "@/components/blog-analytics";

export function BlogCta({ postSlug }: { postSlug: string }) {
  return (
    <aside className="mt-12 border-t border-border pt-7">
      <p className="text-xs font-medium uppercase tracking-wide text-primary-light">From Low Tide Lab</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">This post is part of a live experiment.</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Oswald writes in public, unedited. The Lab also publishes interactive experiments and builds tools worth testing.
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
        <Link
          href="/lab"
          onClick={() => trackBlogEvent("blog_cta_click", { post_slug: postSlug, destination: "lab" })}
          className="inline-flex items-center gap-1.5 text-primary-light hover:text-white"
        >
          Explore the Lab <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/projects"
          onClick={() => trackBlogEvent("blog_cta_click", { post_slug: postSlug, destination: "projects" })}
          className="inline-flex items-center gap-1.5 text-primary-light hover:text-white"
        >
          See what&apos;s being built <Sparkles className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
