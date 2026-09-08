"use client";

import { forwardRef, useEffect, useRef } from "react";

import { SkeletonBlock } from "@/components/profile/BentoSkeleton";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type BuildStageProps = {
  children: React.ReactNode;
  revealed: boolean;
  label: string;
  active?: boolean;
  activeLabel?: string | null;
  className?: string;
};

export const BuildStage = forwardRef<HTMLDivElement, BuildStageProps>(function BuildStage(
  { children, revealed, label, active, activeLabel, className },
  ref,
) {
  const wasRevealed = useRef(revealed);

  useEffect(() => {
    const el = typeof ref === "function" ? null : ref?.current;
    if (!el) return;
    if (!wasRevealed.current && revealed) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
      );
    }
    wasRevealed.current = revealed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* While a stage is still building, collapse its real (tall) content to zero
          height and show a compact skeleton in normal flow instead. This keeps the
          whole building layout short enough that all agent cursors stay in view
          without scrolling; the content expands to full height on reveal. */}
      <div
        className={revealed ? "" : "pointer-events-none h-0 overflow-hidden opacity-0"}
        aria-hidden={!revealed}
      >
        {children}
      </div>
      {!revealed && (
        <SkeletonBlock label={label} active={active} activeLabel={activeLabel} className="min-h-[76px]" />
      )}
    </div>
  );
});
