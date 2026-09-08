"use client";

import { useState } from "react";
import {
  ChevronDown,
  Clock,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import type { CandidateSearchResult } from "@/lib/api";
import { computeForesight, type ForesightContext, type Trajectory } from "@/lib/foresight";
import { cn } from "@/lib/utils";

const trajectoryStyles: Record<Trajectory, { chip: string; stroke: string }> = {
  breakout: { chip: "bg-accent-soft text-accent", stroke: "var(--accent)" },
  rising: { chip: "bg-teal-light text-teal", stroke: "var(--teal)" },
  steady: { chip: "bg-sky-50 text-sky-700", stroke: "#0369a1" },
  emerging: { chip: "bg-[#F5F5F5] text-muted", stroke: "#9ca3af" },
};

function Sparkline({ points, stroke, uid }: { points: number[]; stroke: string; uid: string }) {
  const w = 132;
  const h = 40;
  const pad = 3;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (p - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;
  const [lastX, lastY] = coords[coords.length - 1];
  const gid = `spark-${uid.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={3.2} fill={stroke} />
    </svg>
  );
}

function FitRing({ value, stroke }: { value: number; stroke: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <svg width={68} height={68} viewBox="0 0 68 68" className="-rotate-90">
        <circle cx={34} cy={34} r={r} fill="none" stroke="#ECECEC" strokeWidth={6} />
        <circle
          cx={34}
          cy={34}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none text-ink">{value}</span>
        <span className="text-[8px] font-semibold uppercase tracking-wide text-muted">fit</span>
      </div>
    </div>
  );
}

export function CandidateForesight({
  candidate,
  ctx,
}: {
  candidate: CandidateSearchResult;
  ctx?: ForesightContext;
}) {
  const f = computeForesight(candidate, ctx);
  const ts = trajectoryStyles[f.trajectory];
  const [showQs, setShowQs] = useState(false);

  return (
    <div className="border-b border-border bg-[radial-gradient(circle_at_0%_0%,rgba(255,2,17,0.04),transparent_55%)] px-6 py-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">AI foresight</p>
        <span className="rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-medium text-muted">
          Predicted from evidence
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Trajectory + projection */}
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Trajectory</span>
            </div>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", ts.chip)}>
              {f.trajectoryLabel}
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <Sparkline points={f.spark} stroke={ts.stroke} uid={candidate.handle} />
            <div className="text-right">
              <p className="font-mono text-2xl font-bold leading-none text-ink">{f.momentum}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted">momentum</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-snug text-muted">{f.trajectoryDetail}</p>
        </div>

        {/* Predicted fit */}
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-start gap-4">
            <FitRing value={f.fit} stroke={ts.stroke} />
            <div className="min-w-0 flex-1 space-y-2">
              {f.fitBreakdown.map((axis) => (
                <div key={axis.label}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[11px] font-medium text-ink" title={axis.hint}>
                      {axis.label}
                    </span>
                    <span className="font-mono text-[11px] text-muted">{axis.value}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#ECECEC]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, axis.value)}%`, background: ts.stroke }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ramp + retention */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-white p-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-ink">Ramp-up {f.rampWeeks}</p>
            <p className="text-xs leading-snug text-muted">{f.rampDetail}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-white p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-ink">{f.retentionLabel}</p>
            <p className="text-xs leading-snug text-muted">{f.retentionDetail}</p>
          </div>
        </div>
      </div>

      {/* Why this candidate — brief */}
      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-accent/20 bg-accent-soft/60 p-3.5">
        <Target className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Why this candidate</p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{f.brief}</p>
        </div>
      </div>

      {/* Interview questions */}
      {f.interviewQuestions.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowQs((v) => !v)}
            aria-expanded={showQs}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2.5 text-left transition-colors hover:bg-[#FAFAFA]"
          >
            <MessageSquareQuote className="h-4 w-4 shrink-0 text-teal" aria-hidden />
            <span className="text-sm font-semibold text-ink">
              {f.interviewQuestions.length} evidence-based interview questions
            </span>
            <ChevronDown
              className={cn("ml-auto h-4 w-4 text-muted transition-transform", showQs && "rotate-180")}
              aria-hidden
            />
          </button>
          {showQs && (
            <ol className="mt-2 space-y-2">
              {f.interviewQuestions.map((q, i) => (
                <li
                  key={q}
                  className="flex gap-2.5 rounded-xl border border-border bg-white p-3 text-sm leading-snug text-ink"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-light font-mono text-[11px] font-bold text-teal">
                    {i + 1}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
