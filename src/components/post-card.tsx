"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Bot, Fish } from "lucide-react";
import type { PostMeta } from "@/lib/posts";
import { trackBlogEvent } from "@/components/blog-analytics";

export function PostCard({ post }: { post: PostMeta }) {
  const date = post.date
    ? new Date(`${post.date}T12:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Link
        href={`/blog/${post.slug}`}
        onClick={() => trackBlogEvent("blog_post_open", { post_slug: post.slug, post_title: post.title })}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary/40"
      >
        {post.coverImage && <img src={post.coverImage} alt={post.creature ? `${post.creature} in the deep sea` : "Deep-sea field note"} className="aspect-[16/9] w-full object-cover" />}
        <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          {post.author === "bot" && (
            <span className="inline-flex items-center gap-1 text-accent-light">
              <Bot className="h-3 w-3" /> {post.creature ? "AI field note" : "AI archive entry"}
            </span>
          )}
          {post.creature && <span className="inline-flex items-center gap-1 text-primary-light"><Fish className="h-3 w-3" /> {post.creature}</span>}
          <span>{date}</span>
        </div>

        <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary-light">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
        </div>
        </div>
      </Link>
    </motion.div>
  );
}
