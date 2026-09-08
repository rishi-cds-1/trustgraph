"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Sparkles } from "lucide-react";

import { EarlyTalentCard } from "@/components/recruiter/EarlyTalentCard";
import { ShortlistForesight } from "@/components/recruiter/ShortlistForesight";
import type { RecruiterCompany } from "@/lib/api";
import { computeForesight } from "@/lib/foresight";
import { mockInterns, type EarlyTalentCandidate } from "@/lib/mockInterns";

type SortKey = "priority" | "fit" | "trajectory" | "grad";

export function EarlyTalentPanel({
  company,
  onInvite,
}: {
  company?: RecruiterCompany | null;
  onInvite?: (candidate: EarlyTalentCandidate) => void;
}) {
  const [sort, setSort] = useState<SortKey>("priority");
  const ctx = useMemo(() => ({ company }), [company]);

  const ranked = useMemo(() => {
    const withScore = mockInterns.map((c) => {
      const f = computeForesight(c, ctx);
      return {
        c,
        priority: Math.round(0.45 * f.fit + 0.3 * f.momentum + 0.25 * c.trust_score.overall),
        fit: f.fit,
        momentum: f.momentum,
      };
    });
    withScore.sort((a, b) => {
      if (sort === "fit") return b.fit - a.fit;
      if (sort === "trajectory") return b.momentum - a.momentum;
      if (sort === "grad") return a.c.grad_year - b.c.grad_year;
      return b.priority - a.priority;
    });
    return withScore.map((w) => w.c);
  }, [ctx, sort]);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "priority", label: "Priority" },
    { key: "fit", label: "Predicted fit" },
    { key: "trajectory", label: "Trajectory" },
    { key: "grad", label: "Grad year" },
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="overflow-hidden rounded-2xl border border-accent/20 bg-[radial-gradient(circle_at_0%_0%,rgba(255,2,17,0.06),transparent_55%)] p-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-accent" aria-hidden />
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Early talent · pre-entry pool
          </p>
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          Meet future hires before everyone else.
        </h2>
        <p className="mt-2 max-w-3xl text-muted">
          Students graduating in <strong className="text-ink">2029</strong> who pre-registered a
          TrustGraph passport while still in school. They have short track records — so ranking is
          driven by <strong className="text-ink">AI foresight</strong>: predicted trajectory,
          role-fit, and ramp-up, all traced back to real public work rather than a résumé.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
            {mockInterns.length} pre-registered candidates
          </span>
          <span className="rounded-full border border-border bg-white px-3 py-1.5 font-medium text-muted">
            Ranked on potential, not pedigree
          </span>
        </div>
      </div>

      {/* Shortlist — reuse the same foresight ranking */}
      <ShortlistForesight candidates={mockInterns} ctx={ctx} />

      {/* Sort control */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Sort by</span>
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSort(opt.key)}
            className={
              sort === opt.key
                ? "rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white"
                : "rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-5">
        {ranked.map((candidate) => (
          <EarlyTalentCard
            key={candidate.handle}
            candidate={candidate}
            foresightCtx={ctx}
            onInvite={onInvite}
          />
        ))}
      </div>
    </div>
  );
}
