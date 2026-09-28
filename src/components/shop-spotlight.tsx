import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { shopProducts } from "@/lib/shop";

export function ShopSpotlight() {
  const cap = shopProducts[0];
  const label = "Field gear · new";
  return (
    <section className="overflow-hidden rounded-lg border border-accent/25 bg-[#172729] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-accent-light"><ShoppingBag className="h-3.5 w-3.5" /> {label}</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Take the signal with you.</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">A small first run of Low Tide Lab gear for people who check the water before they leave the house.</p>
        </div>
        <span className="font-mono text-xs text-muted">{cap.price}</span>
      </div>
      <div className="mt-5 overflow-hidden rounded-md border border-white/10 bg-black/20">
        <img src={cap.mockup} alt="Generated mockup of the Low Tide Lab field cap" className="aspect-[16/9] w-full object-cover" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white">{cap.name}</span>
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-light hover:text-white">Open shop <ArrowUpRight className="h-3.5 w-3.5" /></Link>
      </div>
    </section>
  );
}
