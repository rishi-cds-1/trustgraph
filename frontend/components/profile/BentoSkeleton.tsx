"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function ShimmerBar({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.fromTo(
      ref.current,
      { backgroundPosition: "-150% 0" },
      { backgroundPosition: "150% 0", duration: 1.3, repeat: -1, ease: "sine.inOut" },
    );
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("rounded-full bg-[#EDEDED]", className)}
      style={{
        backgroundImage: "linear-gradient(90deg, #EDEDED 25%, #F8F8F8 50%, #EDEDED 75%)",
        backgroundSize: "250% 100%",
      }}
    />
  );
}

export function SkeletonBlock({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("border border-border bg-white p-3 md:p-4", className)}>
      <ShimmerBar className="mb-3 h-2 w-28" />
      <div className="space-y-2">
        <ShimmerBar className="h-2.5 w-full" />
        <ShimmerBar className="h-2.5 w-5/6" />
        <ShimmerBar className="h-2.5 w-2/3" />
      </div>
      <p className="mt-4 text-[10px] font-medium uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
