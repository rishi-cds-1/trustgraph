"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type CursorStage = {
  label: string;
  targetRef: React.RefObject<HTMLElement | null>;
};

type AgentCursorColors = {
  ring: string;
  ping: string;
  dot: string;
  dotShadow: string;
};

const DEFAULT_COLORS: AgentCursorColors = {
  ring: "border-teal/40",
  ping: "bg-teal/50",
  dot: "bg-teal",
  dotShadow: "shadow-[0_0_16px_3px_rgba(15,110,104,0.55)]",
};

export function AgentCursor({
  stage,
  colors,
}: {
  stage: CursorStage | null;
  colors?: Partial<AgentCursorColors>;
}) {
  const c = { ...DEFAULT_COLORS, ...colors };
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const revealed = useRef(false);

  useEffect(() => {
    if (!rootRef.current) return;
    quickX.current = gsap.quickTo(rootRef.current, "x", { duration: 0.65, ease: "power3.out" });
    quickY.current = gsap.quickTo(rootRef.current, "y", { duration: 0.65, ease: "power3.out" });

    const spin = gsap.to(ringRef.current, {
      rotate: 360,
      duration: 6,
      repeat: -1,
      ease: "none",
    });
    return () => {
      spin.kill();
    };
  }, []);

  useEffect(() => {
    const el = stage?.targetRef.current;
    if (!el || !rootRef.current) {
      if (revealed.current) {
        gsap.to(rootRef.current, { opacity: 0, scale: 0.6, duration: 0.35, ease: "power2.in" });
        revealed.current = false;
      }
      return;
    }

    const measure = () => {
      const rect = el.getBoundingClientRect();
      quickX.current?.(rect.left + rect.width / 2);
      quickY.current?.(rect.top + rect.height / 2);
    };

    measure();
    if (!revealed.current) {
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)" },
      );
      revealed.current = true;
    }

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [stage]);

  useEffect(() => {
    if (!stage || !labelRef.current) return;
    gsap.to(labelRef.current, {
      duration: 0.7,
      scrambleText: {
        text: stage.label,
        chars: "upperAndLowerCase",
        revealDelay: 0.12,
        speed: 0.45,
      },
      ease: "none",
    });
  }, [stage]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed left-0 top-0 z-50 will-change-transform"
      style={{ opacity: 0 }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div
          ref={ringRef}
          className={cn("absolute -inset-3 rounded-full border border-dashed", c.ring)}
        />
        <span className={cn("absolute inline-flex h-4 w-4 animate-ping rounded-full", c.ping)} />
        <span className={cn("relative flex h-4 w-4 rounded-full", c.dot, c.dotShadow)} />
        <div
          ref={labelRef}
          className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#111111] px-3 py-1 text-[11px] font-medium text-white shadow-lg"
        />
      </div>
    </div>
  );
}
