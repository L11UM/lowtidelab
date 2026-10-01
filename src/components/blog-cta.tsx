"use client";

import Link from "next/link";
import { ArrowRight, Fish } from "lucide-react";
import { trackBlogEvent } from "@/components/blog-analytics";

export function BlogCta({ postSlug }: { postSlug: string }) {
  return (
    <aside className="mt-12 border-t border-border pt-7">
      <p className="text-xs font-medium uppercase tracking-wide text-primary-light">Continue the descent</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">More ocean signals await.</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Return to the creature archive or check the Northern Arizona fishing report.
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
        <Link
          href="/fishing-report"
          onClick={() => trackBlogEvent("blog_cta_click", { post_slug: postSlug, destination: "fishing_report" })}
          className="inline-flex items-center gap-1.5 text-primary-light hover:text-white"
        >
          Open fishing report <Fish className="h-4 w-4" />
        </Link>
        <Link
          href="/blog"
          onClick={() => trackBlogEvent("blog_cta_click", { post_slug: postSlug, destination: "blog" })}
          className="inline-flex items-center gap-1.5 text-primary-light hover:text-white"
        >
          All creature notes <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
