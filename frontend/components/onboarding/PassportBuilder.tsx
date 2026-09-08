"use client";

import { useEffect, useRef, useState } from "react";

import { AgentCursor, type CursorStage } from "@/components/onboarding/AgentCursor";
import { StepScoreReveal } from "@/components/onboarding/OnboardingLaterSteps";
import { SkeletonBlock } from "@/components/profile/BentoSkeleton";
import {
  BentoCapabilities,
  BentoTimeline,
  ProfileBentoGrid,
  ProfileBentoHero,
} from "@/components/profile/ProfileBento";
import { ProfileAIInsights } from "@/components/profile/ProfileAIInsights";
import { api, Profile } from "@/lib/api";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const STAGES: Omit<CursorStage, "targetRef">[] = [
  { label: "Reading GitHub repositories…" },
  { label: "Scanning portfolio via Firecrawl…" },
  { label: "Cross-referencing LinkedIn…" },
  { label: "Searching the web for corroborating evidence…" },
  { label: "Synthesizing your passport…" },
];

const STAGE_INTERVAL_MS = 2200;

const ACTIVE_GLOW = "0 0 0 2px rgba(196,0,14,0.55), 0 0 28px 6px rgba(196,0,14,0.28)";
const NO_GLOW = "0 0 0 0px rgba(196,0,14,0)";

export function PassportBuilder({
  profile,
  getToken,
  onUpdated,
}: {
  profile: Profile;
  getToken: () => Promise<string | null>;
  onUpdated: (profile: Profile) => void;
}) {
  const [phase, setPhase] = useState<"scanning" | "done" | "error">("scanning");
  const [stageIndex, setStageIndex] = useState(0);
  const started = useRef(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const capabilitiesRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const refsByStage = [heroRef, capabilitiesRef, insightRef, timelineRef, insightRef];

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void (async () => {
      const token = await getToken();
      if (!token) {
        setPhase("error");
        return;
      }
      try {
        const updated = await api.refreshInsights(token);
        onUpdated(updated);
        setPhase("done");
      } catch {
        setPhase("error");
      }
    })();
  }, [getToken, onUpdated]);

  useEffect(() => {
    if (phase !== "scanning") return;
    const id = setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, STAGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "scanning") return;
    const el = refsByStage[stageIndex].current;
    if (!el) return;

    const tween = gsap.to(el, {
      boxShadow: ACTIVE_GLOW,
      duration: 0.9,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    return () => {
      tween.kill();
      gsap.set(el, { boxShadow: NO_GLOW });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex, phase]);

  useEffect(() => {
    if (!progressRef.current) return;
    const pct = phase === "done" ? 100 : ((stageIndex + 1) / STAGES.length) * 92;
    gsap.to(progressRef.current, { width: `${pct}%`, duration: 0.6, ease: "power2.out" });
  }, [stageIndex, phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const targets = [insightRef.current, capabilitiesRef.current, timelineRef.current].filter(
      (el): el is HTMLDivElement => Boolean(el),
    );
    if (targets.length === 0) return;
    gsap.fromTo(
      targets,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: "power2.out" },
    );
  }, [phase]);

  if (phase === "error") {
    return <StepScoreReveal profile={profile} />
  }

  const hasInsight = phase === "done" && Boolean(profile.ai_insight);
  const hasTimeline = phase === "done" && (profile.timeline?.length ?? 0) > 0;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-1">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            phase === "scanning" ? "animate-pulse bg-teal" : "bg-teal",
          )}
        />
        <p className="text-sm font-medium text-teal">
          {phase === "scanning"
            ? "Building your passport in real time — scanning GitHub, portfolio, and LinkedIn…"
            : "Passport built from live evidence."}
        </p>
      </div>

      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-border">
        <div ref={progressRef} className="h-full w-0 rounded-full bg-teal" />
      </div>

      <ProfileBentoGrid>
        <div ref={heroRef} className="col-span-12">
          <ProfileBentoHero
            handle={profile.handle}
            displayName={profile.display_name}
            headline={profile.headline}
            avatarUrl={profile.avatar_url}
            capabilities={profile.capabilities}
            evidenceCount={profile.evidence_count}
            topCapability={profile.capabilities[0]?.name}
            summary={profile.ai_insight?.summary}
            roleSignals={profile.ai_insight?.role_signals}
            socialLinks={profile.social_links ?? []}
            githubPublicEmail={profile.github_public_email}
            isShadowUnclaimed={false}
            isAuthenticatedView
            isOwner
            loadingAuth={false}
          />
        </div>

        <div ref={insightRef} className="col-span-12 md:col-span-7">
          {hasInsight && profile.ai_insight ? (
            <div className="border border-border bg-white p-3 md:p-4">
              <ProfileAIInsights insight={profile.ai_insight} embedded />
            </div>
          ) : (
            <SkeletonBlock label="AI insight synthesis" />
          )}
        </div>

        <div ref={capabilitiesRef} className="col-span-12 md:col-span-5">
          {profile.capabilities.length > 0 ? (
            <BentoCapabilities
              capabilities={profile.capabilities}
              roleSignals={profile.ai_insight?.role_signals}
            />
          ) : (
            <SkeletonBlock label="Capabilities" />
          )}
        </div>

        <div ref={timelineRef} className="col-span-12">
          {hasTimeline && profile.timeline ? (
            <BentoTimeline events={profile.timeline} />
          ) : (
            <SkeletonBlock label="Evidence timeline" />
          )}
        </div>
      </ProfileBentoGrid>

      <AgentCursor
        stage={
          phase === "scanning"
            ? { label: STAGES[stageIndex].label, targetRef: refsByStage[stageIndex] }
            : null
        }
      />
    </div>
  );
}
