"use client";

import { CalendarClock, GraduationCap, MapPin, Sparkles } from "lucide-react";

import { CandidateForesight } from "@/components/recruiter/CandidateForesight";
import type { ForesightContext } from "@/lib/foresight";
import type { EarlyTalentCandidate } from "@/lib/mockInterns";

export function EarlyTalentCard({
  candidate,
  foresightCtx,
  onInvite,
}: {
  candidate: EarlyTalentCandidate;
  foresightCtx?: ForesightContext;
  onInvite?: (candidate: EarlyTalentCandidate) => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-xs)]">
      {/* Header */}
      <div className="relative border-b border-border bg-[radial-gradient(circle_at_100%_0%,rgba(0,169,224,0.10),transparent_55%)] px-6 py-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-light text-xl font-semibold text-teal">
            {candidate.display_name?.[0] ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-ink">{candidate.display_name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                <GraduationCap className="h-3 w-3" aria-hidden />
                Class of {candidate.grad_year}
              </span>
              <span className="rounded-full border border-border bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                Pre-entry
              </span>
            </div>
            <p className="text-sm text-muted">@{candidate.handle}</p>
            <p className="mt-2 text-sm leading-snug text-ink">{candidate.headline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-teal" aria-hidden />
                {candidate.school} · {candidate.program}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-teal" aria-hidden />
                {candidate.availability}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden />
                {candidate.location}
              </span>
            </div>
            {candidate.interests.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {candidate.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-[#F5F5F5] px-2.5 py-0.5 text-[11px] font-medium text-muted"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Foresight — the whole point for early talent */}
      <CandidateForesight candidate={candidate} ctx={foresightCtx} />

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex flex-wrap gap-1.5">
          {(candidate.capabilities ?? []).slice(0, 4).map((cap) => (
            <span
              key={cap.name}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
            >
              {cap.name}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onInvite?.(candidate)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Invite to apply
        </button>
      </div>
    </article>
  );
}
