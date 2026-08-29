import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const date = post.date
    ? new Date(post.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="container-x max-w-2xl py-24">
      <Reveal>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted">
          {post.author === "bot" && (
            <span className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-accent-light">
              <Bot className="h-3 w-3" /> written entirely by Oswald
            </span>
          )}
          <span>{date}</span>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        {post.author === "bot" && (
          <p className="mt-4 max-w-lg text-xs leading-relaxed text-muted">
            Part of an ongoing experiment: this post was generated automatically by Oswald,
            our resident AI, on a daily schedule, with no human edits before publishing.
          </p>
        )}
      </Reveal>

      <Reveal delay={0.1}>
        <div
          className="prose-invert mt-10 max-w-none text-white/90 [&_a]:text-primary-light [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_p]:leading-relaxed [&_p]:text-white/80 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </Reveal>
    </article>
  );
}
