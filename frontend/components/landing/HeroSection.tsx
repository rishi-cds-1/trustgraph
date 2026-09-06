"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

import { HeroGitHubPreview } from "@/components/landing/HeroGitHubPreview";
import { routes } from "@/constants/routes";
import { heroContent } from "@/lib/data";
import { gsap } from "@/lib/gsap";
import { splitChars } from "@/lib/split-chars";

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

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
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
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(123,225,59,0.14),transparent)]" />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-24 md:pt-28">
        <div className="mb-6 inline-flex max-w-full flex-wrap items-center justify-center">
          <span className="trust-row-item relative z-[3] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white shadow-[var(--shadow-xs)] transition-transform hover:-translate-y-0.5">
            <GithubMark className="h-4 w-4 text-[#111111]" />
          </span>
          <span className="trust-row-item relative z-[2] -ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white shadow-[var(--shadow-xs)] transition-transform hover:-translate-y-0.5">
            <LinkedinMark className="h-4 w-4 text-[#0A66C2]" />
          </span>
          <span className="trust-row-item relative z-[1] -ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white shadow-[var(--shadow-xs)] transition-transform hover:-translate-y-0.5">
            <StackOverflowMark className="h-4 w-4 text-[#F48024]" />
          </span>
          <span className="trust-row-item -ml-3 flex h-9 items-center whitespace-nowrap rounded-full border border-border bg-[var(--bg-surface-secondary)] py-1 pl-6 pr-4 text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
            Verified across GitHub, LinkedIn &amp; Stack Overflow
          </span>
        </div>

        <h1 className="hero-headline mx-auto w-full min-w-0 max-w-[900px] text-[clamp(2rem,9vw,6rem)] font-bold leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[clamp(2.75rem,7vw,6rem)]">
          <span className="md:hidden">
            {heroContent.titleLine1}
            <br />
            <span className="text-[var(--text-secondary)]">{heroContent.titleLine2}</span>
          </span>
          <span className="hidden md:contents">
            <span className="block">{splitChars(heroContent.titleLine1)}</span>
            <span className="block text-[var(--text-secondary)]">
              {splitChars(heroContent.titleLine2)}
            </span>
          </span>
        </h1>

        <p className="hero-sub mx-auto mt-6 w-full min-w-0 max-w-[580px] text-base font-normal leading-[1.7] text-[var(--text-secondary)] sm:text-lg">
          {heroContent.subhead}
        </p>

        <div className="hero-cta mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={routes.onboarding}
            className="inline-flex items-center gap-2 rounded-[14px] bg-accent px-7 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-green)] transition hover:bg-accent-hover"
          >
            {heroContent.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={routes.sampleProfile("rishicds")}
            className="inline-flex items-center rounded-[14px] border border-border bg-white px-7 py-3 text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-xs)] transition hover:shadow-[var(--shadow-sm)]"
          >
            {heroContent.secondaryCta}
          </Link>
        </div>

        <p className="mt-4 text-sm text-[var(--text-muted)]">{heroContent.proofLine}</p>

        <div className="relative z-20 mx-auto mt-10 w-full max-w-2xl">
          <HeroGitHubPreview />
        </div>
      </div>
    </section>
  );
}
