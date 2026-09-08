"use client";

import { ListChecks } from "lucide-react";

import type { CandidateSearchResult } from "@/lib/api";
import { buildShortlist, type ForesightContext } from "@/lib/foresight";

export function ShortlistForesight({
  candidates,
  ctx,
}: {
  candidates: CandidateSearchResult[];
  ctx?: ForesightContext;
}) {
  if (candidates.length < 2) return null;
  const shortlist = buildShortlist(candidates, ctx).slice(0, 3);
  if (shortlist.length === 0) return null;

  return (
    <div className="rounded-2xl border border-accent/20 bg-[radial-gradient(circle_at_0%_0%,rgba(255,2,17,0.06),transparent_60%)] p-5">
      <div className="flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-accent" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          AI foresight — who to talk to first
        </p>
      </div>
      <p className="mt-2 text-sm leading-snug text-muted">
        Ranked by predicted fit, trajectory, and evidence strength across this search.
      </p>
      <ol className="mt-4 space-y-2">
        {shortlist.map((entry, i) => (
          <li
            key={entry.handle}
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {entry.displayName}{" "}
                <span className="font-normal text-muted">@{entry.handle}</span>
              </p>
              <p className="truncate text-xs text-muted">{entry.reason}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-base font-bold leading-none text-ink">{entry.talkScore}</p>
              <p className="text-[9px] uppercase tracking-wide text-muted">priority</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
