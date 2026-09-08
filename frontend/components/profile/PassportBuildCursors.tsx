"use client";

import { useEffect, useRef, useState } from "react";

import { AgentCursor } from "@/components/onboarding/AgentCursor";
import { gsap } from "@/lib/gsap";

export type BuildTargetStage = {
  ref: React.RefObject<HTMLElement | null>;
  label: string;
};

type ActiveStage = { index: number; label: string };

const TRAVEL_MS = 700;
const DWELL_MS = 850;
const GAP_MS = 150;

const CURSOR_A_COLORS = {
  ring: "border-accent/50",
  ping: "bg-accent/50",
  dot: "bg-accent",
  dotShadow: "shadow-[0_0_16px_3px_rgba(123,225,59,0.55)]",
};

const CURSOR_B_COLORS = {
  ring: "border-sky-400/50",
  ping: "bg-sky-400/50",
  dot: "bg-sky-400",
  dotShadow: "shadow-[0_0_16px_3px_rgba(56,189,248,0.55)]",
};

function actionLabelFor(sectionLabel: string): string {
  const map: Record<string, string> = {
    "Passport hero": "Verifying identity & headline…",
    Stats: "Tallying verified stats…",
    "AI insight synthesis": "Synthesizing AI insight…",
    Capabilities: "Mapping capabilities…",
    "Evidence timeline": "Assembling evidence timeline…",
  };
  return map[sectionLabel] ?? `Placing ${sectionLabel.toLowerCase()}…`;
}

export function PassportBuildCursors({
  stages,
  displayName,
  onStageRevealed,
  onActiveChange,
  onComplete,
}: {
  stages: BuildTargetStage[];
  displayName: string;
  onStageRevealed: (index: number) => void;
  onActiveChange: (active: ActiveStage[]) => void;
  onComplete: () => void;
}) {
  const [cursorAIndex, setCursorAIndex] = useState<number | null>(null);
  const [cursorBIndex, setCursorBIndex] = useState<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const revealedCount = useRef(0);
  const finishedCursors = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    const active: ActiveStage[] = [];
    if (cursorAIndex !== null) {
      active.push({ index: cursorAIndex, label: actionLabelFor(stages[cursorAIndex].label) });
    }
    if (cursorBIndex !== null) {
      active.push({ index: cursorBIndex, label: actionLabelFor(stages[cursorBIndex].label) });
    }
    onActiveChange(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorAIndex, cursorBIndex]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || stages.length === 0) {
      stages.forEach((_, i) => onStageRevealed(i));
      onComplete();
      return;
    }

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const listA = stages.map((_, i) => i).filter((i) => i % 2 === 0);
    const listB = stages.map((_, i) => i).filter((i) => i % 2 === 1);

    function finishCursor() {
      finishedCursors.current += 1;
      if (finishedCursors.current >= 2 && !done.current) {
        done.current = true;
        onComplete();
      }
    }

    function runList(list: number[], setIndex: (i: number | null) => void) {
      let pos = 0;
      function step() {
        if (cancelled) return;
        if (pos >= list.length) {
          setIndex(null);
          finishCursor();
          return;
        }
        const idx = list[pos];
        setIndex(idx);
        timeouts.push(
          setTimeout(() => {
            if (cancelled) return;
            onStageRevealed(idx);
            revealedCount.current += 1;
            if (progressRef.current) {
              const pct = Math.min((revealedCount.current / stages.length) * 100, 100);
              gsap.to(progressRef.current, { width: `${pct}%`, duration: 0.4, ease: "power2.out" });
            }
            pos += 1;
            timeouts.push(setTimeout(step, GAP_MS));
          }, TRAVEL_MS + DWELL_MS),
        );
      }
      step();
    }

    if (listA.length > 0) runList(listA, setCursorAIndex);
    else finishCursor();
    if (listB.length > 0) runList(listB, setCursorBIndex);
    else finishCursor();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageA = cursorAIndex !== null ? stages[cursorAIndex] : null;
  const stageB = cursorBIndex !== null ? stages[cursorBIndex] : null;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-border">
        <div ref={progressRef} className="h-full w-0 bg-teal" />
      </div>
      <div className="fixed left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-teal/15 bg-white px-4 py-1.5 shadow-md">
        <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
        <p className="text-xs font-medium text-teal">
          Assembling {displayName}&apos;s passport from public evidence…
        </p>
      </div>

      <AgentCursor
        stage={stageA ? { label: actionLabelFor(stageA.label), targetRef: stageA.ref } : null}
        colors={CURSOR_A_COLORS}
      />
      <AgentCursor
        stage={stageB ? { label: actionLabelFor(stageB.label), targetRef: stageB.ref } : null}
        colors={CURSOR_B_COLORS}
      />
    </>
  );
}
