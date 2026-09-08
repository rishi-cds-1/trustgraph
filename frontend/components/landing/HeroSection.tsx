"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Files, Globe, Timer, Users } from "lucide-react";

import { HeroGitHubPreview } from "@/components/landing/HeroGitHubPreview";
import { routes } from "@/constants/routes";
import { heroContent, stats } from "@/lib/data";
import { gsap } from "@/lib/gsap";
import { splitChars } from "@/lib/split-chars";
import type { LandingStat, StatIcon } from "@/types/trust";

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.84 3.13 8.94 7.47 10.39.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.04-3.04.66-3.68-1.3-3.68-1.3-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.69-1.48-2.43-.28-4.98-1.22-4.98-5.42 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.29 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.21-2.56 5.14-5 5.41.39.34.74 1 .74 2.03 0 1.47-.01 2.65-.01 3.01 0 .29.2.64.76.53 4.34-1.45 7.46-5.55 7.46-10.39C23.02 5.24 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function StackOverflowMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.36 20.2v-6.41h2.14V22.3H3.5v-8.51h2.14v6.41h11.72Zm-9.36-2.14h7.16v-2.14H8v2.14Zm.3-4.06 7-1.48-.44-2.1-7 1.48.44 2.1Zm.9-4.05 6.47-3.02-.9-1.94-6.47 3.02.9 1.94Zm1.94-3.76L15.85 2 14.2.66l-3.7 4.19 1.64 1.34ZM8 15.86h7.16v2.14H8v-2.14Z" />
    </svg>
  );
}

function HeroNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let nodes: { x: number; y: number; vx: number; vy: number }[] = [];

    const setup = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? window.innerWidth;
      height = rect?.height ?? window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(24, Math.min(60, Math.round((width * height) / 24000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const linkDist = Math.min(180, width / 5);

      for (const node of nodes) {
        if (!reduced) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
          node.x = Math.min(Math.max(node.x, 0), width);
          node.y = Math.min(Math.max(node.y, 0), height);
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > linkDist) continue;
          ctx.strokeStyle = `rgba(255,2,17, ${0.16 * (1 - dist / linkDist)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        ctx.fillStyle = "rgba(255,2,17, 0.55)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    setup();
    draw();

    let raf = 0;
    if (!reduced) {
      const loop = () => {
        draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => setup();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

const STAT_ICONS: Record<StatIcon, typeof Users> = {
  users: Users,
  files: Files,
  globe: Globe,
  timer: Timer,
};

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
  const Icon = STAT_ICONS[stat.icon];

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
    <div className="hero-stat-item flex flex-col items-center gap-2 text-center" style={{ "--d": `${0.5 + index * 0.08}s` } as React.CSSProperties}>
      <Icon
        className="h-[clamp(20px,2.6vw,28px)] w-[clamp(20px,2.6vw,28px)] text-white/85"
        strokeWidth={1.6}
      />
      <span
        ref={ref}
        className="font-display text-[clamp(18px,2.2vw,26px)] tracking-[-0.025em] text-white tabular-nums"
      >
        {display}
      </span>
      <span className="text-[clamp(11px,1.2vw,12.5px)] text-white/45">{stat.label}</span>
    </div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".trust-row-item", {
        opacity: 0,
        y: 10,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from(".hero-headline .char", {
        opacity: 0,
        y: 40,
        rotateX: -30,
        stagger: 0.018,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.3,
      });

      gsap.from(".hero-sub", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.55,
      });

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 14,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.65,
      });

      gsap.from(".hero-preview", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.78,
      });

      gsap.from(".hero-stat-item", {
        opacity: 0,
        y: 14,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.9,
      });
    },
    { scope: containerRef },
  );

  return (
    <>
      <section
        ref={containerRef}
        className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-black"
      >
        <div className="hero-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_18%,rgba(255,2,17,0.16),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_40%,transparent_85%)]">
          <HeroNetworkBackground />
        </div>

        <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-8 pt-24 text-center sm:px-6 sm:pt-28">
          <div className="mb-6 inline-flex max-w-full flex-wrap items-center justify-center">
            <span className="trust-row-item relative z-[3] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-[#28282a] p-[5px] transition-transform hover:-translate-y-0.5">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <GithubMark className="h-3.5 w-3.5 text-[#111111]" />
              </span>
            </span>
            <span className="trust-row-item relative z-[2] -ml-[15px] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-[#28282a] p-[5px] transition-transform hover:-translate-y-1">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <LinkedinMark className="h-3.5 w-3.5 text-[#0A66C2]" />
              </span>
            </span>
            <span className="trust-row-item relative z-[1] -ml-[15px] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-[#28282a] p-[5px] transition-transform hover:-translate-y-0.5">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <StackOverflowMark className="h-3.5 w-3.5 text-[#F48024]" />
              </span>
            </span>
            <span className="trust-row-item -ml-[15px] flex h-9 items-center whitespace-nowrap rounded-full border border-white/40 bg-[#28282a] py-1 pl-6 pr-4 text-xs font-medium text-[#c4c2c3] sm:text-sm">
              Verified across GitHub, LinkedIn &amp; Stack Overflow
            </span>
          </div>

          <h1 className="hero-headline font-display mx-auto w-full min-w-0 max-w-[900px] text-[clamp(1.6rem,7vw,4.6rem)] font-normal leading-[1.12] tracking-[-0.04em] text-white sm:text-[clamp(2rem,5.6vw,4.6rem)]">
            <span className="block">{splitChars(heroContent.titleLine1)}</span>
            <span className="block text-white/70">{splitChars(heroContent.titleLine2)}</span>
          </h1>

          <p className="hero-sub mx-auto mt-6 w-full min-w-0 max-w-[560px] text-base font-normal leading-[1.55] text-white/60 sm:text-lg">
            {heroContent.subhead}
          </p>

          <div className="hero-cta mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={routes.onboarding}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_22px_rgba(255,255,255,0.32),0_0_44px_rgba(255,2,17,0.12)] transition hover:-translate-y-0.5 hover:scale-[1.02]"
            >
              {heroContent.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={routes.sampleProfile("rishicds")}
              className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {heroContent.secondaryCta}
            </Link>
          </div>

          <p className="mt-4 text-sm text-white/35">{heroContent.proofLine}</p>

          <div className="hero-preview mt-10 w-full max-w-2xl">
            <HeroGitHubPreview />
          </div>
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-[920px] grid-cols-2 gap-x-4 gap-y-6 px-4 pb-10 sm:grid-cols-4 sm:pb-12">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </section>
    </>
  );
}
