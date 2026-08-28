import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-semibold tracking-tight text-gradient">404</h1>
      <p className="mt-4 max-w-sm text-muted">
        This page doesn&apos;t exist — maybe it&apos;s still an idea in the Lab.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow"
      >
        Back home
      </Link>
    </section>
  );
}
