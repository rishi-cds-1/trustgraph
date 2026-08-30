"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { EvidenceCard } from "@/components/evidence/EvidenceCard";
import { useEvidenceFlow } from "@/components/evidence/EvidenceFlowProvider";
import { RequirementMatrix } from "@/components/evidence/RequirementMatrix";
import { EvidenceTimeline } from "@/components/evidence/EvidenceTimeline";
import { LIMITATIONS_DISCLAIMER } from "@/constants/evidence";
import { api } from "@/lib/api";

function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function BriefContent() {
  const searchParams = useSearchParams();
  const snapshotParam = searchParams.get("snapshot");
  const { brief, setBrief } = useEvidenceFlow();
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  useEffect(() => {
    if (brief || !snapshotParam) return;
    let cancelled = false;

    async function loadSnapshot(handle: string) {
      setLoadingSnapshot(true);
      setSnapshotError(null);
      try {
        const result = await api.getSnapshotBrief(handle);
        if (!cancelled) setBrief(result);
      } catch {
        if (!cancelled) setSnapshotError("Could not load that saved snapshot.");
      } finally {
        if (!cancelled) setLoadingSnapshot(false);
      }
    }

    void loadSnapshot(snapshotParam);
    return () => {
      cancelled = true;
    };
    // Only re-run if the query param or the presence of a brief changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotParam, brief]);

  if (loadingSnapshot) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-[var(--text-muted)]">
        Loading sample evidence brief…
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">No evidence brief loaded</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {snapshotError ??
            "Start an analysis to generate an evidence brief, or load a saved snapshot from the demo bar."}
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

  const isSnapshot = brief.source === "snapshot";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="card-surface p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={brief.candidate.avatar_url}
              alt={brief.candidate.display_name}
              className="h-16 w-16 shrink-0 rounded-2xl border border-border object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {brief.candidate.display_name}
              </h1>
              <a
                href={brief.candidate.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-teal hover:underline"
              >
                @{brief.candidate.github_username}
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{brief.role.title}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-right">
            {isSnapshot && (
              <span className="rounded-full bg-[#EAF2FE] px-3 py-1 text-xs font-medium text-[#1D4ED8]">
                Saved snapshot
              </span>
            )}
            <p className="text-xs text-[var(--text-muted)]">
              {isSnapshot ? "Captured on" : "Analyzed on"} {formatTimestamp(brief.generated_at)}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {brief.sources_analyzed} sources analyzed
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border-soft)] pt-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[var(--bg-surface-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
            <ShieldCheck className="h-3.5 w-3.5 text-teal" />
            Human review required
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[var(--bg-surface-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
            Public evidence only
          </span>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Evidence summary</h2>
        <p className="mt-3 rounded-[16px] border border-border bg-white p-5 text-sm leading-relaxed text-[var(--text-secondary)]">
          {brief.summary}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Demonstrated technical areas</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {brief.technical_areas.map((area) => (
            <span
              key={area}
              className="rounded-full bg-teal-light px-3 py-1.5 text-sm font-medium text-teal"
            >
              {area}
            </span>
          ))}
          {brief.technical_areas.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No technical areas identified.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Role-requirement matrix</h2>
        <div className="mt-3">
          <RequirementMatrix
            role={brief.role}
            matches={brief.requirement_matches}
            evidenceCards={brief.evidence_cards}
            onJumpToCard={(cardId) => {
              document.getElementById(`evidence-card-${cardId}`)?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Evidence cards</h2>
        <div className="mt-3 space-y-3">
          {brief.evidence_cards.map((card) => (
            <EvidenceCard key={card.id} card={card} id={`evidence-card-${card.id}`} />
          ))}
          {brief.evidence_cards.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No evidence cards available.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Evidence timeline</h2>
        <div className="mt-4 rounded-[16px] border border-border bg-white p-5">
          <EvidenceTimeline entries={brief.timeline} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Limitations and missing context
        </h2>
        <ul className="mt-3 space-y-2 rounded-[16px] border border-border bg-white p-5 text-sm leading-relaxed text-[var(--text-secondary)]">
          {brief.limitations.map((limitation, i) => (
            <li key={i}>{limitation}</li>
          ))}
          <li className="font-medium text-[var(--text-primary)]">{LIMITATIONS_DISCLAIMER}</li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/evidence/interview"
          className="inline-flex items-center justify-center rounded-[14px] bg-accent px-6 py-3 text-sm font-medium text-[#111111] shadow-[var(--shadow-green)] transition hover:bg-accent-hover"
        >
          Suggested interview questions
        </Link>
        <Link
          href="/evidence/review"
          className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-teal/30"
        >
          Continue to human review
        </Link>
      </div>
    </div>
  );
}

export default function EvidenceBriefPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-[var(--text-muted)]">
          Loading evidence brief…
        </div>
      }
    >
      <BriefContent />
    </Suspense>
  );
}
