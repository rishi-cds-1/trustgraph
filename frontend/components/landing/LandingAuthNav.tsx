"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { navigation, routes } from "@/constants";
import { cn } from "@/lib/utils";

const pillClass =
  "inline-flex h-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#28282a] px-5 text-sm font-medium text-[#c8c8c8] shadow-[var(--nav-shadow)] transition hover:-translate-y-px hover:bg-[#323234] hover:text-white";

export function LandingAuthNav({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", mobile ? "w-full flex-col" : "h-full")}>
      <Show when="signed-out">
        <SignInButton mode="redirect" forceRedirectUrl={routes.dashboard}>
          <button type="button" className={cn(pillClass, mobile && "w-full py-3")}>
            {navigation.login}
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Link href={routes.dashboard} className={cn(pillClass, mobile && "w-full py-3")}>
          Dashboard
        </Link>
        <div className={mobile ? "flex justify-center pt-1" : "flex items-center"}>
          <UserButton />
        </div>
      </Show>
    </div>
  );
}
