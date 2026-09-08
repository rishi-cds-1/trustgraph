"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { BuildStage } from "@/components/profile/BuildStage";
import { EvidenceList } from "@/components/profile/EvidenceList";
import { PassportBuildCursors, type BuildTargetStage } from "@/components/profile/PassportBuildCursors";
import { PassportBuildFlag } from "@/components/profile/PassportBuildFlag";
import { ProUpsellBanner } from "@/components/profile/ProUpsellBanner";
import {
  BentoBlock,
  BentoCapabilities,
  BentoInsightsList,
  BentoTeaserCta,
  BentoTimeline,
  ProfileBentoGrid,
  ProfileBentoHero,
} from "@/components/profile/ProfileBento";
import { HeroVideoBackground } from "@/components/landing/HeroVideoBackground";
import { ProfileAIInsights } from "@/components/profile/ProfileAIInsights";
import { ProfileRecruiterReport } from "@/components/profile/ProfileRecruiterReport";
import { ProfileStatsGrid } from "@/components/profile/ProfileStatsGrid";
import { ProfileDisputePanel } from "@/components/profile/ProfileDisputePanel";
import { RecruiterModePanel } from "@/components/profile/RecruiterModePanel";
import { profile as profileCopy, routes } from "@/constants";
import { layout, links } from "@/constants/styles";
import { api, PublicProfile } from "@/lib/api";
import { deriveMercariValues } from "@/lib/mercariValues";

type ProfilePageContentProps = {
  handle: string;
  initialProfile: PublicProfile;
  initialBuildPhase?: "revealed" | "building";
};

export function ProfilePageContent({
  handle,
  initialProfile,
  initialBuildPhase = "revealed",
}: ProfilePageContentProps) {
  const { isSignedIn, getToken } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [buildPhase, setBuildPhase] = useState<"revealed" | "building">(initialBuildPhase);
  const [revealedStages, setRevealedStages] = useState<Set<number>>(new Set());
  const [activeStages, setActiveStages] = useState<Map<number, string>>(new Map());
  // Whether this view should keep building itself from the web after first paint:
  // a live preview (arrived from the hero) or any thin, unclaimed shadow passport.
  const willKeepBuilding =
    initialBuildPhase === "building" || (initialProfile.is_shadow && !initialProfile.is_claimed);
  const [enriching, setEnriching] = useState(willKeepBuilding);
  const buildStartedRef = useRef(false);
  const building = buildPhase === "building";

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const capabilitiesRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setProfile(initialProfile);
      return;
    }

    let cancelled = false;

    async function loadAuthenticatedProfile() {
      setLoadingAuth(true);
      try {
        const token = await getToken();
        if (!token || cancelled) return;

        try {
          await api.syncClerk(token);
        } catch {
          // still attempt profile fetch with valid Clerk JWT
        }

        const next = await api.getProfile(handle, token);
        if (!cancelled) setProfile(next);
      } catch {
        // keep initial teaser data on failure
      } finally {
        if (!cancelled) setLoadingAuth(false);
      }
    }

    void loadAuthenticatedProfile();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken, handle]);

  // "Keep building" step: for a live preview (arrived from the hero) or any
  // thin shadow passport, show the GitHub-only shell immediately, then run
  // cross-site enrichment (LinkedIn, portfolio, blog, Stack Overflow, ...) in the
  // background and fold the richer result in when it lands. Fires once; the
  // backend cooldown keeps repeat visits from re-spending on external APIs.
  useEffect(() => {
    if (buildStartedRef.current || !willKeepBuilding) return;
    buildStartedRef.current = true;

    let cancelled = false;

    async function keepBuilding() {
      try {
        const token = isSignedIn ? await getToken().catch(() => null) : null;
        const next = await api.buildPassport(handle, token ?? undefined);
        // Only adopt the enriched result if it didn't lose ground (e.g. a teaser
        // response for a signed-in viewer) — never downgrade what's on screen.
        if (!cancelled && next && next.evidence_count >= profile.evidence_count) {
          setProfile(next);
        }
      } catch {
        // best-effort — the GitHub passport already renders without this
      } finally {
        if (!cancelled) setEnriching(false);
      }
    }

    void keepBuilding();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthenticatedView = profile.view_mode === "summary" || profile.view_mode === "full";
  const isFullView = profile.view_mode === "full";
  const isShadowUnclaimed = profile.is_shadow && !profile.is_claimed;
  const evidence = profile.evidence ?? [];
  const stats = profile.stats ?? [];
  const socialLinks = profile.social_links ?? [];

  const hasTimeline = isAuthenticatedView && (profile.timeline?.length ?? 0) > 0;

  const mercariValues = deriveMercariValues(profile);

  let stageCursor = 0;
  const heroStageIdx = stageCursor++;
  const statsStageIdx = stats.length > 0 ? stageCursor++ : -1;
  const insightStageIdx = profile.ai_insight ? stageCursor++ : -1;
  const capabilitiesStageIdx = stageCursor++;
  const timelineStageIdx = hasTimeline ? stageCursor++ : -1;

  const buildStages: BuildTargetStage[] = [{ ref: heroRef, label: "Passport hero" }];
  if (statsStageIdx >= 0) buildStages.push({ ref: statsRef, label: "Stats" });
  if (insightStageIdx >= 0) buildStages.push({ ref: insightRef, label: "AI insight synthesis" });
  buildStages.push({ ref: capabilitiesRef, label: "Capabilities" });
  if (timelineStageIdx >= 0) buildStages.push({ ref: timelineRef, label: "Evidence timeline" });

  const isStageRevealed = (idx: number) => !building || revealedStages.has(idx);
  const stageActiveLabel = (idx: number) => (building ? activeStages.get(idx) : undefined);

  return (
    <main className={`${layout.page} relative pt-24 pb-10`}>
      {/* Cover banner: the hero video fades into the page behind the passport top. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
        <HeroVideoBackground className="opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-surface/70 to-surface" />
      </div>
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      {enriching && (
        <div className="fixed bottom-5 right-5 z-40 flex max-w-[19rem] items-center gap-2.5 rounded-full border border-mercari-red/30 bg-surface/95 px-3.5 py-2 text-xs font-medium text-[#111111] shadow-lg backdrop-blur">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mercari-red opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mercari-red" />
          </span>
          Building passport — scanning the web for LinkedIn, portfolio &amp; more…
        </div>
      )}

      <Suspense fallback={null}>
        <PassportBuildFlag
          onBuilt={() => {
            setRevealedStages(new Set());
            setActiveStages(new Map());
            setBuildPhase("building");
          }}
        />
      </Suspense>

      {building && (
        <PassportBuildCursors
          stages={buildStages}
          displayName={profile.display_name}
          onStageRevealed={(idx) => setRevealedStages((prev) => new Set(prev).add(idx))}
          onActiveChange={(active) => setActiveStages(new Map(active.map((a) => [a.index, a.label])))}
          onComplete={() => setBuildPhase("revealed")}
        />
      )}

      <div className="relative mx-auto max-w-6xl px-4 md:px-5">
        <ProfileBentoGrid>
          <BuildStage
            ref={heroRef}
            revealed={isStageRevealed(heroStageIdx)}
            active={Boolean(stageActiveLabel(heroStageIdx))}
            activeLabel={stageActiveLabel(heroStageIdx)}
            label="Passport hero"
            className="col-span-12"
          >
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
              socialLinks={socialLinks}
              githubPublicEmail={profile.github_public_email}
              company={profile.company}
              location={profile.location}
              isShadowUnclaimed={isShadowUnclaimed}
              isAuthenticatedView={isAuthenticatedView}
              isOwner={Boolean(profile.is_owner)}
              loadingAuth={loadingAuth}
              mercariValues={mercariValues}
            />
          </BuildStage>

          {stats.length > 0 && (
            <BuildStage
              ref={statsRef}
              revealed={isStageRevealed(statsStageIdx)}
              active={Boolean(stageActiveLabel(statsStageIdx))}
              activeLabel={stageActiveLabel(statsStageIdx)}
              label="Stats"
              className="col-span-12"
            >
              <BentoBlock className="col-span-12">
                <ProfileStatsGrid stats={stats} embedded />
              </BentoBlock>
            </BuildStage>
          )}

          {profile.ai_insight && (
            <BuildStage
              ref={insightRef}
              revealed={isStageRevealed(insightStageIdx)}
              active={Boolean(stageActiveLabel(insightStageIdx))}
              activeLabel={stageActiveLabel(insightStageIdx)}
              label="AI insight synthesis"
              className="col-span-12 md:col-span-7"
            >
              <BentoBlock className="col-span-12 md:col-span-7">
                <ProfileAIInsights insight={profile.ai_insight} embedded highlightsOnly />
              </BentoBlock>
            </BuildStage>
          )}

          <BuildStage
            ref={capabilitiesRef}
            revealed={isStageRevealed(capabilitiesStageIdx)}
            active={Boolean(stageActiveLabel(capabilitiesStageIdx))}
            activeLabel={stageActiveLabel(capabilitiesStageIdx)}
            label="Capabilities"
            className="col-span-12 md:col-span-5"
          >
            <BentoCapabilities
              capabilities={profile.capabilities}
              roleSignals={profile.ai_insight?.role_signals}
            />
          </BuildStage>

          {isAuthenticatedView && !profile.is_owner && (
            <BentoBlock className="col-span-12">
              <RecruiterModePanel
                handle={handle}
                profile={profile}
                onProfileUpdate={setProfile}
                embedded
              />
            </BentoBlock>
          )}

          {isAuthenticatedView && profile.is_owner && profile.recruiter_report && (
            <BentoBlock className="col-span-12">
              <ProfileRecruiterReport report={profile.recruiter_report} embedded />
            </BentoBlock>
          )}

          {isAuthenticatedView && !profile.is_owner && (
            <BentoBlock className="col-span-12">
              <EvidenceList evidence={evidence} embedded />
            </BentoBlock>
          )}

          {!isAuthenticatedView && <BentoTeaserCta handle={profile.handle} />}

          {hasTimeline && profile.timeline && (
            <BuildStage
              ref={timelineRef}
              revealed={isStageRevealed(timelineStageIdx)}
              active={Boolean(stageActiveLabel(timelineStageIdx))}
              activeLabel={stageActiveLabel(timelineStageIdx)}
              label="Evidence timeline"
              className="col-span-12"
            >
              <BentoTimeline events={profile.timeline} />
            </BuildStage>
          )}

          {isFullView && profile.insights && profile.insights.length > 0 && (
            <BentoInsightsList items={profile.insights} />
          )}

          {isAuthenticatedView && !isFullView && !profile.is_owner && (
            <BentoBlock className="col-span-12 bg-[#FAFAFA]">
              <p className="text-sm text-muted">{profileCopy.authenticated.comparativeInsights}</p>
            </BentoBlock>
          )}

          {isFullView && profile.is_owner && !profile.is_pro && (
            <BentoBlock className="col-span-12">
              <ProUpsellBanner embedded />
            </BentoBlock>
          )}

          <ProfileDisputePanel
            handle={profile.handle}
            isClaimed={profile.is_claimed}
            isOwner={Boolean(profile.is_owner)}
          />
        </ProfileBentoGrid>

        {!isAuthenticatedView && (
          <p className="mt-4 text-center text-xs text-muted">
            {profileCopy.footer.prompt}{" "}
            <Link href={routes.signup} className={links.inlineUnderline}>
              {profileCopy.footer.cta}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
