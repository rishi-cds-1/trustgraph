"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import {
  Briefcase,
  FileText,
  GitBranch,
  Globe,
  GraduationCap,
  Layers,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { gsap } from "@/lib/gsap";

type Source = { name: string; icon: LucideIcon; tint: string };

const SOURCES: Source[] = [
  { name: "GitHub", icon: GitBranch, tint: "text-[#111111]" },
  { name: "LinkedIn", icon: Briefcase, tint: "text-[#0A66C2]" },
  { name: "Stack Overflow", icon: Layers, tint: "text-[#F48024]" },
  { name: "Devpost", icon: Trophy, tint: "text-accent" },
  { name: "Portfolio", icon: Globe, tint: "text-mercari-cyan" },
  { name: "Publications", icon: FileText, tint: "text-mercari-magenta" },
  { name: "Talks", icon: GraduationCap, tint: "text-teal" },
];

const PASSPORT_ROWS = [
  "Ships production backends — 88 merged PRs",
  "Sustained 4-year contribution history",
  "Answers the community on Stack Overflow",
  "Every line links back to its public source",
];

// A directional rail of marching dashes. Horizontal on md+, vertical on mobile.
function FlowRail() {
  return (
    <>
      <div className="flow-rail-x hidden w-full md:block" aria-hidden />
      <div className="flow-rail-y my-2 h-8 md:hidden" aria-hidden />
    </>
  );
}

export function EvidenceFlowDiagram() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".flow-source", {
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
        opacity: 0,
        x: -24,
        stagger: 0.07,
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.from(".flow-core", {
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
        opacity: 0,
        scale: 0.7,
        duration: 0.6,
        delay: 0.4,
        ease: "back.out(1.7)",
      });
      gsap.from(".flow-passport", {
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
        opacity: 0,
        x: 24,
        duration: 0.6,
        delay: 0.6,
        ease: "power2.out",
      });
      gsap.from(".flow-passport-row", {
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
        opacity: 0,
        y: 10,
        stagger: 0.1,
        duration: 0.4,
        delay: 0.9,
        ease: "power2.out",
      });
    },
    { scope: ref },
  );

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-surface py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.35]" />
      <div className="glow-green pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40" />

      <div ref={ref} className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            How it works
          </p>
          <h2 className="section-title mt-3 text-[clamp(1.9rem,4.4vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)]">
            Scattered proof in.
            <br />
            <span className="text-accent">One clear passport out.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
            TrustGraph reads the public work you&apos;ve already done across the web, lets AI
            organize what it shows, and turns it into one evidence-backed profile — no forms, no
            self-reported claims.
          </p>
        </div>

        <div className="mt-16 grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-2">
          {/* Stage 1 — scattered sources */}
          <div>
            <StageLabel index="01" title="Collect" caption="Public evidence, wherever it lives" />
            <div className="mt-5 flex flex-col gap-2.5">
              {SOURCES.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.name}
                    className="flow-source flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-[var(--shadow-xs)]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
                      <Icon className={`h-4 w-4 ${s.tint}`} strokeWidth={1.9} aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{s.name}</span>
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent/60" aria-hidden />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rail → core → rail */}
          <div className="flex items-center justify-center md:flex-col md:gap-0">
            <div className="flex w-full items-center md:w-24">
              <FlowRail />
            </div>

            {/* Stage 2 — AI core */}
            <div className="flow-core relative mx-1 flex shrink-0 flex-col items-center">
              <div className="ai-core-pulse flex h-24 w-24 items-center justify-center rounded-full bg-accent text-white md:h-28 md:w-28">
                <Sparkles className="h-8 w-8 md:h-9 md:w-9" strokeWidth={1.8} aria-hidden />
              </div>
              <span className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent">
                AI · Understand
              </span>
              <span className="mt-1 max-w-[9rem] text-center text-[11px] leading-tight text-[var(--text-muted)]">
                Weighs, verifies &amp; explains
              </span>
            </div>

            <div className="flex w-full items-center md:w-24">
              <FlowRail />
            </div>
          </div>

          {/* Stage 3 — passport */}
          <div>
            <StageLabel index="02" title="Explain" caption="A brief anyone can read in minutes" />
            <div className="flow-passport mt-5 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-md)]">
              <div className="flex items-center gap-3 border-b border-border bg-surface-secondary px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display text-sm text-white">
                  RP
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    Trust Passport
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    trustgraph.com/rishicds
                  </p>
                </div>
                <span className="ml-auto rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
                  Evidence-backed
                </span>
              </div>
              <div className="space-y-2.5 p-5">
                {PASSPORT_ROWS.map((row) => (
                  <div
                    key={row}
                    className="flow-passport-row flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {row}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StageLabel({
  index,
  title,
  caption,
}: {
  index: string;
  title: string;
  caption: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-xs font-semibold text-accent">{index}</span>
      <span className="text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)]">
        {title}
      </span>
      <span className="text-xs text-[var(--text-muted)]">— {caption}</span>
    </div>
  );
}
