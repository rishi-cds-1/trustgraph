"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Sparkles } from "lucide-react";

import { useEvidenceFlow } from "@/components/evidence/EvidenceFlowProvider";
import { DEFAULT_SNAPSHOT_HANDLE } from "@/constants/evidence";
import { api } from "@/lib/api";

export function DemoModeBar() {
  const router = useRouter();
  const { setBrief, resetFlow } = useEvidenceFlow();
  const [loading, setLoading] = useState(false);

  async function loadSnapshot() {
    setLoading(true);
    try {
      const snapshot = await api.getSnapshotBrief(DEFAULT_SNAPSHOT_HANDLE);
      setBrief(snapshot);
      router.push("/evidence/brief");
    } catch {
      // silently ignore — demo convenience only
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    resetFlow();
    router.push("/evidence");
  }

  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-3 border-b border-border bg-[#111111] px-4 py-1.5 text-xs text-white/80">
      <span className="hidden font-medium uppercase tracking-widest text-white/50 sm:inline">
        Demo mode
      </span>
      <button
        type="button"
        onClick={loadSnapshot}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 transition hover:bg-white/10 disabled:opacity-50"
      >
        <Sparkles className="h-3 w-3" />
        {loading ? "Loading…" : "Load saved snapshot"}
      </button>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 transition hover:bg-white/10"
      >
        <RotateCcw className="h-3 w-3" />
        Reset demo
      </button>
    </div>
  );
}
