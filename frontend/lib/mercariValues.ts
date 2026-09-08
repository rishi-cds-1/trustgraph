import type { ProfileStat, PublicProfile } from "@/lib/api";

// Maps a person's public evidence onto Mercari's four values. Everything here is
// derived from signals already on the profile (trust dimensions, verified
// capabilities, public stats, connected platforms) so each earned value can
// point back to a concrete reason.
export type MercariValueKey = "go-bold" | "all-for-one" | "be-a-pro" | "move-fast";

export type MercariValue = {
  key: MercariValueKey;
  name: string;
  tagline: string;
  earned: boolean;
  reason: string;
};

const TAGLINES: Record<MercariValueKey, string> = {
  "go-bold": "Takes bold, ambitious swings.",
  "all-for-one": "Builds with and for the community.",
  "be-a-pro": "Deep expertise, held to a high bar.",
  "move-fast": "Ships consistently, with speed.",
};

const NAMES: Record<MercariValueKey, string> = {
  "go-bold": "Go Bold",
  "all-for-one": "All for One",
  "be-a-pro": "Be a Pro",
  "move-fast": "Move Fast",
};

// Curated per-handle overrides: force a value to always show earned (with an
// optional custom reason), regardless of the derived heuristics. Keyed by
// lowercased handle.
const FORCED_VALUES: Record<string, Partial<Record<MercariValueKey, string>>> = {
  rishicds: { "be-a-pro": "Peer-verified engineering depth" },
};

function statMatching(stats: ProfileStat[], ...needles: string[]): ProfileStat | undefined {
  return stats.find((s) => {
    const hay = `${s.key} ${s.label}`.toLowerCase();
    return needles.some((n) => hay.includes(n));
  });
}

function num(stat: ProfileStat | undefined): number {
  return stat ? stat.value : 0;
}

export function deriveMercariValues(profile: PublicProfile): MercariValue[] {
  const dims = profile.trust_score?.dimensions ?? {
    evidence_depth: 0,
    consistency: 0,
    peer_verification: 0,
    impact_signals: 0,
  };
  const impact = dims.impact_signals || dims.trust_ratio || 0;

  const caps = profile.capabilities ?? [];
  const verifiedCaps = caps.filter((c) => c.verified).length;

  const stats = profile.stats ?? [];
  const platforms = new Set<string>(
    [
      ...stats.map((s) => s.platform),
      ...(profile.social_links ?? []).map((s) => s.platform),
      ...(profile.evidence ?? []).map((e) => e.platform),
    ]
      .filter(Boolean)
      .map((p) => p.toLowerCase()),
  );

  const followers = num(statMatching(stats, "follower"));
  const stars = num(statMatching(stats, "star"));
  const contributions = num(statMatching(stats, "contribution", "commit"));
  const soReputation = num(statMatching(stats, "reputation", "answer"));

  const fmt = (n: number) => n.toLocaleString();

  // Be a Pro — depth of expertise and independently verified work.
  const beAProReason =
    verifiedCaps >= 3
      ? `${verifiedCaps} peer-verified capabilities`
      : dims.evidence_depth >= 55
        ? "Deep, evidence-backed track record"
        : dims.peer_verification >= 55
          ? "Independently verified across platforms"
          : `${caps.length} documented skill areas`;
  const beAPro =
    verifiedCaps >= 3 || dims.evidence_depth >= 55 || dims.peer_verification >= 55;

  // Move Fast — consistent, high-velocity output.
  const moveFastReason =
    contributions >= 300
      ? `${fmt(contributions)} public contributions`
      : dims.consistency >= 55
        ? "Consistent shipping cadence"
        : "Steady, recent activity";
  const moveFast = dims.consistency >= 55 || contributions >= 300;

  // All for One — impact on and collaboration with the wider community.
  const allForOneReason =
    stars >= 25 || followers >= 25
      ? [stars ? `${fmt(stars)} stars` : "", followers ? `${fmt(followers)} followers` : ""]
          .filter(Boolean)
          .join(" · ")
      : platforms.has("stackoverflow")
        ? soReputation > 0
          ? `${fmt(soReputation)} Stack Overflow reputation`
          : "Answers the community on Stack Overflow"
        : "Work that carries weight with peers";
  const allForOne =
    impact >= 50 || stars >= 25 || followers >= 25 || platforms.has("stackoverflow");

  // Go Bold — breadth, ambition and a willingness to experiment.
  const buildsAtHackathons = platforms.has("devpost") || platforms.has("devfolio");
  const goBoldReason = buildsAtHackathons
    ? "Ships bold projects at hackathons"
    : caps.length >= 4
      ? `${caps.length} distinct skill areas`
      : "A broad, ambitious body of work";
  const goBold = buildsAtHackathons || caps.length >= 4;

  const forced = FORCED_VALUES[(profile.handle ?? "").toLowerCase()] ?? {};

  const make = (key: MercariValueKey, earned: boolean, reason: string): MercariValue => {
    const forcedReason = forced[key];
    return {
      key,
      name: NAMES[key],
      tagline: TAGLINES[key],
      earned: earned || forcedReason !== undefined,
      reason: forcedReason ?? reason,
    };
  };

  return [
    make("go-bold", goBold, goBoldReason),
    make("all-for-one", allForOne, allForOneReason),
    make("be-a-pro", beAPro, beAProReason),
    make("move-fast", moveFast, moveFastReason),
  ];
}
