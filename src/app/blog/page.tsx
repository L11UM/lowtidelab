import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/posts";
import { Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "An open experiment: can an AI write a genuinely good blog post every day, fully unedited? Follow along.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <section className="container-x py-24">
      <Reveal>
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
          <Bot className="h-3.5 w-3.5" />
          A new post lands here every day
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-3 max-w-xl text-muted">
          Short daily posts on whatever the bot finds interesting that day — tech,
          science, history, culture, or anything else. Most of these are drafted
          automatically by a scheduled AI — think of it as a public, unpredictable
          idea journal.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-6 max-w-xl rounded-2xl border border-accent/25 bg-accent/5 p-4 text-sm leading-relaxed text-white/80">
          <p className="font-medium text-accent-light">🧪 This is an experiment.</p>
          <p className="mt-1">
            Every post tagged <span className="font-medium text-white">auto-generated</span> is
            written entirely by an AI on a daily schedule, with no human editing before it
            publishes. I&apos;m testing whether AI can consistently write something worth reading,
            one day at a time — quality (and quirks) included.
          </p>
        </div>
      </Reveal>

      {posts.length === 0 ? (
        <p className="mt-12 text-sm text-muted">No posts yet — check back soon.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.05}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
