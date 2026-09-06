"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { LandingAuthNav } from "@/components/landing/LandingAuthNav";
import { routes } from "@/constants";
import { navLinks } from "@/lib/data";
import { gsap } from "@/lib/gsap";

export function LandingNavbar() {
  const navRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      gsap.from(".nav-inner", {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.1,
      });
    },
    { scope: navRef },
  );

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  return (
    <header ref={navRef} className="fixed top-4 left-0 right-0 z-50 w-full max-w-[100vw] px-4 sm:top-6 sm:px-5 md:px-8">
      <nav className="nav-inner mx-auto flex h-12 min-w-0 max-w-5xl items-center justify-between gap-2 rounded-[20px] border border-border/80 bg-white/90 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:h-14 sm:gap-3 sm:px-5">
        <Link
          href={routes.home}
          className="shrink-0 text-base font-bold tracking-tight text-[var(--text-primary)] sm:text-lg"
        >
          Trust<span className="text-teal">Graph</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex">
          <LandingAuthNav />
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-sheet"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] transition hover:bg-border/60 md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {open && (
        <div
          className="fixed inset-0 top-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        id="mobile-nav-sheet"
        className={`absolute left-4 right-4 top-[calc(100%+8px)] z-50 origin-top rounded-[20px] border border-border bg-white p-3 shadow-[var(--shadow-lg)] transition duration-200 md:hidden ${
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-[14px] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-secondary)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center border-t border-border pt-3">
          <LandingAuthNav />
        </div>
      </div>
    </header>
  );
}
