"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { useEvidenceFlow } from "@/components/evidence/EvidenceFlowProvider";

export default function EvidenceInterviewPage() {
  const { brief } = useEvidenceFlow();

  if (!brief) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">No evidence brief loaded</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Analyze a GitHub profile first to generate suggested interview questions.
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
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        Suggested areas for conversation
      </h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        These questions are generated from public evidence and should be reviewed by the recruiter
        or hiring manager.
      </p>

      <div className="mt-8 space-y-4">
        {brief.interview_questions.map((q, i) => (
          <div key={i} className="rounded-[16px] border border-border bg-white p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{q.question}</p>
            <div className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Motivating artifact
                </p>
                <p className="mt-0.5">{q.motivating_artifact}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  What it surfaces
                </p>
                <p className="mt-0.5">{q.what_it_surfaces}</p>
              </div>
            </div>
            <a
              href={q.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-teal hover:underline"
            >
              View source
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
        {brief.interview_questions.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No interview questions generated.</p>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/evidence/brief"
          className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-teal/30"
        >
          Back to evidence brief
        </Link>
        <Link
          href="/evidence/review"
          className="inline-flex items-center justify-center rounded-[14px] bg-accent px-6 py-3 text-sm font-medium text-[#111111] shadow-[var(--shadow-green)] transition hover:bg-accent-hover"
        >
          Continue to human review
        </Link>
      </div>
    </div>
  );
}
