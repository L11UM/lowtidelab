import type { Metadata } from "next";
import { ClipboardCheck, Compass, Radio, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Training Mission",
  description: "How Low Tide Lab organizes EMS, fire, and shared crew skill practice.",
};

const principles = [
  { title: "Train to a standard", detail: "Each drill is a practice prompt, not a replacement for current agency protocols, approved curricula, medical direction, or instructor sign-off.", icon: ClipboardCheck },
  { title: "Make practice repeatable", detail: "Skills are organized by discipline and competency area with an objective, short drill sequence, and an observable completion check.", icon: Radio },
  { title: "Readiness is earned", detail: "Browser progress is a personal reminder only. It is not a credential, verified competency record, or shared department training file.", icon: ShieldCheck },
];

export default function AboutPage() {
  return (
    <section className="container-x py-12 sm:py-16">
      <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-light"><Compass className="h-3.5 w-3.5" /> Training mission · Low Tide Lab</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Practice together. Operate ready.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">Low Tide Lab organizes EMS, fireground, and shared crew skills into short, repeatable practice sessions. The goal is a useful starting point for deliberate team training, not a substitute for local standards or qualified instruction.</p>

      <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
        {principles.map(({ title, detail, icon: Icon }) => <section key={title} className="flex gap-4 py-5">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" />
          <div><h2 className="text-sm font-semibold text-white">{title}</h2><p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">{detail}</p></div>
        </section>)}
      </div>
    </section>
  );
}