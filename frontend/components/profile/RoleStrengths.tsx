import { inferRoleStrengths, type RoleTier } from "@/lib/roles";
import type { Capability } from "@/lib/api";
import { cn } from "@/lib/utils";

type CapabilityLike = Pick<Capability, "name" | "evidence_count"> & { verified?: boolean };

const tierStyle: Record<RoleTier, string> = {
  "Strong fit": "bg-accent-soft text-[#2d5016]",
  "Solid fit": "bg-teal-light text-teal",
  Emerging: "bg-[#F5F5F5] text-muted",
};

/**
 * Renders the engineering roles a person is strongest for, derived
 * deterministically from their verified capabilities (see lib/roles.ts).
 * Replaces the raw Trust Score across every user-facing surface.
 *
 * - variant "bars": role + tier pill + relative strength bar (passport,
 *   dashboard, onboarding, recruiter deep card)
 * - variant "chips": compact role + tier chips (recruiter result header)
 */
export function RoleStrengths({
  capabilities,
  signals,
  variant = "bars",
  limit = 3,
  className,
  emptyFallback = null,
}: {
  capabilities?: CapabilityLike[];
  signals?: string[];
  variant?: "bars" | "chips";
  limit?: number;
  className?: string;
  emptyFallback?: React.ReactNode;
}) {
  const roles = inferRoleStrengths(capabilities ?? [], signals ?? [], limit);

  if (roles.length === 0) return <>{emptyFallback}</>;

  if (variant === "chips") {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {roles.map((r) => (
          <span
            key={r.role}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              tierStyle[r.tier],
            )}
          >
            {r.role}
            <span className="opacity-70">· {r.tier}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      {roles.map((r) => (
        <div key={r.role}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-[#111111]">{r.role}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                tierStyle[r.tier],
              )}
            >
              {r.tier}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F1F1F1]">
            <div
              className="h-full rounded-full bg-teal transition-all duration-500"
              style={{ width: `${r.strength}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
