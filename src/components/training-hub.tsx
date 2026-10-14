"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownWideNarrow, Check, ChevronDown, ChevronUp, ClipboardList, Flame, HeartPulse, Search, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";
import { trainingDisciplines, trainingSkills, type TrainingDiscipline, type TrainingSkill } from "@/lib/training-skills";

type SkillState = "unstarted" | "practicing" | "ready";
type StateMap = Record<string, SkillState>;

const STORAGE_KEY = "lowtidelab.training-progress.v1";
const disciplines: Array<"All" | TrainingDiscipline> = ["All", ...trainingDisciplines];
const stateLabels: Record<SkillState, string> = { unstarted: "Not started", practicing: "Practicing", ready: "Ready" };

function SkillCard({ skill, state, onStateChange }: { skill: TrainingSkill; state: SkillState; onStateChange: (id: string, state: SkillState) => void }) {
  const [open, setOpen] = useState(false);
  const nextState: SkillState = state === "unstarted" ? "practicing" : state === "practicing" ? "ready" : "practicing";

  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-[#101619] transition-colors hover:border-white/20">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-start gap-3 p-4 text-left">
        <span className={clsx("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border", state === "ready" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200" : state === "practicing" ? "border-amber-200/30 bg-amber-200/10 text-amber-100" : "border-white/10 bg-white/[0.03] text-white/55")}>
          {state === "ready" ? <Check className="h-4 w-4" /> : skill.discipline === "Fire" ? <Flame className="h-4 w-4" /> : <HeartPulse className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-white">{skill.title}</span>
            <span className="font-mono text-[10px] text-white/40">{skill.minutes} min</span>
          </span>
          <span className="mt-1.5 block text-xs leading-relaxed text-white/60">{skill.objective}</span>
          <span className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/55">{skill.level}</span>
            <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/55">{stateLabels[state]}</span>
          </span>
        </span>
        {open ? <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-white/45" /> : <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-white/45" />}
      </button>
      {open && <div className="border-t border-white/10 bg-[#0c1113] px-4 py-4 sm:pl-[3.75rem]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/75">Practice sequence</p>
        <ol className="mt-2 space-y-2">
          {skill.drill.map((step, index) => <li key={step} className="flex gap-2 text-xs leading-relaxed text-white/70"><span className="font-mono text-white/35">{String(index + 1).padStart(2, "0")}</span><span>{step}</span></li>)}
        </ol>
        <div className="mt-3 border-l-2 border-amber-200/50 pl-3 text-xs leading-relaxed text-white/65"><span className="font-semibold text-amber-100">Check:</span> {skill.check}</div>
        <button type="button" onClick={() => onStateChange(skill.id, nextState)} className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-emerald-200/40 hover:bg-emerald-200/10">
          {nextState === "ready" ? <Check className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
          {nextState === "ready" ? "Mark ready" : state === "ready" ? "Return to practice" : "Start practice"}
        </button>
      </div>}
    </article>
  );
}

export function TrainingHub() {
  const [discipline, setDiscipline] = useState<"All" | TrainingDiscipline>("All");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All skills");
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<StateMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProgress(JSON.parse(saved) as StateMap);
    } catch {
      // Training remains usable if browser storage is unavailable.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Progress is a convenience, not a blocker for practice.
    }
  }, [hydrated, progress]);

  const availableSkills = discipline === "All" ? trainingSkills : trainingSkills.filter((skill) => skill.discipline === discipline);
  const categories = ["All categories", ...new Set(availableSkills.map((skill) => skill.category))];
  const filteredSkills = useMemo(() => trainingSkills.filter((skill) => {
    const matchesDiscipline = discipline === "All" || skill.discipline === discipline;
    const matchesCategory = category === "All categories" || skill.category === category;
    const matchesStatus = status === "All skills" || stateLabels[progress[skill.id] ?? "unstarted"] === status;
    const searchText = `${skill.title} ${skill.category} ${skill.objective} ${skill.discipline} ${skill.level} ${skill.drill.join(" ")} ${skill.check}`.toLowerCase();
    return matchesDiscipline && matchesCategory && matchesStatus && searchText.includes(search.trim().toLowerCase());
  }), [category, discipline, progress, search, status]);

  const readyCount = trainingSkills.filter((skill) => progress[skill.id] === "ready").length;
  const practicingCount = trainingSkills.filter((skill) => progress[skill.id] === "practicing").length;
  const grouped = (discipline === "All" ? trainingDisciplines : [discipline]).map((track) => ({
    track,
    groups: [...new Set(filteredSkills.filter((skill) => skill.discipline === track).map((skill) => skill.category))].map((group) => ({
      name: group,
      skills: filteredSkills.filter((skill) => skill.discipline === track && skill.category === group),
    })),
  }));

  const changeState = (id: string, next: SkillState) => setProgress((current) => ({ ...current, [id]: next }));

  return (
    <div className="container-x pb-16 pt-7 sm:pt-10">
      <section className="relative overflow-hidden border-y border-white/10 py-7 sm:py-9">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(ellipse_at_right,_rgba(114,170,148,0.12),_transparent_65%)] sm:block" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-100/75"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Low Tide Lab / Training Division</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">Train the skill.<br className="hidden sm:block" /> Trust the crew.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">A practical training board for EMS, fireground, and shared crew competencies. Pick a skill, run a short drill, and keep track of what your crew has practiced.</p>
          </div>
          <div className="grid grid-cols-3 border border-white/10 bg-[#101619] sm:min-w-[310px]">
            <div className="border-r border-white/10 px-4 py-3"><p className="font-mono text-xl font-semibold tabular-nums text-white">{trainingSkills.length}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">Skill drills</p></div>
            <div className="border-r border-white/10 px-4 py-3"><p className="font-mono text-xl font-semibold tabular-nums text-amber-100">{practicingCount}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">In practice</p></div>
            <div className="px-4 py-3"><p className="font-mono text-xl font-semibold tabular-nums text-emerald-200">{readyCount}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">Ready</p></div>
          </div>
        </div>
      </section>

      <section id="catalog" className="mt-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-emerald-100/80" /><h2 className="text-sm font-semibold text-white">Competency catalog</h2><span className="font-mono text-[10px] text-white/40">{filteredSkills.length} shown</span></div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-white/40"><ShieldCheck className="mr-1 inline h-3 w-3" /> Department protocols take priority</p>
        </div>

        <div className="mt-4 space-y-3 border-y border-white/10 py-4">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by discipline">
            {disciplines.map((item) => <button key={item} type="button" onClick={() => { setDiscipline(item); setCategory("All categories"); }} aria-pressed={discipline === item} className={clsx("rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors", discipline === item ? "border-emerald-100/40 bg-emerald-100/10 text-emerald-50" : "border-white/10 text-white/55 hover:text-white")}>{item}</button>)}
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_auto_auto]">
            <label className="relative block"><span className="sr-only">Search skills</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search skills, categories, objectives" className="h-10 w-full rounded-md border border-white/10 bg-[#101619] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-100/50" /></label>
            <label className="relative"><span className="sr-only">Filter by category</span><ArrowDownWideNarrow className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full appearance-none rounded-md border border-white/10 bg-[#101619] pl-9 pr-8 text-xs text-white outline-none focus:border-emerald-100/50 sm:min-w-44">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="relative"><span className="sr-only">Filter by practice status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-full appearance-none rounded-md border border-white/10 bg-[#101619] px-3 pr-8 text-xs text-white outline-none focus:border-emerald-100/50 sm:min-w-36">{["All skills", ...Object.values(stateLabels)].map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
        </div>

        <div className="mt-5 space-y-8">
          {grouped.map(({ track, groups }) => <section key={track} id={track.toLowerCase()} aria-label={`${track} skills`}>
            {groups.length > 0 && <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-2"><span className={clsx("h-1.5 w-1.5 rounded-full", track === "EMS" ? "bg-sky-200" : track === "Fire" ? "bg-orange-200" : "bg-emerald-200")} /><h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">{track}</h3></div>}
            <div className="space-y-5">{groups.map(({ name, skills }) => <section key={name}>
              <h4 className="mb-2 text-xs font-semibold text-white/45">{name}</h4>
              <div className="grid gap-2 lg:grid-cols-2">{skills.map((skill) => <SkillCard key={skill.id} skill={skill} state={progress[skill.id] ?? "unstarted"} onStateChange={changeState} />)}</div>
            </section>)}</div>
          </section>)}
          {filteredSkills.length === 0 && <div className="border border-dashed border-white/15 px-5 py-12 text-center"><p className="text-sm font-semibold text-white">No matching skills</p><p className="mt-1 text-xs text-white/50">Try a broader search or clear one of the filters.</p><button type="button" onClick={() => { setSearch(""); setCategory("All categories"); setStatus("All skills"); setDiscipline("All"); }} className="mt-4 rounded-md border border-white/15 px-3 py-2 text-xs text-white/75 hover:text-white">Clear filters</button></div>}
        </div>
      </section>

      <aside className="mt-10 flex items-start gap-3 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-100/70" /><p>Training prompts are practice aids, not clinical direction or department policy. Use current approved curricula, medical direction, equipment manuals, and instructor supervision. Record readiness only under your agency's competency process.</p></aside>
    </div>
  );
}