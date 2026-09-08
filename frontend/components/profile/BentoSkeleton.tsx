"use client";

import { useEffect, useRef, useState } from "react";

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

function TypingLine({ text }: { text: string }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text]);

  return (
    <p className="mt-4 flex items-center text-[10px] font-medium uppercase tracking-wide text-teal">
      {shown}
      <span className="ml-0.5 inline-block h-2.5 w-1 animate-pulse bg-teal" />
    </p>
  );
}

export function SkeletonBlock({
  label,
  active,
  activeLabel,
  className,
}: {
  label: string;
  active?: boolean;
  activeLabel?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border bg-white p-3 transition-colors duration-300 md:p-4",
        active ? "border-teal/50 shadow-[0_0_0_1px_rgba(196,0,14,0.15)]" : "border-border",
        className,
      )}
    >
      <ShimmerBar className="mb-3 h-2 w-28" />
      <div className="space-y-2">
        <ShimmerBar className="h-2.5 w-full" />
        <ShimmerBar className="h-2.5 w-5/6" />
        <ShimmerBar className="h-2.5 w-2/3" />
      </div>
      {active && activeLabel ? (
        <TypingLine text={activeLabel} />
      ) : (
        <p className="mt-4 text-[10px] font-medium uppercase tracking-wide text-muted">{label}</p>
      )}
    </div>
  );
}
