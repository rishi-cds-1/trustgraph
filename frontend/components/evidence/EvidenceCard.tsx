"use client";

import { ExternalLink } from "lucide-react";

import { EVIDENCE_KIND_META } from "@/constants/evidence";
import type { EvidenceCardData } from "@/lib/api";

const CONFIDENCE_LABEL: Record<EvidenceCardData["confidence"], string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function EvidenceCard({ card, id }: { card: EvidenceCardData; id?: string }) {
  const kindMeta = EVIDENCE_KIND_META[card.kind];

  return (
    <div id={id} className="scroll-mt-24 rounded-[16px] border border-border bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={
            card.kind === "direct"
              ? "rounded-full bg-teal-light px-2.5 py-0.5 text-[11px] font-medium text-teal"
              : "rounded-full bg-[#EAF2FE] px-2.5 py-0.5 text-[11px] font-medium text-[#1D4ED8]"
          }
        >
          {kindMeta.label}
        </span>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
          {CONFIDENCE_LABEL[card.confidence]}
        </span>
        {card.date && (
          <span className="text-[11px] text-[var(--text-muted)]">{card.date}</span>
        )}
      </div>

      <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{card.claim}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">{card.explanation}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[var(--text-primary)]">{card.artifact_name}</p>
          {card.file_or_commit_ref && (
            <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">
              {card.file_or_commit_ref}
            </p>
          )}
        </div>
        <a
          href={card.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border border-border bg-[var(--bg-surface-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-teal/30 hover:text-teal"
        >
          Open original source
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
