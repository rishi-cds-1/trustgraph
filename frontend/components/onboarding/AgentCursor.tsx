"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type CursorStage = {
  label: string;
  targetRef: React.RefObject<HTMLElement | null>;
};

type AgentCursorColors = {
  /** Solid brand color (hex/rgb) used for the pointer arrow, name tag and glow. */
  base: string;
  ring: string;
  ping: string;
  dot: string;
  dotShadow: string;
};

const DEFAULT_COLORS: AgentCursorColors = {
  base: "#FF0211",
  ring: "border-[#FF0211]/40",
  ping: "bg-[#FF0211]/50",
  dot: "bg-[#FF0211]",
  dotShadow: "shadow-[0_0_16px_3px_rgba(255,2,17,0.5)]",
};

export function AgentCursor({
  stage,
  colors,
  name,
}: {
  stage: CursorStage | null;
  colors?: Partial<AgentCursorColors>;
  /** Optional Figma-style name tag shown next to the pointer. */
  name?: string;
}) {
  const c = { ...DEFAULT_COLORS, ...colors };
  const rootRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
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

    // Subtle idle wander so the cursor always feels "alive," like a real
    // teammate's pointer. Runs on an inner element so it never fights the
    // quickTo travel driving the root.
    const drift = gsap.to(driftRef.current, {
      x: () => gsap.utils.random(-5, 5),
      y: () => gsap.utils.random(-5, 5),
      rotate: () => gsap.utils.random(-4, 4),
      duration: 1.6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
    });

    return () => {
      spin.kill();
      drift.kill();
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

    // "Click"/arrival ripple each time the cursor lands on a new section.
    if (rippleRef.current) {
      gsap.fromTo(
        rippleRef.current,
        { scale: 0.3, opacity: 0.55 },
        { scale: 2.4, opacity: 0, duration: 0.9, ease: "power2.out" },
      );
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
      <div ref={driftRef} className="relative">
        {/* Focus point that the pointer's tip sits on */}
        <span
          ref={rippleRef}
          className="absolute -left-1 -top-1 inline-flex h-6 w-6 rounded-full"
          style={{ backgroundColor: c.base, opacity: 0 }}
        />
        <div
          ref={ringRef}
          className={cn(
            "absolute -left-4 -top-4 h-10 w-10 rounded-full border border-dashed opacity-70",
            c.ring,
          )}
        />
        <span className={cn("absolute -left-1 -top-1 inline-flex h-4 w-4 animate-ping rounded-full", c.ping)} />

        {/* Figma-style pointer arrow — tip anchored at the target point */}
        <svg
          width="22"
          height="24"
          viewBox="0 0 22 24"
          fill="none"
          className="relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
          aria-hidden
        >
          <path
            d="M2 1.5 L2 18.5 L6.6 14.2 L9.7 21.5 L12.9 20 L9.8 12.8 L16 12.6 Z"
            fill={c.base}
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>

        {/* Name tag riding just off the pointer, Figma multiplayer style */}
        {name && (
          <div
            className="absolute left-4 top-4 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-md"
            style={{ backgroundColor: c.base }}
          >
            {name}
          </div>
        )}

        {/* Live "thinking" status, animated in with a scramble effect */}
        <div
          ref={labelRef}
          className="absolute left-3 top-11 whitespace-nowrap rounded-full bg-[#111111] px-3 py-1 text-[11px] font-medium text-white shadow-lg"
        />
      </div>
    </div>
  );
}
