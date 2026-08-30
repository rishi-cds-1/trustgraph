"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

import { AgentCursor } from "@/components/evidence/AgentCursor";
import { useEvidenceFlow } from "@/components/evidence/EvidenceFlowProvider";
import { LottiePlayer } from "@/components/lottie/LottiePlayer";
import { lottieAssets } from "@/constants/lottie";
import { CONSENT_COPY, DEFAULT_SNAPSHOT_HANDLE, PROGRESS_STEPS } from "@/constants/evidence";
import { AnalyzeRequestError, api, type AnalyzeErrorType } from "@/lib/api";

const AGENTS = [
  { name: "Repo Agent", color: "#0D9488" },
  { name: "Evidence Agent", color: "#3FA828" },
  { name: "Interview Agent", color: "#1D4ED8" },
] as const;

const ERROR_MESSAGES: Record<AnalyzeErrorType, string> = {
  not_found: "We couldn't find a public GitHub profile for that username.",
  timeout: "The analysis is taking longer than expected and timed out.",
  rate_limited: "GitHub rate limits were hit while gathering evidence.",
  private_or_empty: "This GitHub profile is private or has no public activity to analyze.",
};

const FALLBACK_COPY =
  "GitHub is temporarily unavailable. Continue using a previously captured public snapshot?";

export default function EvidenceAnalyzePage() {
  const router = useRouter();
  const { role, setBrief, setLastUsername } = useEvidenceFlow();

  const [username, setUsername] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<{
    type?: AnalyzeErrorType;
    message: string;
    snapshotHandle: string;
  } | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }[]>(
    AGENTS.map(() => ({ x: 0, y: 0 })),
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const stage = stageRef.current;
    if (!stage) return;
    const stageRect = stage.getBoundingClientRect();
    const targetSteps = [
      stepIndex,
      Math.min(stepIndex + 1, PROGRESS_STEPS.length - 1),
      Math.max(stepIndex - 1, 0),
    ];
    const next = targetSteps.map((idx, i) => {
      const el = itemRefs.current[idx];
      if (!el) return cursorPos[i] ?? { x: 0, y: 0 };
      const itemRect = el.getBoundingClientRect();
      return {
        x: itemRect.right - stageRect.left - 46 + i * 16,
        y: itemRect.top - stageRect.top + itemRect.height / 2 - 8 + (i % 2 === 0 ? -6 : 6),
      };
    });
    setCursorPos(next);
    // Re-run only when the simulated step advances or loading starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, loading]);

  function startProgressSimulation() {
    setStepIndex(0);
    let i = 0;
    timerRef.current = setInterval(
      () => {
        i += 1;
        // Cap the simulated advance at step 4 (index 3) until the real
        // response resolves — step 5 is only shown once the brief is ready.
        setStepIndex((prev) => (i < PROGRESS_STEPS.length ? i : prev));
        if (i >= PROGRESS_STEPS.length - 1 && timerRef.current) {
          clearInterval(timerRef.current);
        }
      },
      1500 + Math.random() * 1000,
    );
  }

  function stopProgressSimulation() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || !consent) return;

    setError(null);
    setLoading(true);
    startProgressSimulation();

    try {
      const brief = await api.analyzeForRole(trimmed, role, consent);
      stopProgressSimulation();
      setStepIndex(PROGRESS_STEPS.length - 1);
      setLastUsername(trimmed);
      setBrief(brief);
      window.setTimeout(() => router.push("/evidence/brief"), 500);
    } catch (err) {
      stopProgressSimulation();
      setLoading(false);
      if (err instanceof AnalyzeRequestError) {
        const type = err.payload.error_type;
        const snapshotHandle = err.payload.snapshot_handle || DEFAULT_SNAPSHOT_HANDLE;
        const baseMessage = type
          ? ERROR_MESSAGES[type]
          : err.payload.message || err.payload.error || "The analysis could not be completed.";
        setError({ type, message: baseMessage, snapshotHandle });
      } else {
        setError({
          message: "The analysis could not be completed.",
          snapshotHandle: DEFAULT_SNAPSHOT_HANDLE,
        });
      }
    }
  }

  async function loadSnapshotBrief(handle: string) {
    setSnapshotLoading(true);
    try {
      const snapshot = await api.getSnapshotBrief(handle);
      setBrief(snapshot);
      router.push("/evidence/brief");
    } catch {
      setError({
        message: "Could not load the saved snapshot either. Please try again shortly.",
        snapshotHandle: handle,
      });
    } finally {
      setSnapshotLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal">
        Step 2 of 4 — Consent and analysis
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
        Analyze a public GitHub profile
      </h1>
      <p className="mt-3 text-[var(--text-secondary)]">
        Preparing evidence for <span className="font-medium text-[var(--text-primary)]">{role.title}</span>.
      </p>

      {!loading && (
        <form onSubmit={handleSubmit} className="mt-8 card-surface p-6 md:p-8">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            GitHub username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. rishicds"
            autoComplete="off"
            spellCheck={false}
            className="mt-2 w-full rounded-[14px] border border-border px-4 py-3 text-sm outline-none focus:border-teal"
          />

          <ul className="mt-5 space-y-2">
            {CONSENT_COPY.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={2.5} />
                {bullet}
              </li>
            ))}
          </ul>

          <label className="mt-5 flex items-start gap-3 rounded-[14px] border border-border bg-[var(--bg-surface-secondary)] p-4 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-teal"
            />
            <span className="text-[var(--text-secondary)]">{CONSENT_COPY.checkbox}</span>
          </label>

          <button
            type="submit"
            disabled={!username.trim() || !consent}
            className="mt-6 inline-flex w-full items-center justify-center rounded-[14px] bg-accent px-7 py-3.5 text-sm font-medium text-[#111111] shadow-[var(--shadow-green)] transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Analyze public evidence
          </button>

          <button
            type="button"
            onClick={() => loadSnapshotBrief(DEFAULT_SNAPSHOT_HANDLE)}
            disabled={snapshotLoading}
            className="mt-3 w-full text-center text-xs font-medium text-teal underline-offset-4 hover:underline disabled:opacity-50"
          >
            {snapshotLoading ? "Loading saved snapshot…" : "Use a saved snapshot instead"}
          </button>
        </form>
      )}

      {loading && (
        <div ref={stageRef} className="relative mt-8 card-surface p-6 md:p-8">
          {cursorPos.map((pos, i) => (
            <AgentCursor
              key={AGENTS[i].name}
              name={AGENTS[i].name}
              color={AGENTS[i].color}
              x={pos.x}
              y={pos.y}
              pulse={i === 0}
            />
          ))}

          <div className="flex items-center gap-3">
            <LottiePlayer
              src={lottieAssets.onboardingEvidence}
              loop
              style={{ width: 56, height: 56 }}
            />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Preparing evidence for @{username.trim()}…
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Agents are reading public repositories in real time.
              </p>
            </div>
          </div>
          <ul className="mt-6 space-y-3">
            {PROGRESS_STEPS.map((step, i) => (
              <li
                key={step}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="flex items-center gap-3 text-sm"
              >
                <span
                  className={
                    i < stepIndex
                      ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[#2d5016]"
                      : i === stepIndex
                        ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-teal"
                        : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border"
                  }
                >
                  {i < stepIndex ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                </span>
                <span
                  className={
                    i <= stepIndex
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-muted)]"
                  }
                >
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-[20px] border border-[#FDE68A] bg-[#FFFBEB] p-6">
          <p className="text-sm font-medium text-[#92400E]">{error.message}</p>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{FALLBACK_COPY}</p>
          <button
            type="button"
            onClick={() => loadSnapshotBrief(error.snapshotHandle)}
            disabled={snapshotLoading}
            className="mt-4 inline-flex items-center justify-center rounded-[14px] bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:opacity-50"
          >
            {snapshotLoading ? "Loading…" : "Continue with saved snapshot"}
          </button>
        </div>
      )}
    </div>
  );
}
