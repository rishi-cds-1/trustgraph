import type { EvidenceState, Role } from "@/lib/api";

/**
 * Default prepared role for the Evidence Brief flow. Must match the
 * backend's default role exactly (see AGENTS/PRD contract) — field names,
 * ids, and ordering matter.
 */
export const DEFAULT_ROLE: Role = {
  title: "Backend Engineer — Marketplace Platform",
  requirements: [
    { id: "backend-lang", label: "Go or another relevant backend language", priority: "required" },
    { id: "api-design", label: "API design", priority: "required" },
    { id: "distributed-systems", label: "Distributed systems", priority: "required" },
    { id: "testing-quality", label: "Testing and engineering quality", priority: "required" },
    { id: "production-ownership", label: "Production ownership", priority: "preferred" },
    { id: "collaboration", label: "Collaboration and technical communication", priority: "preferred" },
  ],
};

export const DEFAULT_SNAPSHOT_HANDLE = "rishicds";

/**
 * Semantic (non-grading) mapping for requirement-match states.
 * Guardrails: never red for missing evidence, no circular score gauges.
 *  - strong_direct_evidence / relevant_evidence -> restrained verified-source green/blue
 *  - partial_evidence -> neutral/blue
 *  - requires_confirmation -> amber
 *  - insufficient_evidence -> gray
 */
export const EVIDENCE_STATE_META: Record<
  EvidenceState,
  { label: string; badgeClass: string; dotClass: string }
> = {
  strong_direct_evidence: {
    label: "Strong direct evidence",
    badgeClass: "bg-accent-soft text-[#2d5016] border border-[#c8ecac]",
    dotClass: "bg-accent",
  },
  relevant_evidence: {
    label: "Relevant evidence",
    badgeClass: "bg-teal-light text-teal border border-teal/20",
    dotClass: "bg-teal",
  },
  partial_evidence: {
    label: "Partial evidence",
    badgeClass: "bg-[#EAF2FE] text-[#1D4ED8] border border-[#c7ddfb]",
    dotClass: "bg-[#3B82F6]",
  },
  requires_confirmation: {
    label: "Requires confirmation",
    badgeClass: "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]",
    dotClass: "bg-[#D97706]",
  },
  insufficient_evidence: {
    label: "Insufficient public evidence",
    badgeClass: "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]",
    dotClass: "bg-[#9CA3AF]",
  },
};

export const EVIDENCE_KIND_META = {
  direct: { label: "Direct source" },
  ai_interpretation: { label: "AI interpretation" },
} as const;

export const CONSENT_COPY = {
  checkbox:
    "I have permission to analyze this person's public GitHub activity for this demonstration.",
  bullets: [
    "Only publicly accessible information is analyzed.",
    "Email addresses and unnecessary personal information will not be displayed.",
    "Analysis is evidence preparation, not a hiring recommendation.",
    "The individual can request correction or removal.",
  ],
};

export const PROGRESS_STEPS = [
  "Loading public repositories",
  "Selecting representative work",
  "Inspecting code and documentation",
  "Extracting role-relevant evidence",
  "Preparing the candidate brief",
] as const;

export const LIMITATIONS_DISCLAIMER =
  "Public evidence is incomplete. An absence of evidence here should not be interpreted as an absence of ability.";
