"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LandingAuthNav } from "@/components/landing/LandingAuthNav";
import { brand, routes } from "@/constants";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onResize() {
      if (window.innerWidth > 720) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  return (
    <header className="hero-nav-anim fixed inset-x-0 top-4 z-50 w-full max-w-[100vw] px-4 sm:top-6 sm:px-5 md:px-8">
      <div
        className="mx-auto flex w-full max-w-[720px] items-center justify-between"
        style={{ gap: "clamp(18px, 2.8vw, 28px)" }}
      >
        <Link
          href={routes.home}
          aria-label={`${brand.name} home`}
          className="flex shrink-0 items-center rounded-full bg-white px-4 font-semibold tracking-tight text-[#111111] shadow-[var(--nav-shadow)] transition-transform hover:scale-[1.03]"
          style={{
            height: "clamp(40px, 4.4vw, 46px)",
            fontSize: "clamp(14px, 1.7vw, 16px)",
          }}
        >
          {brand.name}
        </Link>

        <nav
          className="hidden min-w-0 max-w-[430px] flex-1 items-center justify-center gap-1 rounded-full bg-white px-2 shadow-[var(--nav-shadow)] min-[721px]:flex"
          style={{ height: "clamp(44px, 5.2vw, 48px)" }}
        >
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "hero-nav-link rounded-full px-3 py-2 font-medium text-[#2e2e2e] tracking-[-0.01em]",
                index === 0 && "is-active",
              )}
              style={{ fontSize: "clamp(13px, 1.4vw, 15px)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-[721px]:block" style={{ height: "clamp(44px, 5.2vw, 48px)" }}>
          <LandingAuthNav />
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="hero-mobile-sheet"
          className={cn(
            "relative grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-[var(--nav-shadow)] transition-colors min-[721px]:hidden",
            open ? "bg-white" : "bg-[#28282a]",
          )}
        >
          <span className="flex flex-col items-center gap-[5px]">
            <span
              className={cn(
                "block h-[1.5px] w-[18px] rounded-full transition-all duration-200",
                open ? "translate-y-[6.5px] rotate-45 bg-black" : "bg-white",
              )}
            />
            <span
              className={cn(
                "block h-[1.5px] w-[18px] rounded-full transition-all duration-200",
                open ? "opacity-0" : "bg-white opacity-100",
              )}
            />
            <span
              className={cn(
                "block h-[1.5px] w-[18px] rounded-full transition-all duration-200",
                open ? "-translate-y-[6.5px] -rotate-45 bg-black" : "bg-white",
              )}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          className="hero-overlay-anim fixed inset-0 z-40 bg-black/62 backdrop-blur-[6px] min-[721px]:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        id="hero-mobile-sheet"
        className={cn(
          "hero-menu-anim absolute left-4 right-4 top-[calc(100%+8px)] z-50 rounded-[28px] bg-white p-[22px_18px_20px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] min-[721px]:hidden",
          !open && "hidden",
        )}
      >
        <div className="flex flex-col">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "hero-link-anim hero-nav-link relative rounded-[14px] px-4 py-3 text-center text-sm font-medium text-[#2e2e2e] transition hover:bg-[#fafafa]",
                index === 0 && "is-active",
              )}
              style={{ "--d": `${index * 0.05}s` } as React.CSSProperties}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div
          className="hero-link-anim mt-3 flex items-center justify-center border-t border-[#EAEAEA] pt-4"
          style={{ "--d": `${navLinks.length * 0.05}s` } as React.CSSProperties}
        >
          <LandingAuthNav mobile />
        </div>
      </div>
    </header>
  );
}
