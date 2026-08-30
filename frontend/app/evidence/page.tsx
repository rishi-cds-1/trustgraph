"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from "lucide-react";

import { useEvidenceFlow } from "@/components/evidence/EvidenceFlowProvider";
import { DEFAULT_ROLE } from "@/constants/evidence";
import { api, type Priority, type Requirement, type Role } from "@/lib/api";

function makeId() {
  return `req-${Math.random().toString(36).slice(2, 9)}`;
}

export default function EvidenceRolePage() {
  const router = useRouter();
  const { role: contextRole, setRole } = useEvidenceFlow();

  const [title, setTitle] = useState(contextRole.title || DEFAULT_ROLE.title);
  const [requirements, setRequirements] = useState<Requirement[]>(
    contextRole.requirements.length ? contextRole.requirements : DEFAULT_ROLE.requirements,
  );
  const [newLabel, setNewLabel] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function updateLabel(id: string, label: string) {
    setRequirements((prev) => prev.map((r) => (r.id === id ? { ...r, label } : r)));
  }

  function togglePriority(id: string) {
    setRequirements((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, priority: (r.priority === "required" ? "preferred" : "required") as Priority }
          : r,
      ),
    );
  }

  function removeRequirement(id: string) {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  }

  function moveRequirement(index: number, direction: -1 | 1) {
    setRequirements((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addRequirement() {
    const label = newLabel.trim();
    if (!label) return;
    setRequirements((prev) => [...prev, { id: makeId(), label, priority: "preferred" }]);
    setNewLabel("");
  }

  async function extractFromJobDescription() {
    if (!jobDescription.trim()) return;
    setExtracting(true);
    setNote(null);
    try {
      const result = await api.extractRequirements(jobDescription);
      setRequirements(result.requirements);
      if (result.source === "fallback") {
        setNote("Using default requirements — AI extraction unavailable.");
      } else {
        setNote("Requirements extracted from the job description.");
      }
    } catch {
      setNote("Could not extract requirements right now. You can still edit the list manually.");
    } finally {
      setExtracting(false);
    }
  }

  function confirmAndContinue() {
    const confirmed: Role = { title: title.trim() || DEFAULT_ROLE.title, requirements };
    setRole(confirmed);
    router.push("/evidence/analyze");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal">
        Step 1 of 4 — Evidence criteria
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
        Define what evidence matters for this role
      </h1>
      <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
        Start from a prepared role, or paste a job description to extract role requirements. You
        stay in control of the final list.
      </p>

      <div className="mt-10 card-surface p-6 md:p-8">
        <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Role title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2 w-full rounded-[14px] border border-border px-4 py-3 text-sm outline-none focus:border-teal"
        />

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Requirements
          </p>
          <ul className="mt-3 space-y-2">
            {requirements.map((req, index) => (
              <li
                key={req.id}
                className="flex items-center gap-2 rounded-[14px] border border-border bg-white px-3 py-2.5"
              >
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => moveRequirement(index, -1)}
                    disabled={index === 0}
                    className="rounded p-0.5 text-[var(--text-muted)] hover:bg-[#F5F5F5] disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => moveRequirement(index, 1)}
                    disabled={index === requirements.length - 1}
                    className="rounded p-0.5 text-[var(--text-muted)] hover:bg-[#F5F5F5] disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <input
                  value={req.label}
                  onChange={(e) => updateLabel(req.id, e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => togglePriority(req.id)}
                  className={
                    req.priority === "required"
                      ? "shrink-0 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-[#2d5016]"
                      : "shrink-0 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-[var(--text-muted)]"
                  }
                >
                  {req.priority === "required" ? "Required" : "Preferred"}
                </button>

                <button
                  type="button"
                  aria-label="Remove requirement"
                  onClick={() => removeRequirement(req.id)}
                  className="shrink-0 rounded p-1.5 text-[var(--text-muted)] hover:bg-[#FEE2E2] hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            {requirements.length === 0 && (
              <li className="rounded-[14px] border border-dashed border-border px-3 py-4 text-center text-sm text-[var(--text-muted)]">
                No requirements yet — add one below.
              </li>
            )}
          </ul>

          <div className="mt-3 flex gap-2">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRequirement();
                }
              }}
              placeholder="Add a requirement…"
              className="flex-1 rounded-[14px] border border-border px-4 py-2.5 text-sm outline-none focus:border-teal"
            />
            <button
              type="button"
              onClick={addRequirement}
              className="inline-flex items-center gap-1.5 rounded-[14px] border border-border bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-teal/30"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border-soft)] pt-6">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Paste a job description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            placeholder="Paste the job description here to extract role requirements…"
            className="mt-2 w-full rounded-[14px] border border-border px-4 py-3 text-sm outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={extractFromJobDescription}
            disabled={extracting || !jobDescription.trim()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-[14px] bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {extracting ? "Extracting…" : "Extract requirements with AI"}
          </button>
          {note && (
            <p className="mt-3 rounded-[10px] bg-[var(--bg-surface-secondary)] px-3 py-2 text-xs text-[var(--text-secondary)]">
              {note}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={confirmAndContinue}
          disabled={requirements.length === 0}
          className="inline-flex items-center justify-center rounded-[14px] bg-accent px-7 py-3.5 text-sm font-medium text-[#111111] shadow-[var(--shadow-green)] transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm evidence criteria
        </button>
      </div>
    </div>
  );
}
