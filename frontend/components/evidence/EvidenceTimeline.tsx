"use client";

import type { TimelineEntry } from "@/lib/api";

export function EvidenceTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">No timeline events available.</p>;
  }

  return (
    <ol className="space-y-0">
      {entries.map((entry, i) => (
        <li key={`${entry.date}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-teal" />
            {i < entries.length - 1 && <span className="mt-1 w-px flex-1 bg-[var(--border-soft)]" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {entry.date}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">{entry.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              {entry.description}
            </p>
            {entry.source_url && (
              <a
                href={entry.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-medium text-teal hover:underline"
              >
                View source
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
