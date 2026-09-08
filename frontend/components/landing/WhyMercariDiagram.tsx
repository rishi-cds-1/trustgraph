"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  History,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

import { gsap } from "@/lib/gsap";

type Mapping = {
  n: string;
  item: { label: string; icon: LucideIcon };
  people: { label: string; icon: LucideIcon };
};

const MAPPINGS: Mapping[] = [
  {
    n: "1",
    item: { label: "Verified identity", icon: ShieldCheck },
    people: { label: "Verified sources across platforms", icon: BadgeCheck },
  },
  {
    n: "2",
    item: { label: "Ratings & reviews", icon: Star },
    people: { label: "Peer verification", icon: Users },
  },
  {
    n: "3",
    item: { label: "Transaction history", icon: History },
    people: { label: "Evidence timeline", icon: CalendarClock },
  },
  {
    n: "4",
    item: { label: "Buyer & seller safety", icon: Lock },
    people: { label: "Privacy & correction controls", icon: SlidersHorizontal },
  },
];

function Panel({
  eyebrow,
  title,
  rows,
  side,
}: {
  eyebrow: string;
  title: string;
  rows: { n: string; label: string; icon: LucideIcon }[];
  side: "item" | "people";
}) {
  const dark = side === "people";
  return (
    <div
      className={`why-panel relative overflow-hidden rounded-[var(--radius-card)] border p-6 md:p-7 ${
        dark ? "border-transparent bg-teal text-white" : "border-border bg-surface"
      }`}
    >
      <p
        className={`font-mono text-[11px] font-semibold uppercase tracking-widest ${
          dark ? "text-white/70" : "text-accent"
        }`}
      >
        {eyebrow}
      </p>
      <h3
        className={`mt-1.5 text-lg font-semibold tracking-tight ${
          dark ? "text-white" : "text-[var(--text-primary)]"
        }`}
      >
        {title}
      </h3>
      <div className="mt-5 space-y-2.5">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.n}
              className={`why-row flex items-center gap-3 rounded-2xl px-3.5 py-3 ${
                dark ? "bg-white/10" : "bg-surface-secondary"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                  dark ? "bg-white/20 text-white" : "bg-accent-soft text-accent"
                }`}
              >
                {r.n}
              </span>
              <Icon
                className={`h-4 w-4 shrink-0 ${dark ? "text-white/80" : "text-accent"}`}
                strokeWidth={1.9}
                aria-hidden
              />
              <span className={`text-sm font-medium ${dark ? "text-white" : "text-[var(--text-primary)]"}`}>
                {r.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WhyMercariDiagram() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".why-panel", {
        scrollTrigger: { trigger: ref.current, start: "top 72%" },
        opacity: 0,
        y: 28,
        stagger: 0.15,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.from(".why-bridge", {
        scrollTrigger: { trigger: ref.current, start: "top 72%" },
        opacity: 0,
        scale: 0.6,
        duration: 0.5,
        delay: 0.45,
        ease: "back.out(1.7)",
      });
    },
    { scope: ref },
  );

  return (
    <section id="why-mercari" className="relative overflow-hidden bg-surface-secondary py-24 md:py-32">
      <div ref={ref} className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            Why Mercari
          </p>
          <h2 className="section-title mt-3 text-[clamp(1.9rem,4.4vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)]">
            From trust in <span className="text-accent">items</span> to trust in{" "}
            <span className="text-accent">ability</span>.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
            Mercari has spent a decade helping strangers transact safely — identity, reviews,
            history, and safety. TrustGraph applies that same trust machinery to a different kind of
            value: what a person can actually do.
          </p>
        </div>

        <div className="relative mt-14 grid items-stretch gap-4 md:grid-cols-2 md:gap-16">
          <Panel
            side="item"
            eyebrow="Mercari — the marketplace"
            title="Trust between people over items"
            rows={MAPPINGS.map((m) => ({ n: m.n, ...m.item }))}
          />
          <Panel
            side="people"
            eyebrow="TrustGraph — the trust layer"
            title="Trust in demonstrated capability"
            rows={MAPPINGS.map((m) => ({ n: m.n, ...m.people }))}
          />

          {/* Bridge — arrow between the two panels (horizontal md, vertical mobile) */}
          <div className="why-bridge pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-surface-secondary bg-accent text-white shadow-lg">
              <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" strokeWidth={2.4} aria-hidden />
            </span>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-[var(--text-muted)]">
          Matched by number: every marketplace-trust primitive Mercari already runs has a direct
          counterpart in how TrustGraph verifies people.
        </p>
      </div>
    </section>
  );
}
