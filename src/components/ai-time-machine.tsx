"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, ExternalLink, Orbit, Pause, Play } from "lucide-react";

type TimelineStop = {
  year: number;
  label: string;
  title: string;
  story: string;
  shift: string;
  source?: string;
  horizon?: boolean;
};

const timeline: TimelineStop[] = [
  {
    year: 1943,
    label: "First model",
    title: "A neuron becomes a circuit",
    story: "Warren McCulloch and Walter Pitts describe a simplified artificial neuron that can reason with true-or-false signals.",
    shift: "The brain becomes something engineers can model, one tiny decision at a time.",
    source: "https://doi.org/10.1007/BF02478259",
  },
  {
    year: 1950,
    label: "The question",
    title: "Can machines think?",
    story: "Alan Turing reframes the question as a test: could a machine hold up its end of a conversation well enough to fool a person?",
    shift: "Intelligence gets a practical challenge instead of a definition everyone can agree on.",
    source: "https://academic.oup.com/mind/article/LIX/236/433/986238",
  },
  {
    year: 1956,
    label: "AI is named",
    title: "A summer gives the field a name",
    story: "At Dartmouth, researchers gather around a bold idea: aspects of learning and intelligence might be described precisely enough for machines to reproduce them.",
    shift: "Artificial intelligence becomes a research program, not just a science-fiction question.",
    source: "https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth",
  },
  {
    year: 1966,
    label: "ELIZA",
    title: "A conversation in a few rules",
    story: "Joseph Weizenbaum's ELIZA reflects a person's words back as questions. Its simple tricks still make some people feel understood.",
    shift: "People discover that a convincing conversation can feel intelligent, even when the machine has little idea what it means.",
  },
  {
    year: 1997,
    label: "Deep Blue",
    title: "A machine takes the chess crown",
    story: "IBM's Deep Blue defeats world chess champion Garry Kasparov in a match, searching millions of possible moves with specialized hardware.",
    shift: "A computer can beat people at a famously human game without thinking the way people do.",
  },
  {
    year: 2012,
    label: "AlexNet",
    title: "Neural networks see a leap",
    story: "AlexNet dramatically improves image recognition using a deep neural network trained on a huge collection of labeled pictures.",
    shift: "More data and more computing power turn neural networks into practical tools for seeing patterns.",
    source: "https://arxiv.org/abs/1207.0580",
  },
  {
    year: 2016,
    label: "AlphaGo",
    title: "Go's ancient board, new kind of move",
    story: "DeepMind's AlphaGo beats Lee Sedol, one of the world's strongest Go players. Move 37 in game two surprises experts watching around the world.",
    shift: "Learning systems can find strategies that people did not teach them directly.",
    source: "https://deepmind.google/discover/blog/alphago-the-story-so-far/",
  },
  {
    year: 2022,
    label: "ChatGPT",
    title: "A research tool reaches everyone",
    story: "ChatGPT makes a new style of language model easy to try: ask in everyday words, get a useful-sounding response, then keep the conversation going.",
    shift: "AI moves from a specialist tool into a public interface millions of people can experiment with.",
    source: "https://openai.com/index/chatgpt/",
  },
  {
    year: 2024,
    label: "Many senses",
    title: "Models begin to listen and look",
    story: "Newer assistants work across combinations of text, images, audio, and video, making interaction feel less like filling in a form.",
    shift: "The interface expands beyond typing. A model can respond to what it hears or sees, not just what someone writes.",
  },
  {
    year: 2035,
    label: "Possible · 2035",
    title: "The personal agent",
    story: "One possible future: a trusted assistant coordinates long tasks across your tools, but asks before spending, sharing, or making decisions that matter.",
    shift: "The hard question may shift from 'Can it do this?' to 'Who gave it permission, and who checks its work?'",
    horizon: true,
  },
  {
    year: 2050,
    label: "Possible · 2050",
    title: "Intelligence becomes infrastructure",
    story: "A far horizon, not a forecast: AI could help people discover materials, design medicines, tutor across languages, and model a changing planet.",
    shift: "The outcome depends on human choices: access, energy, safety, rights, and who gets to shape the systems.",
    horizon: true,
  },
];

export function AiTimeMachine() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const active = timeline[activeIndex];
  const progress = (activeIndex / (timeline.length - 1)) * 100;

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % timeline.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [playing]);

  const select = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(timeline.length - 1, index)));
  };

  return (
    <section aria-labelledby="ai-time-machine-title" className="relative mt-14 overflow-hidden border-y border-white/10 py-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
      <div className="relative">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-light">
              <Orbit className="h-3.5 w-3.5" /> Intelligence · then / next
            </p>
            <h2 id="ai-time-machine-title" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">The AI time machine</h2>
            <p className="mt-2 text-sm text-muted">From artificial neurons to possible horizons.</p>
          </div>
          <div className={clsx("rounded border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em]", active.horizon ? "border-accent/35 bg-accent/10 text-accent-light" : "border-primary/30 bg-primary/10 text-primary-light")}>
            {active.horizon ? "Possible future · not a forecast" : "Recorded history"}
          </div>
        </header>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(220px,0.72fr)_minmax(0,1.8fr)] lg:gap-12">
          <div className="relative min-h-40 border-l border-white/10 pl-5 sm:pl-7">
            <span className={clsx("absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ring-4 ring-background", active.horizon ? "bg-accent" : "bg-primary-light")} />
            <p className={clsx("font-mono text-5xl font-semibold tabular-nums leading-none sm:text-6xl", active.horizon ? "text-accent-light" : "text-primary-light")}>
              {active.year}
              {active.horizon && <span className="text-2xl">?</span>}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{active.label}</p>
            <div className="mt-6 flex items-center gap-2">
              <button type="button" onClick={() => { select(activeIndex - 1); setPlaying(false); }} disabled={activeIndex === 0} aria-label="Previous AI milestone" className="rounded border border-white/10 p-2 text-white/75 transition-colors hover:border-primary/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause timeline" : "Play timeline"} title={playing ? "Pause timeline" : "Play timeline"} className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs text-white/80 transition-colors hover:border-primary/50 hover:text-white">
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playing ? "Pause" : "Autoplay"}
              </button>
              <button type="button" onClick={() => { select(activeIndex + 1); setPlaying(false); }} disabled={activeIndex === timeline.length - 1} aria-label="Next AI milestone" className="rounded border border-white/10 p-2 text-white/75 transition-colors hover:border-primary/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <article key={active.year} aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl">{active.title}</h3>
              {active.source && (
                <a href={active.source} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded border border-white/10 px-2.5 py-1.5 text-[10px] text-muted transition-colors hover:border-primary/40 hover:text-white">
                  Source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">{active.story}</p>
            <div className="mt-6 grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-2 sm:gap-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">The shift</p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">{active.shift}</p>
              </div>
              <div className="sm:border-l sm:border-white/10 sm:pl-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Time index</p>
                <p className="mt-2 font-mono text-sm tabular-nums text-white/85">{String(activeIndex + 1).padStart(2, "0")} <span className="text-muted">/ {String(timeline.length).padStart(2, "0")} milestones</span></p>
              </div>
            </div>
          </article>
        </div>

        <div className="relative mt-8 border-t border-white/10 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label htmlFor="ai-timeline-range" className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Timeline scrubber</label>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Past <span className="mx-2 text-primary-light">/</span> Possible future</span>
          </div>
          <input
            id="ai-timeline-range"
            type="range"
            min={0}
            max={timeline.length - 1}
            step={1}
            value={activeIndex}
            onChange={(event) => { select(Number(event.target.value)); setPlaying(false); }}
            aria-label="Scrub through AI milestones"
            aria-valuetext={`${active.year}${active.horizon ? " possible future" : ""}: ${active.title}`}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-primary-light"
            style={{ accentColor: active.horizon ? "#e8c39a" : "#8fc9c1" }}
          />
          <div className="mt-3 overflow-x-auto pb-2">
            <ol className="relative flex min-w-[780px] justify-between gap-1">
              <span aria-hidden="true" className="absolute left-2 right-2 top-[5px] h-px bg-white/10" />
              {timeline.map((stop, index) => (
                <li key={stop.year} className="relative z-10 flex-1">
                  <button type="button" onClick={() => { select(index); setPlaying(false); }} aria-current={index === activeIndex ? "step" : undefined} aria-label={`${stop.year}${stop.horizon ? " possible future" : ""}: ${stop.title}`} className="group flex w-full flex-col items-center gap-2 px-1 text-center">
                    <span className={clsx("h-2.5 w-2.5 rounded-full border transition-all group-hover:scale-125", index === activeIndex ? (stop.horizon ? "scale-125 border-accent bg-accent shadow-[0_0_14px_rgba(232,195,154,0.7)]" : "scale-125 border-primary-light bg-primary-light shadow-[0_0_14px_rgba(143,201,193,0.7)]") : stop.horizon ? "border-accent/50 bg-background" : "border-white/30 bg-background")} />
                    <span className={clsx("whitespace-nowrap font-mono text-[10px] tabular-nums", index === activeIndex ? "text-white" : "text-muted group-hover:text-white")}>{stop.year}{stop.horizon ? "?" : ""}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
