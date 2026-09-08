"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { routes } from "@/constants";
import { api } from "@/lib/api";
import { syncAccount } from "@/lib/sync-account";
import { cn } from "@/lib/utils";

type Mode = "passport" | "recruiter";

const MODES: { key: Mode; label: string }[] = [
  { key: "passport", label: "Normal" },
  { key: "recruiter", label: "Recruiter" },
];

/**
 * Admin-only pill that flips the signed-in admin's own account between normal
 * and recruiter mode. Gated on api.adminMe (same pattern as AdminNavLink), so
 * it renders for nobody else. Uses the admin-only /admin/switch-mode endpoint
 * which bypasses the one-way account_type lock.
 */
export function AdminModeSwitch() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [switching, setSwitching] = useState<Mode | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;
    async function check() {
      const token = await getToken();
      if (!token || cancelled) return;
      try {
        const res = await api.adminMe(token);
        if (cancelled) return;
        setIsAdmin(res.admin);
        if (!res.admin) return;
        const sync = await syncAccount(getToken);
        if (cancelled) return;
        setMode(sync.user?.account_type === "recruiter" ? "recruiter" : "passport");
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  const switchTo = useCallback(
    async (next: Mode) => {
      if (next === mode || switching) return;
      const token = await getToken();
      if (!token) return;
      setSwitching(next);
      try {
        await api.adminSwitchMode(token, next);
        setMode(next);
        router.push(next === "recruiter" ? routes.recruiterDashboard : routes.dashboard);
        router.refresh();
      } catch {
        // leave mode unchanged on failure
      } finally {
        setSwitching(null);
      }
    },
    [mode, switching, getToken, router],
  );

  if (!isSignedIn || !isAdmin || !mode) return null;

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-border bg-white p-0.5"
      title="Admin: switch your own view"
    >
      {MODES.map((m) => {
        const active = mode === m.key;
        const busy = switching === m.key;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => void switchTo(m.key)}
            disabled={!!switching}
            aria-pressed={active}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60",
              active ? "bg-ink text-white" : "text-muted hover:text-ink",
            )}
          >
            {busy ? "…" : m.label}
          </button>
        );
      })}
    </div>
  );
}
