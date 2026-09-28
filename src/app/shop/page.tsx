import type { Metadata } from "next";
import { Anchor, ExternalLink, ShoppingBag } from "lucide-react";
import { shopProducts } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Field Gear",
  description: "Low Tide Lab field gear: the field cap and deck signal patch.",
};

export default function ShopPage() {
  return (
    <section className="container-x py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-light"><ShoppingBag className="h-3.5 w-3.5" /> Low Tide Lab · field gear</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Field gear</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Small-batch pieces for people who keep an eye on the water. The first run is intentionally small.</p>
        </div>
        <p className="inline-flex items-center gap-2 text-xs text-muted"><Anchor className="h-4 w-4 text-primary-light" /> Built for the watch</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {shopProducts.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="border-b border-white/10 bg-black/20">
              <img src={product.mockup} alt={`${product.name} generated mockup`} className="aspect-[16/9] w-full object-cover" />
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary-light">{product.type}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{product.name}</h2>
                </div>
                <span className="font-mono text-sm text-accent-light">{product.price}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{product.description}</p>
              <ul className="mt-4 space-y-2 text-xs text-white/75">
                {product.details.map((detail) => <li key={detail} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-accent" />{detail}</li>)}
              </ul>
              <a href={product.checkoutUrl} className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
                Reserve this piece <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">This first shop pass uses email reservation links while fulfillment is being set up. Generated mockups show the intended direction; final materials and color may vary.</p>
    </section>
  );
}
