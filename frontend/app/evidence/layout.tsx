import Link from "next/link";

import { DemoModeBar } from "@/components/evidence/DemoModeBar";
import { EvidenceFlowProvider } from "@/components/evidence/EvidenceFlowProvider";

export default function EvidenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <EvidenceFlowProvider>
      <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
        <DemoModeBar />
        <header className="border-b border-border bg-white px-6 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Link href="/" className="text-sm font-bold text-[var(--text-primary)]">
              Trust<span className="text-teal">Graph</span>
            </Link>
            <p className="text-xs text-[var(--text-muted)]">Evidence Brief — prototype flow</p>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border bg-white px-6 py-4 text-center">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            AI organizes evidence. People make decisions.
          </p>
        </footer>
      </div>
    </EvidenceFlowProvider>
  );
}
