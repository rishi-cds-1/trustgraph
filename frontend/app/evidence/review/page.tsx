"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  FileText,
  MessageSquare,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import { useEvidenceFlow } from "@/components/evidence/EvidenceFlowProvider";
import type { EvidenceCardData } from "@/lib/api";

type CardReviewState = {
  verified: boolean;
  incorrect: boolean;
  needsConfirmation: boolean;
  note: string;
  removed: boolean;
  correctionRequested: boolean;
};

function emptyCardState(): CardReviewState {
  return {
    verified: false,
    incorrect: false,
    needsConfirmation: false,
    note: "",
    removed: false,
    correctionRequested: false,
  };
}

function buildPreparationBrief(
  briefSummary: string,
  roleTitle: string,
  cards: EvidenceCardData[],
  states: Record<string, CardReviewState>,
) {
  const lines: string[] = [];
  lines.push(`Internal preparation brief — ${roleTitle}`);
  lines.push("");
  lines.push("Summary:");
  lines.push(briefSummary);
  lines.push("");
  lines.push("Reviewed evidence:");
  cards.forEach((card) => {
    const s = states[card.id] ?? emptyCardState();
    if (s.removed) return;
    const tags = [
      s.verified && "verified by reviewer",
      s.incorrect && "flagged as incorrect interpretation",
      s.needsConfirmation && "requires confirmation",
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(`- ${card.claim} (${card.artifact_name})${tags ? ` [${tags}]` : ""}`);
    if (s.note) lines.push(`  Recruiter note: ${s.note}`);
  });
  lines.push("");
  lines.push(
    "This preparation brief is assembled from public evidence for internal use. It is not a hiring recommendation.",
  );
  return lines.join("\n");
}

export default function EvidenceReviewPage() {
  const { brief } = useEvidenceFlow();
  const [cardStates, setCardStates] = useState<Record<string, CardReviewState>>({});
  const [workflowStatus, setWorkflowStatus] = useState<string | null>(null);
  const [prepBriefOpen, setPrepBriefOpen] = useState(false);
  const [prepBriefText, setPrepBriefText] = useState("");
  const [copied, setCopied] = useState(false);

  const visibleCards = useMemo(
    () => (brief ? brief.evidence_cards.filter((c) => !cardStates[c.id]?.removed) : []),
    [brief, cardStates],
  );

  function updateCard(id: string, patch: Partial<CardReviewState>) {
    setCardStates((prev) => ({ ...prev, [id]: { ...(prev[id] ?? emptyCardState()), ...patch } }));
  }

  function getCard(id: string): CardReviewState {
    return cardStates[id] ?? emptyCardState();
  }

  function openPreparationBrief() {
    if (!brief) return;
    setPrepBriefText(
      buildPreparationBrief(brief.summary, brief.role.title, brief.evidence_cards, cardStates),
    );
    setPrepBriefOpen(true);
  }

  function copyPrepBrief() {
    void navigator.clipboard.writeText(prepBriefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!brief) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">No evidence brief loaded</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Analyze a GitHub profile first to open the review workflow.
        </p>
        <Link
          href="/evidence/analyze"
          className="mt-6 inline-flex items-center justify-center rounded-[14px] bg-accent px-6 py-3 text-sm font-medium text-[#111111] shadow-[var(--shadow-green)] transition hover:bg-accent-hover"
        >
          Go to analysis
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
        Proposed review workflow — interactive prototype. Actions here update local state only;
        nothing is sent to a backend or recorded against the candidate.
      </div>

      <h1 className="mt-6 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        Human review
      </h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Verify, annotate, and prepare this brief for a hiring conversation. Every decision remains
        with the recruiter or hiring manager.
      </p>

      <div className="mt-8 space-y-4">
        {visibleCards.map((card) => {
          const state = getCard(card.id);
          return (
            <div key={card.id} className="rounded-[16px] border border-border bg-white p-5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{card.claim}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{card.explanation}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {state.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-[#2d5016]">
                    <Check className="h-3 w-3" /> Verified by reviewer
                  </span>
                )}
                {state.incorrect && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#4B5563]">
                    <X className="h-3 w-3" /> Marked incorrect
                  </span>
                )}
                {state.needsConfirmation && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-medium text-[#92400E]">
                    <AlertTriangle className="h-3 w-3" /> Requires confirmation
                  </span>
                )}
                {state.correctionRequested && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-xs font-medium text-[#1D4ED8]">
                    Correction request sent (prototype)
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => updateCard(card.id, { verified: !state.verified })}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-medium text-[var(--text-secondary)] transition hover:border-teal/30"
                >
                  <Check className="h-3.5 w-3.5" /> Mark evidence as verified
                </button>
                <button
                  type="button"
                  onClick={() => updateCard(card.id, { incorrect: !state.incorrect })}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-medium text-[var(--text-secondary)] transition hover:border-teal/30"
                >
                  <X className="h-3.5 w-3.5" /> Mark interpretation as incorrect
                </button>
                <button
                  type="button"
                  onClick={() => updateCard(card.id, { needsConfirmation: !state.needsConfirmation })}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-medium text-[var(--text-secondary)] transition hover:border-teal/30"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> Mark as requiring confirmation
                </button>
                <a
                  href={card.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-medium text-[var(--text-secondary)] transition hover:border-teal/30"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open original source
                </a>
                <button
                  type="button"
                  onClick={() => updateCard(card.id, { correctionRequested: true })}
                  disabled={state.correctionRequested}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-medium text-[var(--text-secondary)] transition hover:border-teal/30 disabled:opacity-50"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Request candidate correction
                </button>
                <button
                  type="button"
                  onClick={() => updateCard(card.id, { removed: true })}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-medium text-red-600 transition hover:border-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove incorrectly attributed artifact
                </button>
              </div>

              <textarea
                value={state.note}
                onChange={(e) => updateCard(card.id, { note: e.target.value })}
                placeholder="Add recruiter or hiring-manager context…"
                rows={2}
                className="mt-3 w-full rounded-[10px] border border-border px-3 py-2 text-xs outline-none focus:border-teal"
              />
            </div>
          );
        })}
        {visibleCards.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">
            All evidence cards have been removed from this local view.
          </p>
        )}
      </div>

      <div className="mt-10 border-t border-[var(--border-soft)] pt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Workflow actions
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setWorkflowStatus("Continuing review — status saved locally.")}
            className="inline-flex items-center justify-center rounded-[14px] bg-accent px-5 py-2.5 text-sm font-medium text-[#111111] shadow-[var(--shadow-green)] transition hover:bg-accent-hover"
          >
            Continue review
          </button>
          <button
            type="button"
            onClick={() => setWorkflowStatus("Marked for discussion with the hiring manager.")}
            className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-teal/30"
          >
            Discuss with hiring manager
          </button>
          <button
            type="button"
            onClick={() => setWorkflowStatus("Flagged — needs verification before proceeding.")}
            className="inline-flex items-center justify-center gap-1.5 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-5 py-2.5 text-sm font-medium text-[#92400E] transition hover:bg-[#FEF3C7]"
          >
            <ShieldAlert className="h-4 w-4" /> Needs verification
          </button>
          <button
            type="button"
            onClick={() => setWorkflowStatus("Preparation brief saved locally.")}
            className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-teal/30"
          >
            Save preparation brief
          </button>
        </div>
        {workflowStatus && (
          <p className="mt-3 text-xs text-[var(--text-secondary)]">{workflowStatus}</p>
        )}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={openPreparationBrief}
          className="inline-flex items-center gap-2 rounded-[14px] border border-border bg-white px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-teal/30"
        >
          <FileText className="h-4 w-4" /> Generate internal preparation brief
        </button>
      </div>

      {prepBriefOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-[20px] bg-white p-6 shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Internal preparation brief
              </h2>
              <button
                type="button"
                onClick={() => setPrepBriefOpen(false)}
                className="rounded p-1 text-[var(--text-muted)] hover:bg-[#F5F5F5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              readOnly
              value={prepBriefText}
              rows={10}
              className="mt-4 w-full rounded-[10px] border border-border px-3 py-2 font-mono text-xs outline-none"
            />
            <button
              type="button"
              onClick={copyPrepBrief}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[14px] bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-10">
        <Link
          href="/evidence/brief"
          className="text-sm font-medium text-teal hover:underline"
        >
          Back to evidence brief
        </Link>
      </div>
    </div>
  );
}
