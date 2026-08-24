"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { navigation, routes } from "@/constants";
import { nav as navStyles } from "@/constants/styles";

export function AuthNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out">
        <Link
          href={routes.signInReturningTo(pathname)}
          className={`hidden sm:inline ${navStyles.link}`}
        >
          {navigation.login}
        </Link>
        <Link href={routes.signUp} className={navStyles.cta}>
          {navigation.getStarted}
        </Link>
      </Show>
      <Show when="signed-in">
        <Link href={routes.dashboard} className={`hidden sm:inline ${navStyles.link}`}>
          Dashboard
        </Link>
        <Link href={routes.passport} className={`hidden md:inline ${navStyles.link}`}>
          My Passport
        </Link>
        <UserButton />
      </Show>
    </div>
  );
}
