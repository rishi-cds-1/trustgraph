"use client";

import { forwardRef, useEffect, useRef } from "react";

import { SkeletonBlock } from "@/components/profile/BentoSkeleton";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type BuildStageProps = {
  children: React.ReactNode;
  building: boolean;
  label: string;
  className?: string;
};

export const BuildStage = forwardRef<HTMLDivElement, BuildStageProps>(function BuildStage(
  { children, building, label, className },
  ref,
) {
  const wasBuilding = useRef(building);

  useEffect(() => {
    const el = typeof ref === "function" ? null : ref?.current;
    if (!el) return;
    if (wasBuilding.current && !building) {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }
    wasBuilding.current = building;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className={building ? "pointer-events-none opacity-0" : ""}>{children}</div>
      {building && (
        <div className="absolute inset-0">
          <SkeletonBlock label={label} className="h-full" />
        </div>
      )}
    </div>
  );
});
