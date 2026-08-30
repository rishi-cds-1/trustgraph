"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { DEFAULT_ROLE } from "@/constants/evidence";
import type { EvidenceBrief, Role } from "@/lib/api";

type EvidenceFlowContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  brief: EvidenceBrief | null;
  setBrief: (brief: EvidenceBrief | null) => void;
  lastUsername: string;
  setLastUsername: (username: string) => void;
  resetFlow: () => void;
};

const EvidenceFlowContext = createContext<EvidenceFlowContextValue | null>(null);

export function EvidenceFlowProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const [brief, setBrief] = useState<EvidenceBrief | null>(null);
  const [lastUsername, setLastUsername] = useState("");

  const resetFlow = useCallback(() => {
    setRole(DEFAULT_ROLE);
    setBrief(null);
    setLastUsername("");
  }, []);

  const value = useMemo(
    () => ({ role, setRole, brief, setBrief, lastUsername, setLastUsername, resetFlow }),
    [role, brief, lastUsername, resetFlow],
  );

  return <EvidenceFlowContext.Provider value={value}>{children}</EvidenceFlowContext.Provider>;
}

export function useEvidenceFlow() {
  const ctx = useContext(EvidenceFlowContext);
  if (!ctx) {
    throw new Error("useEvidenceFlow must be used within an EvidenceFlowProvider");
  }
  return ctx;
}
