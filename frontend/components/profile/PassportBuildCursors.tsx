"use client";

import { useEffect, useRef, useState } from "react";

import { AgentCursor } from "@/components/onboarding/AgentCursor";
import { gsap } from "@/lib/gsap";

export type BuildTargetStage = {
  ref: React.RefObject<HTMLElement | null>;
  label: string;
};

type ActiveStage = { index: number; label: string };

const MIN_TOTAL_MS = 5200;
const MAX_TOTAL_MS = 7800;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

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

// Cursor A reads as "working the GitHub side"; cursor B reads as "searching the
// wider web." Each list's final entry is the section's real action name.
const CURSOR_A_SUBLABELS: Record<string, string[]> = {
  "Passport hero": ["Connecting to GitHub…", "Verifying identity & headline…"],
  Stats: ["Reading public repositories…", "Tallying verified stats…"],
  "AI insight synthesis": ["Scanning commit history…", "Synthesizing AI insight…"],
  Capabilities: ["Parsing repo languages…", "Mapping capabilities…"],
  "Evidence timeline": ["Walking the contribution graph…", "Assembling evidence timeline…"],
};

const CURSOR_B_SUBLABELS: Record<string, string[]> = {
  "Passport hero": ["Searching the web…", "Verifying identity & headline…"],
  Stats: ["Cross-referencing LinkedIn…", "Tallying verified stats…"],
  "AI insight synthesis": ["Checking Stack Overflow…", "Synthesizing AI insight…"],
  Capabilities: ["Searching public mentions…", "Mapping capabilities…"],
  "Evidence timeline": ["Indexing evidence sources…", "Assembling evidence timeline…"],
};

function subLabelsFor(map: Record<string, string[]>, sectionLabel: string): string[] {
  return map[sectionLabel] ?? ["Searching for evidence…", `Placing ${sectionLabel.toLowerCase()}…`];
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
  const [subLabelA, setSubLabelA] = useState<string | null>(null);
  const [subLabelB, setSubLabelB] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const revealedCount = useRef(0);
  const finishedCursors = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    const active: ActiveStage[] = [];
    if (cursorAIndex !== null) {
      active.push({
        index: cursorAIndex,
        label: subLabelA ?? subLabelsFor(CURSOR_A_SUBLABELS, stages[cursorAIndex].label)[0],
      });
    }
    if (cursorBIndex !== null) {
      active.push({
        index: cursorBIndex,
        label: subLabelB ?? subLabelsFor(CURSOR_B_SUBLABELS, stages[cursorBIndex].label)[0],
      });
    }
    onActiveChange(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorAIndex, cursorBIndex, subLabelA, subLabelB]);

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

    const totalTargetMs = MIN_TOTAL_MS + Math.random() * (MAX_TOTAL_MS - MIN_TOTAL_MS);
    const longerLen = Math.max(listA.length, listB.length, 1);
    const perStepMs = totalTargetMs / longerLen;
    const travelMs = clamp(perStepMs * 0.28, 450, 900);
    const gapMs = clamp(perStepMs * 0.08, 100, 220);
    const dwellMs = Math.max(perStepMs - travelMs - gapMs, 900);

    function finishCursor() {
      finishedCursors.current += 1;
      if (finishedCursors.current >= 2 && !done.current) {
        done.current = true;
        onComplete();
      }
    }

    function runList(
      list: number[],
      setIndex: (i: number | null) => void,
      setSubLabel: (label: string | null) => void,
      subLabelMap: Record<string, string[]>,
    ) {
      let pos = 0;
      function step() {
        if (cancelled) return;
        if (pos >= list.length) {
          setIndex(null);
          setSubLabel(null);
          finishCursor();
          return;
        }
        const idx = list[pos];
        setIndex(idx);
        const subLabels = subLabelsFor(subLabelMap, stages[idx].label);
        setSubLabel(subLabels[0]);

        const perSub = dwellMs / subLabels.length;
        subLabels.forEach((text, i) => {
          if (i === 0) return;
          timeouts.push(
            setTimeout(() => {
              if (!cancelled) setSubLabel(text);
            }, travelMs + i * perSub),
          );
        });

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
            timeouts.push(setTimeout(step, gapMs));
          }, travelMs + dwellMs),
        );
      }
      step();
    }

    if (listA.length > 0) runList(listA, setCursorAIndex, setSubLabelA, CURSOR_A_SUBLABELS);
    else finishCursor();
    if (listB.length > 0) runList(listB, setCursorBIndex, setSubLabelB, CURSOR_B_SUBLABELS);
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
        stage={
          stageA
            ? { label: subLabelA ?? subLabelsFor(CURSOR_A_SUBLABELS, stageA.label)[0], targetRef: stageA.ref }
            : null
        }
        colors={CURSOR_A_COLORS}
      />
      <AgentCursor
        stage={
          stageB
            ? { label: subLabelB ?? subLabelsFor(CURSOR_B_SUBLABELS, stageB.label)[0], targetRef: stageB.ref }
            : null
        }
        colors={CURSOR_B_COLORS}
      />
    </>
  );
}
