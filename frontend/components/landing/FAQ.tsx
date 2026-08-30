"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { faqSection } from "@/lib/data";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <p className="section-label text-xs font-semibold uppercase tracking-widest text-teal">
          {faqSection.label}
        </p>
        <h2 className="section-title mt-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
          {faqSection.title}
        </h2>

        <div className="mt-10 divide-y divide-[var(--border-soft)] rounded-[20px] border border-border bg-[var(--bg-surface-secondary)]">
          {faqSection.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.question} className="px-6">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-[var(--text-primary)] md:text-base">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform",
                      isOpen && "rotate-180 text-teal",
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
