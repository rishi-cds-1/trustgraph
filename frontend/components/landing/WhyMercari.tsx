"use client";

import { whyMercariSection } from "@/lib/data";

export function WhyMercari() {
  return (
    <section id="why-mercari" className="bg-[var(--bg-surface-secondary)] py-24 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <p className="section-label text-xs font-semibold uppercase tracking-widest text-teal">
          {whyMercariSection.label}
        </p>
        <h2 className="section-title mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
          {whyMercariSection.title}
        </h2>

        <div className="mt-8 space-y-6">
          {whyMercariSection.paragraphs.map((paragraph, i) => (
            <blockquote
              key={i}
              className="rounded-[20px] border border-border bg-white p-6 text-[15px] leading-relaxed text-[var(--text-secondary)] shadow-[var(--shadow-xs)]"
            >
              {paragraph}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
