// AI foresight — the "Yogen" (prediction) layer for the recruiter side.
//
// Every value here is derived deterministically from evidence already returned
// by the search API (trust dimensions, capabilities, matched signals, evidence
// counts) plus the parsed job query. Nothing is a black box: each prediction
// traces back to inspectable evidence, which is exactly the promise TrustGraph
// makes on the passport side. Deterministic also means stable renders (no
// hydration drift, no per-render jitter) and a demo that never fails live.

import type {
  CandidateSearchResult,
  ParsedRecruiterQuery,
  RecruiterCompany,
} from "@/lib/api";

export type ForesightContext = {
  parsedQuery?: ParsedRecruiterQuery;
  company?: RecruiterCompany | null;
};

export type Trajectory = "breakout" | "rising" | "steady" | "emerging";

export type FitAxis = { label: string; value: number; hint: string };

export type CandidateForesight = {
  momentum: number;
  trajectory: Trajectory;
  trajectoryLabel: string;
  trajectoryDetail: string;
  spark: number[];
  rampWeeks: string;
  rampDetail: string;
  retentionLabel: string;
  retentionDetail: string;
  fit: number;
  fitBreakdown: FitAxis[];
  brief: string;
  interviewQuestions: string[];
};

export type ShortlistEntry = {
  handle: string;
  displayName: string;
  talkScore: number;
  reason: string;
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n: number) => Math.round(n);

// Stable 32-bit hash for deterministic sparkline jitter.
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1
}

function tokenize(values: (string | undefined)[]): Set<string> {
  const out = new Set<string>();
  for (const v of values) {
    if (!v) continue;
    for (const part of v.toLowerCase().split(/[^a-z0-9+#.]+/)) {
      const t = part.trim();
      if (t.length >= 2) out.add(t);
    }
  }
  return out;
}

/** How much of what the job asks for shows up in the candidate's evidence. */
function skillOverlap(candidate: CandidateSearchResult, ctx: ForesightContext) {
  const wanted = tokenize([
    ...(ctx.parsedQuery?.skills ?? []),
    ...(ctx.parsedQuery?.tools ?? []),
  ]);
  const have = tokenize([
    ...(candidate.capabilities ?? []).map((c) => c.name),
    ...(candidate.matched_signals ?? []).map((s) => s.label),
    ...(candidate.match_highlights ?? []),
    candidate.headline,
  ]);

  const matched: string[] = [];
  for (const w of wanted) {
    for (const h of have) {
      if (h === w || h.includes(w) || w.includes(h)) {
        matched.push(w);
        break;
      }
    }
  }
  const fraction = wanted.size === 0 ? null : matched.length / wanted.size;
  return { fraction, matched: [...new Set(matched)], wantedCount: wanted.size };
}

function strongestDimension(c: CandidateSearchResult) {
  const d = c.trust_score.dimensions;
  const entries: { key: string; label: string; value: number }[] = [
    { key: "evidence_depth", label: "evidence depth", value: d.evidence_depth },
    { key: "consistency", label: "consistency", value: d.consistency },
    { key: "peer_verification", label: "peer verification", value: d.peer_verification },
    { key: "impact_signals", label: "impact & reach", value: d.impact_signals },
  ];
  return entries.reduce((a, b) => (b.value > a.value ? b : a));
}

export function computeForesight(
  candidate: CandidateSearchResult,
  ctx: ForesightContext = {},
): CandidateForesight {
  const d = candidate.trust_score.dimensions;
  const verifiedCaps = (candidate.capabilities ?? []).filter((c) => c.verified).length;
  const capBoost = clamp(verifiedCaps * 12 + Math.min(candidate.evidence_count, 40) * 1.2);

  // ---- Momentum: recent-shipping + depth, lifted by verified breadth ----
  const momentum = round(
    clamp(0.34 * d.impact_signals + 0.32 * d.consistency + 0.24 * d.evidence_depth + 0.1 * capBoost),
  );

  let trajectory: Trajectory = "emerging";
  let trajectoryLabel = "Emerging";
  if (momentum >= 80) {
    trajectory = "breakout";
    trajectoryLabel = "Breakout trajectory";
  } else if (momentum >= 64) {
    trajectory = "rising";
    trajectoryLabel = "Rising";
  } else if (momentum >= 45) {
    trajectory = "steady";
    trajectoryLabel = "Steady operator";
  }

  const topDim = strongestDimension(candidate);
  const trajectoryDetail =
    trajectory === "breakout"
      ? `Accelerating across ${topDim.label} and shipping cadence.`
      : trajectory === "rising"
        ? `Upward pattern led by ${topDim.label}.`
        : trajectory === "steady"
          ? `Reliable, consistent output over time.`
          : `Early signal — verify depth in conversation.`;

  // ---- Projected trajectory sparkline (8 pts, ends near momentum) ----
  const slope = trajectory === "breakout" ? 4.6 : trajectory === "rising" ? 3 : trajectory === "steady" ? 0.7 : 1.8;
  const jitter = hashString(candidate.handle);
  const spark: number[] = [];
  const start = clamp(momentum - slope * 7, 8, 100);
  for (let i = 0; i < 8; i++) {
    const wobble = (hashString(candidate.handle + i) - 0.5) * (6 + jitter * 4);
    spark.push(round(clamp(start + slope * i + wobble, 4, 100)));
  }
  spark[spark.length - 1] = momentum; // land exactly on the forecast

  // ---- Ramp-up prediction from skill/tool overlap ----
  const overlap = skillOverlap(candidate, ctx);
  const frac = overlap.fraction;
  let rampWeeks = "~3–4 weeks";
  if (frac === null) {
    rampWeeks = d.evidence_depth >= 65 ? "~2–3 weeks" : "~3–5 weeks";
  } else if (frac >= 0.6) rampWeeks = "~1 week";
  else if (frac >= 0.35) rampWeeks = "~1–2 weeks";
  else if (frac >= 0.15) rampWeeks = "~2–4 weeks";
  else rampWeeks = "~4–6 weeks";

  const rampDetail =
    overlap.matched.length > 0
      ? `Direct overlap on ${overlap.matched.slice(0, 3).join(", ")}.`
      : frac === null
        ? `No skills parsed from the query — estimate from overall evidence depth.`
        : `Limited overlap with the requested stack — expect a learning curve.`;

  // ---- Retention / flight-risk read from consistency ----
  let retentionLabel = "Newer public track record";
  let retentionDetail = "Shorter history — confirm tenure and motivation in interview.";
  if (d.consistency >= 70) {
    retentionLabel = "Sustained multi-year contributor";
    retentionDetail = "Consistent public activity — low flight-risk pattern.";
  } else if (d.consistency >= 45) {
    retentionLabel = "Steady track record";
    retentionDetail = "Reasonable continuity of public work.";
  }

  // ---- Predicted role fit ----
  const skillMatch = frac === null ? clamp(0.6 * d.evidence_depth + 0.4 * d.impact_signals) : clamp(frac * 100);
  let fit = 0.4 * skillMatch + 0.25 * d.evidence_depth + 0.2 * d.impact_signals + 0.15 * d.consistency;
  if (typeof candidate.relevance_score === "number") {
    const rel = candidate.relevance_score <= 1 ? candidate.relevance_score * 100 : candidate.relevance_score;
    fit = 0.7 * fit + 0.3 * clamp(rel);
  }
  fit = round(clamp(fit));

  const fitBreakdown: FitAxis[] = [
    { label: "Skill match", value: round(skillMatch), hint: "Requested stack vs. evidenced skills" },
    { label: "Evidence depth", value: round(d.evidence_depth), hint: "Volume of linkable public work" },
    { label: "Impact & reach", value: round(d.impact_signals), hint: "Influence of the work shipped" },
    { label: "Recent activity", value: round(d.consistency), hint: "How recently & steadily they ship" },
  ];

  // ---- "Why this candidate" brief ----
  const name = candidate.display_name || `@${candidate.handle}`;
  const employerLine =
    ctx.parsedQuery?.employers && ctx.parsedQuery.employers.length > 0
      ? ` for a ${ctx.parsedQuery.employers[0]}-style team`
      : "";
  const skillLine =
    overlap.matched.length > 0
      ? `Evidenced strength in ${overlap.matched.slice(0, 3).join(", ")}`
      : `Strongest in ${topDim.label}`;
  const brief = [
    `${name} reads as a ${trajectoryLabel.toLowerCase()} with ${candidate.evidence_count} linked evidence items.`,
    `${skillLine}. Predicted ${fit}% fit${employerLine}, ready to contribute in ${rampWeeks}.`,
    retentionDetail,
  ].join(" ");

  // ---- Interview questions grounded in real evidence ----
  const questions: string[] = [];
  const topCap = (candidate.capabilities ?? [])
    .slice()
    .sort((a, b) => b.evidence_count - a.evidence_count)[0];
  if (topCap) {
    questions.push(
      `You have ${topCap.evidence_count > 0 ? `${topCap.evidence_count} evidence items in ` : "public work in "}${topCap.name} — walk me through the most technically demanding thing you built there.`,
    );
  }
  const topSignal = (candidate.matched_signals ?? [])
    .slice()
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0];
  if (topSignal) {
    questions.push(
      `Your ${topSignal.label.toLowerCase()}${topSignal.detail ? ` (${topSignal.detail})` : ""} stood out — what tradeoffs did you weigh, and what would you do differently now?`,
    );
  }
  // Gap probe: a requested skill we couldn't evidence.
  const wanted = [...(ctx.parsedQuery?.skills ?? []), ...(ctx.parsedQuery?.tools ?? [])];
  const gap = wanted.find(
    (w) => !overlap.matched.some((m) => m === w.toLowerCase() || w.toLowerCase().includes(m)),
  );
  if (gap) {
    questions.push(`We rely heavily on ${gap} — where have you applied it in production, and how deep does that go?`);
  }
  if (d.consistency < 50) {
    questions.push("Your public activity has quieter stretches — what were you shipping during those periods?");
  } else if (d.impact_signals >= 65) {
    questions.push("Your work shows strong reach — how do you decide what's worth building for impact vs. maintenance?");
  }
  const interviewQuestions = [...new Set(questions)].slice(0, 4);

  return {
    momentum,
    trajectory,
    trajectoryLabel,
    trajectoryDetail,
    spark,
    rampWeeks,
    rampDetail,
    retentionLabel,
    retentionDetail,
    fit,
    fitBreakdown,
    brief,
    interviewQuestions,
  };
}

/**
 * Shortlist foresight (feature #5): rank the whole result set by a "talk to
 * first" score and give each a distinct one-line rationale.
 */
export function buildShortlist(
  candidates: CandidateSearchResult[],
  ctx: ForesightContext = {},
): ShortlistEntry[] {
  const rows = candidates.map((c) => {
    const f = computeForesight(c, ctx);
    const talkScore = round(clamp(0.45 * f.fit + 0.3 * f.momentum + 0.25 * c.trust_score.overall));
    return { candidate: c, f, talkScore };
  });

  rows.sort((a, b) => b.talkScore - a.talkScore);

  // Superlatives so reasons stay distinct across the list.
  const bestFit = Math.max(...rows.map((r) => r.f.fit));
  const bestMomentum = Math.max(...rows.map((r) => r.f.momentum));
  const bestEvidence = Math.max(...rows.map((r) => r.candidate.evidence_count));
  const used = new Set<string>();

  return rows.map(({ candidate, f, talkScore }) => {
    let reason: string;
    if (f.fit === bestFit && !used.has("fit")) {
      used.add("fit");
      reason = `Highest predicted fit at ${f.fit}%`;
    } else if (f.momentum === bestMomentum && !used.has("momentum")) {
      used.add("momentum");
      reason = `Strongest trajectory (${f.trajectoryLabel.toLowerCase()})`;
    } else if (candidate.evidence_count === bestEvidence && !used.has("evidence")) {
      used.add("evidence");
      reason = `Deepest evidence base (${candidate.evidence_count} items)`;
    } else if (f.rampWeeks.includes("1 week") || f.rampWeeks.includes("1–2")) {
      reason = `Fastest ramp — productive in ${f.rampWeeks}`;
    } else {
      reason = `${f.fit}% fit · ${f.trajectoryLabel.toLowerCase()}`;
    }
    return {
      handle: candidate.handle,
      displayName: candidate.display_name || `@${candidate.handle}`,
      talkScore,
      reason,
    };
  });
}
