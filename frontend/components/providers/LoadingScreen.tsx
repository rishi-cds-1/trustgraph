"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";

import { gsap } from "@/lib/gsap";

const SESSION_KEY = "tg-intro-seen";

// Three evidence nodes (Mercari brand trio) that draw edges into a central
// core — the "trust graph" assembling itself. Node coords in a 0..200 viewBox.
const NODES = [
  { x: 100, y: 26, color: "#FF0211" }, // red   — code
  { x: 30, y: 150, color: "#00A9E0" }, // cyan  — web
  { x: 170, y: 150, color: "#F5197A" }, // magenta — synthesis
] as const;

export function LoadingScreen() {
  const root = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const overlay = root.current;
      if (!overlay) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let seen = false;
      try {
        seen = sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {
        seen = false;
      }

      // Already shown this session, or motion is off → get out of the way fast.
      if (seen || reduce) {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: reduce ? 0.25 : 0,
          onComplete: () => setDone(true),
        });
        return;
      }

      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }

      const counter = { v: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setDone(true),
      });

      // Central core blooms in.
      tl.from(".ls-core", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)" })
        // Edges draw from each node toward the core.
        .to(".ls-edge", { strokeDashoffset: 0, duration: 0.6, stagger: 0.12 }, "-=0.2")
        // Nodes pop on as their edge lands.
        .from(
          ".ls-node",
          { scale: 0, transformOrigin: "center", duration: 0.45, stagger: 0.12, ease: "back.out(2.4)" },
          "<0.1",
        )
        // Wordmark rises.
        .from(".ls-word", { y: 18, opacity: 0, duration: 0.5 }, "-=0.2")
        .to(
          ".ls-word-scramble",
          { duration: 0.7, scrambleText: { text: "TrustGraph", chars: "01<>/\\{}#", speed: 0.5 } },
          "<",
        )
        .from(".ls-tag", { opacity: 0, y: 8, duration: 0.4 }, "-=0.35")
        // Progress bar + counter run together.
        .to(".ls-bar-fill", { scaleX: 1, duration: 1.05, ease: "power1.inOut" }, "-=0.5")
        .to(
          counter,
          {
            v: 100,
            duration: 1.05,
            ease: "power1.inOut",
            onUpdate: () => {
              if (counterRef.current) {
                counterRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
              }
            },
          },
          "<",
        )
        // Hold a beat, then wipe the panel up to reveal the site.
        .to(".ls-stage", { scale: 1.06, opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.15")
        .to(overlay, { yPercent: -100, duration: 0.75, ease: "power4.inOut" }, "-=0.15");
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0a0a0b]"
      aria-hidden
    >
      {/* soft brand glow behind the stage */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,2,17,0.22), rgba(245,25,122,0.10) 45%, transparent 70%)",
        }}
      />

      <div className="ls-stage relative flex flex-col items-center px-6">
        {/* trust graph assembling */}
        <svg viewBox="0 0 200 200" className="h-40 w-40 sm:h-48 sm:w-48" role="img" aria-label="TrustGraph">
          {NODES.map((n, i) => (
            <line
              key={`edge-${i}`}
              className="ls-edge"
              x1={n.x}
              y1={n.y}
              x2={100}
              y2={100}
              stroke={n.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={200}
              strokeDashoffset={200}
              opacity={0.85}
            />
          ))}
          {NODES.map((n, i) => (
            <g key={`node-${i}`} className="ls-node">
              <circle cx={n.x} cy={n.y} r={12} fill={n.color} opacity={0.18} />
              <circle cx={n.x} cy={n.y} r={6.5} fill={n.color} />
            </g>
          ))}
          {/* core */}
          <g className="ls-core">
            <circle cx={100} cy={100} r={20} fill="#FF0211" opacity={0.16} />
            <circle cx={100} cy={100} r={11} fill="#FF0211" />
            <circle cx={100} cy={100} r={4.5} fill="#fff" opacity={0.9} />
          </g>
        </svg>

        {/* wordmark */}
        <div className="ls-word mt-6 text-center">
          <span className="ls-word-scramble font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            TrustGraph
          </span>
        </div>
        <p className="ls-tag mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">
          Assembling evidence
        </p>

        {/* progress */}
        <div className="mt-8 flex w-56 items-center gap-3 sm:w-64">
          <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="ls-bar-fill absolute inset-0 origin-left rounded-full"
              style={{
                transform: "scaleX(0)",
                background: "linear-gradient(90deg,#FF0211,#F5197A,#00A9E0)",
              }}
            />
          </div>
          <span className="font-mono text-[11px] tabular-nums text-white/55">
            <span ref={counterRef}>000</span>
          </span>
        </div>
      </div>
    </div>
  );
}
