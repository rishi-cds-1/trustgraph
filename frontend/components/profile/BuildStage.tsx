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
      <div className={revealed ? "" : "pointer-events-none opacity-0"}>{children}</div>
      {!revealed && (
        <div className="absolute inset-0">
          <SkeletonBlock label={label} active={active} activeLabel={activeLabel} className="h-full" />
        </div>
      )}
    </div>
  );
});
