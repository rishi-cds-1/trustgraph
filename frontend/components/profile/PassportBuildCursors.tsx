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

type AgentPersona = {
  name: string;
  colors: {
    base: string;
    ring: string;
    ping: string;
    dot: string;
    dotShadow: string;
  };
  sublabels: Record<string, string[]>;
};

// Each persona's per-section script ends on the real action name; the earlier
// entries are the "thinking out loud" phrases that scramble in as it works.
const GITHUB_SUBLABELS: Record<string, string[]> = {
  "Passport hero": ["Connecting to GitHub…", "Verifying identity & headline…"],
  Stats: ["Reading public repositories…", "Tallying verified stats…"],
  "AI insight synthesis": ["Scanning commit history…", "Pulling contribution signals…"],
  Capabilities: ["Parsing repo languages…", "Mapping capabilities…"],
  "Evidence timeline": ["Walking the contribution graph…", "Assembling evidence timeline…"],
};

const WEB_SUBLABELS: Record<string, string[]> = {
  "Passport hero": ["Searching the web…", "Cross-checking identity…"],
  Stats: ["Cross-referencing LinkedIn…", "Confirming the numbers…"],
  "AI insight synthesis": ["Checking Stack Overflow…", "Gathering public mentions…"],
  Capabilities: ["Searching public mentions…", "Corroborating skills…"],
  "Evidence timeline": ["Indexing evidence sources…", "Dating each event…"],
};

const AI_SUBLABELS: Record<string, string[]> = {
  "Passport hero": ["Reading profile signals…", "Composing headline…"],
  Stats: ["Weighing contribution volume…", "Scoring the stats…"],
  "AI insight synthesis": ["Reasoning over evidence…", "Synthesizing AI insight…"],
  Capabilities: ["Clustering skills…", "Ranking capabilities…"],
  "Evidence timeline": ["Ordering by recency…", "Threading the timeline…"],
};

// Green = GitHub side, sky = wider web, violet = the reasoning agent. They fan
// out across the passport sections in parallel like a Figma multiplayer room.
const AGENTS: AgentPersona[] = [
  {
    name: "GitHub agent",
    colors: {
      base: "#FF0211",
      ring: "border-[#FF0211]/50",
      ping: "bg-[#FF0211]/45",
      dot: "bg-[#FF0211]",
      dotShadow: "shadow-[0_0_16px_3px_rgba(255,2,17,0.5)]",
    },
    sublabels: GITHUB_SUBLABELS,
  },
  {
    name: "Web crawler",
    colors: {
      base: "#00A9E0",
      ring: "border-[#00A9E0]/50",
      ping: "bg-[#00A9E0]/45",
      dot: "bg-[#00A9E0]",
      dotShadow: "shadow-[0_0_16px_3px_rgba(0,169,224,0.5)]",
    },
    sublabels: WEB_SUBLABELS,
  },
  {
    name: "Synthesizer",
    colors: {
      base: "#F5197A",
      ring: "border-[#F5197A]/50",
      ping: "bg-[#F5197A]/45",
      dot: "bg-[#F5197A]",
      dotShadow: "shadow-[0_0_16px_3px_rgba(245,25,122,0.5)]",
    },
    sublabels: AI_SUBLABELS,
  },
];

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
  // How many agents actually take part — never more than there are sections.
  const agentCount = Math.min(AGENTS.length, Math.max(stages.length, 1));

  const [cursorIndex, setCursorIndex] = useState<(number | null)[]>(() =>
    Array(agentCount).fill(null),
  );
  const [cursorSub, setCursorSub] = useState<(string | null)[]>(() =>
    Array(agentCount).fill(null),
  );
  const progressRef = useRef<HTMLDivElement>(null);
  const revealedCount = useRef(0);
  const finishedCursors = useRef(0);
  const done = useRef(false);

  const setIndexAt = (i: number, val: number | null) =>
    setCursorIndex((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  const setSubAt = (i: number, val: string | null) =>
    setCursorSub((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });

  useEffect(() => {
    const active: ActiveStage[] = [];
    cursorIndex.forEach((idx, i) => {
      if (idx === null) return;
      active.push({
        index: idx,
        label: cursorSub[i] ?? subLabelsFor(AGENTS[i].sublabels, stages[idx].label)[0],
      });
    });
    onActiveChange(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorIndex, cursorSub]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || stages.length === 0) {
      stages.forEach((_, i) => onStageRevealed(i));
      onComplete();
      return;
    }

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Round-robin the sections across the agents so they work simultaneously.
    const lists: number[][] = Array.from({ length: agentCount }, () => []);
    stages.forEach((_, i) => lists[i % agentCount].push(i));

    const totalTargetMs = MIN_TOTAL_MS + Math.random() * (MAX_TOTAL_MS - MIN_TOTAL_MS);
    const longerLen = Math.max(...lists.map((l) => l.length), 1);
    const perStepMs = totalTargetMs / longerLen;
    const travelMs = clamp(perStepMs * 0.28, 450, 900);
    const gapMs = clamp(perStepMs * 0.08, 100, 220);
    const dwellMs = Math.max(perStepMs - travelMs - gapMs, 900);

    const activeLists = lists.filter((l) => l.length > 0).length;

    function finishCursor() {
      finishedCursors.current += 1;
      if (finishedCursors.current >= activeLists && !done.current) {
        done.current = true;
        onComplete();
      }
    }

    function runList(cursorId: number, list: number[]) {
      const subLabelMap = AGENTS[cursorId].sublabels;
      let pos = 0;
      // A touch of per-cursor jitter so the agents don't move in lockstep.
      const jitter = () => gsap.utils.random(-90, 90);

      function step() {
        if (cancelled) return;
        if (pos >= list.length) {
          setIndexAt(cursorId, null);
          setSubAt(cursorId, null);
          finishCursor();
          return;
        }
        const idx = list[pos];
        setIndexAt(cursorId, idx);
        const subLabels = subLabelsFor(subLabelMap, stages[idx].label);
        setSubAt(cursorId, subLabels[0]);

        const perSub = dwellMs / subLabels.length;
        subLabels.forEach((text, i) => {
          if (i === 0) return;
          timeouts.push(
            setTimeout(() => {
              if (!cancelled) setSubAt(cursorId, text);
            }, travelMs + i * perSub),
          );
        });

        timeouts.push(
          setTimeout(
            () => {
              if (cancelled) return;
              onStageRevealed(idx);
              revealedCount.current += 1;
              if (progressRef.current) {
                const pct = Math.min((revealedCount.current / stages.length) * 100, 100);
                gsap.to(progressRef.current, { width: `${pct}%`, duration: 0.4, ease: "power2.out" });
              }
              pos += 1;
              timeouts.push(setTimeout(step, gapMs));
            },
            Math.max(travelMs + dwellMs + jitter(), 700),
          ),
        );
      }
      step();
    }

    lists.forEach((list, cursorId) => {
      if (list.length > 0) runList(cursorId, list);
    });

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-border">
        <div ref={progressRef} className="h-full w-0 bg-teal" />
      </div>
      <div className="fixed left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-teal/15 bg-white px-4 py-1.5 shadow-md">
        <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
        <p className="text-xs font-medium text-teal">
          {agentCount} agents assembling {displayName}&apos;s passport from public evidence…
        </p>
      </div>

      {Array.from({ length: agentCount }).map((_, i) => {
        const idx = cursorIndex[i];
        const stage = idx !== null ? stages[idx] : null;
        const agent = AGENTS[i];
        return (
          <AgentCursor
            key={i}
            name={agent.name}
            colors={agent.colors}
            stage={
              stage
                ? {
                    label: cursorSub[i] ?? subLabelsFor(agent.sublabels, stage.label)[0],
                    targetRef: stage.ref,
                  }
                : null
            }
          />
        );
      })}
    </>
  );
}
