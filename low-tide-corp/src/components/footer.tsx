import { owner } from "@/lib/owner";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-sm text-muted">
      <div className="container-x flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} {owner.companyName}. A {owner.parentBrand} experiment.
        </p>
        <p>
          Built and operated by {owner.name} —{" "}
          <a href={`mailto:${owner.email}`} className="underline hover:text-white">
            {owner.email}
          </a>
        </p>
      </div>
    </footer>
  );
}
