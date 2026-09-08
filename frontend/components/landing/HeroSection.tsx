"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { HeroGitHubPreview } from "@/components/landing/HeroGitHubPreview";
import { HeroVideoBackground } from "@/components/landing/HeroVideoBackground";
import { routes } from "@/constants/routes";
import { heroContent, stats } from "@/lib/data";
import type { LandingStat } from "@/types/trust";

function GithubMark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.84 3.13 8.94 7.47 10.39.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.04-3.04.66-3.68-1.3-3.68-1.3-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.69-1.48-2.43-.28-4.98-1.22-4.98-5.42 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.29 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.21-2.56 5.14-5 5.41.39.34.74 1 .74 2.03 0 1.47-.01 2.65-.01 3.01 0 .29.2.64.76.53 4.34-1.45 7.46-5.55 7.46-10.39C23.02 5.24 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedinMark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function StackOverflowMark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M17.36 20.2v-6.41h2.14V22.3H3.5v-8.51h2.14v6.41h11.72Zm-9.36-2.14h7.16v-2.14H8v2.14Zm.3-4.06 7-1.48-.44-2.1-7 1.48.44 2.1Zm.9-4.05 6.47-3.02-.9-1.94-6.47 3.02.9 1.94Zm1.94-3.76L15.85 2 14.2.66l-3.7 4.19 1.64 1.34ZM8 15.86h7.16v2.14H8v-2.14Z" />
    </svg>
  );
}

const iconSize: CSSProperties = {
  width: "calc(var(--trust-size) * 0.34)",
  height: "calc(var(--trust-size) * 0.34)",
};

function TrustAvatar({
  z,
  overlap,
  hoverClass,
  children,
}: {
  z: number;
  overlap: boolean;
  hoverClass: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-full border p-[5px] transition-transform duration-[350ms] ${hoverClass}`}
      style={
        {
          zIndex: z,
          width: "var(--trust-size)",
          height: "var(--trust-size)",
          background: "var(--trust-bg)",
          borderColor: "var(--trust-border)",
          marginLeft: overlap ? "calc(var(--trust-size) * -0.42)" : undefined,
        } as CSSProperties
      }
    >
      <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
        {children}
      </span>
    </span>
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function formatStat(stat: LandingStat, value: number): string {
  const n = Math.round(value);
  return `${stat.prefix ?? ""}${n.toLocaleString()}${stat.suffix ?? ""}`;
}

function StatItem({ stat, index }: { stat: LandingStat; index: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() =>
    formatStat(stat, stat.format === "text" ? stat.value : 0),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || stat.format === "text") return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(formatStat(stat, stat.value));
      return;
    }

    let raf = 0;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (started || !entries[0]?.isIntersecting) return;
        started = true;
        observer.disconnect();

        const duration = 1500 + index * 80;
        const startDelay = 480 + index * 90;
        const startTime = performance.now() + startDelay;

        const tick = (now: number) => {
          const elapsed = now - startTime;
          if (elapsed < 0) {
            raf = requestAnimationFrame(tick);
            return;
          }
          const progress = Math.min(1, elapsed / duration);
          setDisplay(formatStat(stat, stat.value * easeOutCubic(progress)));
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stat, index]);

  return (
    <div
      className="hero-anim flex flex-col items-center gap-2 text-center"
      style={{ "--d": `${0.5 + index * 0.08}s` } as CSSProperties}
    >
      <span
        className="font-display text-white"
        style={{ fontSize: "clamp(22px, 3vw, 33px)" }}
        aria-hidden
      >
        {stat.glyph}
      </span>
      <span
        ref={ref}
        className="font-display text-[clamp(18px,2.2vw,26px)] tracking-[-0.025em] text-white tabular-nums"
      >
        {display}
      </span>
      <span className="text-[clamp(11px,1.2vw,12.5px)] text-[#8e8e8e]">{stat.label}</span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero-section relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-black">
      <HeroVideoBackground className="opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-black/60" />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-8 pt-24 text-center sm:px-6 sm:pt-28">
        <div
          className="hero-trust-row hero-anim mb-6 inline-flex max-w-full flex-wrap items-center justify-center"
          style={{ "--d": "0.05s" } as CSSProperties}
        >
          <TrustAvatar z={3} overlap={false} hoverClass="hover:-translate-y-0.5">
            <GithubMark className="text-[#111111]" style={iconSize} />
          </TrustAvatar>
          <TrustAvatar z={2} overlap hoverClass="hover:-translate-y-1">
            <LinkedinMark className="text-[#0A66C2]" style={iconSize} />
          </TrustAvatar>
          <TrustAvatar z={1} overlap hoverClass="hover:-translate-y-0.5">
            <StackOverflowMark className="text-[#F48024]" style={iconSize} />
          </TrustAvatar>
          <span
            className="flex items-center whitespace-nowrap rounded-full border font-medium"
            style={{
              height: "var(--trust-size)",
              marginLeft: "calc(var(--trust-size) * -0.42)",
              paddingLeft: "calc(var(--trust-size) * 0.58)",
              paddingRight: "1rem",
              background: "var(--trust-bg)",
              borderColor: "var(--trust-border)",
              color: "var(--trust-text)",
              fontSize: "clamp(12px, 1.4vw, 13.5px)",
            }}
          >
            Verified across GitHub, LinkedIn &amp; Stack Overflow
          </span>
        </div>

        <h1
          className="hero-headline font-display mx-auto w-full min-w-0 max-w-[900px] overflow-hidden font-normal text-white"
          style={{ fontSize: "clamp(28px, 6.2vw, 80px)" }}
        >
          <span
            className="hero-headline-line block"
            style={{ "--d": "0.12s" } as CSSProperties}
          >
            {heroContent.titleLine1}
          </span>
          <span
            className="hero-headline-line block"
            style={{ "--d": "0.3s" } as CSSProperties}
          >
            {heroContent.titleLine2}
          </span>
        </h1>

        <p
          className="hero-anim mx-auto mt-6 w-full min-w-0 font-normal leading-[1.55]"
          style={
            {
              "--d": "0.28s",
              maxWidth: "min(500px, 92%)",
              fontSize: "clamp(calc(13.5px + 2pt), calc(1.55vw + 2pt), calc(16.5px + 2pt))",
              color: "rgba(208, 208, 208, 0.8)",
            } as CSSProperties
          }
        >
          {heroContent.subhead}
        </p>

        <div
          className="hero-anim-pulse mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ "--d": "0.4s" } as CSSProperties}
        >
          <Show when="signed-out">
            <Link
              href={routes.signUp}
              className="inline-flex items-center rounded-full bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_22px_rgba(255,255,255,0.32),0_0_44px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:scale-[1.02]"
              style={{
                fontWeight: 600,
                fontSize: "clamp(13.5px, 1.5vw, 14.5px)",
                padding: "clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px)",
              }}
            >
              {heroContent.claimCta}
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href={routes.dashboard}
              className="inline-flex items-center rounded-full bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_22px_rgba(255,255,255,0.32),0_0_44px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:scale-[1.02]"
              style={{
                fontWeight: 600,
                fontSize: "clamp(13.5px, 1.5vw, 14.5px)",
                padding: "clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px)",
              }}
            >
              {heroContent.dashboardCta}
            </Link>
          </Show>
          <Link
            href={routes.sampleProfile("rishicds")}
            className="inline-flex items-center rounded-full border border-white/25 bg-white/5 text-sm font-medium text-white transition hover:bg-white/10"
            style={{ padding: "clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px)" }}
          >
            {heroContent.secondaryCta}
          </Link>
        </div>

        <p
          className="hero-anim mt-4 text-sm"
          style={{ "--d": "0.46s", color: "rgba(255,255,255,0.35)" } as CSSProperties}
        >
          {heroContent.proofLine}
        </p>

        <div className="hero-anim mt-10 w-full max-w-2xl" style={{ "--d": "0.5s" } as CSSProperties}>
          <HeroGitHubPreview />
        </div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[920px] grid-cols-2 gap-x-4 gap-y-6 px-4 pb-10 sm:grid-cols-4 sm:pb-12">
        {stats.map((stat, index) => (
          <StatItem key={stat.label} stat={stat} index={index} />
        ))}
      </div>
    </section>
  );
}
