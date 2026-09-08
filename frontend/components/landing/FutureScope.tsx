"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import {
  Code2,
  FlaskConical,
  Megaphone,
  Palette,
  PenLine,
  Users,
  type LucideIcon,
} from "lucide-react";

import { gsap } from "@/lib/gsap";

type Audience = {
  role: string;
  icon: LucideIcon;
  provenBy: string;
  live?: boolean;
};

const AUDIENCES: Audience[] = [
  {
    role: "Developers",
    icon: Code2,
    provenBy: "Merged PRs · shipped repos · sustained contribution",
    live: true,
  },
  {
    role: "Designers",
    icon: Palette,
    provenBy: "Shipped product work · design systems · case studies",
  },
  {
    role: "Writers",
    icon: PenLine,
    provenBy: "Published articles · newsletters · audience & citations",
  },
  {
    role: "Marketers",
    icon: Megaphone,
    provenBy: "Campaign outcomes · growth experiments · measurable impact",
  },
  {
    role: "Researchers",
    icon: FlaskConical,
    provenBy: "Papers · citations · datasets · talks · grants",
  },
  {
    role: "Creators & freelancers",
    icon: Users,
    provenBy: "Client outcomes · public work · cross-platform reputation",
  },
];

export function FutureScope() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".future-card", {
        scrollTrigger: { trigger: ref.current, start: "top 72%" },
        opacity: 0,
        y: 26,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
      });
    },
    { scope: ref },
  );

  return (
    <section id="future" className="relative overflow-hidden bg-black py-24 md:py-32">
      <div className="glow-green pointer-events-none absolute inset-x-0 top-0 h-72 opacity-30" />

      <div ref={ref} className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            Where this goes
          </p>
          <h2 className="section-title mt-3 text-[clamp(1.9rem,4.4vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            Built for developers first.
            <br />
            <span className="text-accent">Designed for anyone who proves themselves through work.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/55">
            The same evidence engine points at every kind of proof. A portable, inspectable trust
            layer for human capability — not just code.
          </p>
        </div>

        <div className="mt-14 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.role}
                className={`future-card group relative overflow-hidden rounded-[var(--radius-card)] border p-6 transition-colors ${
                  a.live
                    ? "border-accent/40 bg-accent/[0.07]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      a.live ? "bg-accent text-white" : "bg-white/10 text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  {a.live ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
                      Live today
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                      On the roadmap
                    </span>
                  )}
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{a.role}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                  <span className="text-white/40">Proven by </span>
                  {a.provenBy}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
