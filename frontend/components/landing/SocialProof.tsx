"use client";

import {
  Code2,
  FileText,
  FolderOpen,
  GraduationCap,
  Layers,
  Link2,
  Mic2,
  Presentation,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { Marquee } from "@/components/ui/marquee";
import { platformLogos } from "@/lib/data";

const platformIcons: Record<string, LucideIcon> = {
  GitHub: Code2,
  "Stack Overflow": Layers,
  Devpost: Trophy,
  LinkedIn: Link2,
  "Google Scholar": GraduationCap,
  arXiv: FileText,
  Sessionize: Mic2,
  Devfolio: FolderOpen,
  "Conference talks": Presentation,
};

export function SocialProof() {
  return (
    <section className="border-y border-border bg-[var(--bg-surface-secondary)] py-6">
      <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
        Evidence aggregated from platforms developers already use
      </p>
      <Marquee pauseOnHover className="gap-6 [--duration:30s]">
        {platformLogos.map((name) => {
          const PlatformIcon = platformIcons[name] ?? Code2;
          return (
            <span
              key={name}
              className="mx-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <PlatformIcon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              {name}
            </span>
          );
        })}
      </Marquee>
    </section>
  );
}
