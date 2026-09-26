import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/posts";
import { Fish } from "lucide-react";

export const metadata: Metadata = {
  title: "Creature Log",
  description: "Daily field notes on deep-sea creatures, their habitats, and the adaptations that make life possible below the light.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const creaturePosts = posts.filter((post) => post.creature);
  const earlierPosts = posts.filter((post) => !post.creature);

  return (
    <section className="container-x py-12 sm:py-16">
      <Reveal>
        <span className="mb-4 inline-flex w-fit items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-light">
          <Fish className="h-3.5 w-3.5" />
          Daily species transmissions
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Creature Log</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          A daily descent into deep-sea life: one species, its habitat, and the adaptations that let it persist where sunlight runs out. Automated entries are labeled; sources travel with each field note.
        </p>
      </Reveal>

      {creaturePosts.length === 0 ? (
        <p className="mt-12 border-y border-white/10 py-6 text-sm text-muted">The first species transmission is being prepared.</p>
      ) : (
        <>
          <h2 className="mt-10 text-xs font-medium uppercase tracking-[0.16em] text-muted">Species transmissions · {creaturePosts.length}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creaturePosts.map((post, i) => <Reveal key={post.slug} delay={i * 0.04}><PostCard post={post} /></Reveal>)}
          </div>
        </>
      )}

      {earlierPosts.length > 0 && <details className="mt-12 border-y border-white/10 py-5">
        <summary className="cursor-pointer text-sm font-medium text-white">Earlier transmissions · {earlierPosts.length} entries</summary>
        <p className="mt-2 text-xs text-muted">Archive entries from before the Creature Log began.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {earlierPosts.map((post, i) => <Reveal key={post.slug} delay={i * 0.03}><PostCard post={post} /></Reveal>)}
        </div>
      </details>}
    </section>
  );
}
