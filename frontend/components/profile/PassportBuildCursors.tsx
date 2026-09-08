"use client";

import { useEffect, useRef, useState } from "react";

import { AgentCursor } from "@/components/onboarding/AgentCursor";
import { gsap } from "@/lib/gsap";

type StageRef = React.RefObject<HTMLElement | null>;

const CURSOR_A_STAGES = [
  "Reading GitHub repositories…",
  "Verifying commit history…",
  "Compiling capabilities…",
];

const CURSOR_B_STAGES = [
  "Cross-referencing LinkedIn…",
  "Scanning Stack Overflow activity…",
  "Assembling evidence timeline…",
];

const STAGE_INTERVAL_MS = 1500;
const TOTAL_STAGES = Math.max(CURSOR_A_STAGES.length, CURSOR_B_STAGES.length);

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

function pickRef(refs: StageRef[], index: number): StageRef | null {
  if (refs.length === 0) return null;
  return refs[index % refs.length];
}

export function PassportBuildCursors({
  refs,
  displayName,
  onComplete,
}: {
  refs: StageRef[];
  displayName: string;
  onComplete: () => void;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      onComplete();
      return;
    }
    if (refs.length === 0) {
      onComplete();
      return;
    }

    const id = setInterval(() => {
      setStageIndex((i) => {
        const next = i + 1;
        if (next >= TOTAL_STAGES) {
          clearInterval(id);
          if (!done.current) {
            done.current = true;
            onComplete();
          }
          return i;
        }
        return next;
      });
    }, STAGE_INTERVAL_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!progressRef.current) return;
    const pct = Math.min(((stageIndex + 1) / TOTAL_STAGES) * 100, 100);
    gsap.to(progressRef.current, { width: `${pct}%`, duration: 0.5, ease: "power2.out" });
  }, [stageIndex]);

  const targetA = pickRef(refs, stageIndex * 2);
  const targetB = pickRef(refs, stageIndex * 2 + 1);

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
          targetA
            ? { label: CURSOR_A_STAGES[stageIndex % CURSOR_A_STAGES.length], targetRef: targetA }
            : null
        }
        colors={CURSOR_A_COLORS}
      />
      <AgentCursor
        stage={
          targetB
            ? { label: CURSOR_B_STAGES[stageIndex % CURSOR_B_STAGES.length], targetRef: targetB }
            : null
        }
        colors={CURSOR_B_COLORS}
      />
    </>
  );
}
