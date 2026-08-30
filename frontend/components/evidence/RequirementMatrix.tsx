"use client";

import { EVIDENCE_STATE_META } from "@/constants/evidence";
import type { EvidenceCardData, RequirementMatch, Role } from "@/lib/api";

type RequirementMatrixProps = {
  role: Role;
  matches: RequirementMatch[];
  evidenceCards: EvidenceCardData[];
  onJumpToCard: (cardId: string) => void;
};

export function RequirementMatrix({
  role,
  matches,
  evidenceCards,
  onJumpToCard,
}: RequirementMatrixProps) {
  const matchByRequirement = new Map(matches.map((m) => [m.requirement_id, m]));
  const cardById = new Map(evidenceCards.map((c) => [c.id, c]));

  return (
    <div className="space-y-3">
      {role.requirements.map((req) => {
        const match = matchByRequirement.get(req.id);
        const meta = match ? EVIDENCE_STATE_META[match.state] : EVIDENCE_STATE_META.insufficient_evidence;

        return (
          <div key={req.id} className="rounded-[16px] border border-border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{req.label}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  {req.priority}
                </span>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.badgeClass}`}>
                {meta.label}
              </span>
            </div>

            {match ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {match.explanation}
                </p>
                {match.evidence_card_ids.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {match.evidence_card_ids.map((cardId) => {
                      const card = cardById.get(cardId);
                      return (
                        <button
                          key={cardId}
                          type="button"
                          onClick={() => onJumpToCard(cardId)}
                          className="rounded-full border border-border bg-[var(--bg-surface-secondary)] px-3 py-1 text-xs font-medium text-teal transition hover:border-teal/30"
                        >
                          {card ? card.artifact_name : "View evidence"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                No evidence match returned for this requirement.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
