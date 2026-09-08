import { Award, Check, Gauge, Rocket, Users } from "lucide-react";

import type { MercariValue, MercariValueKey } from "@/lib/mercariValues";
import { cn } from "@/lib/utils";

const ICONS: Record<MercariValueKey, typeof Rocket> = {
  "go-bold": Rocket,
  "all-for-one": Users,
  "be-a-pro": Award,
  "move-fast": Gauge,
};

export function MercariValueStrip({ values }: { values: MercariValue[] }) {
  const earnedCount = values.filter((v) => v.earned).length;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Mercari values
        </p>
        <p className="text-[10px] text-muted">
          <span className="font-semibold text-mercari-red">{earnedCount}</span> of {values.length}{" "}
          shown by the evidence
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {values.map((value) => {
          const Icon = ICONS[value.key];
          return (
            <div
              key={value.key}
              className={cn(
                "relative flex flex-col gap-1 rounded-md border p-2.5 transition-colors",
                value.earned
                  ? "border-mercari-red/40 bg-mercari-red/5"
                  : "border-dashed border-border bg-transparent opacity-55",
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon
                  className={cn("h-3.5 w-3.5", value.earned ? "text-mercari-red" : "text-muted")}
                  aria-hidden
                />
                <span
                  className={cn(
                    "text-xs font-bold",
                    value.earned ? "text-[#111111]" : "text-muted",
                  )}
                >
                  {value.name}
                </span>
                {value.earned && (
                  <span className="ml-auto inline-flex h-4 w-4 items-center justify-center rounded-full bg-mercari-red text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-[10px] leading-snug",
                  value.earned ? "text-[#111111]" : "text-muted",
                )}
              >
                {value.earned ? value.reason : value.tagline}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
