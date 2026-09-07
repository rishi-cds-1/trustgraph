"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  Search,
  Send,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileSocialLinks } from "@/components/profile/ProfileSocialLinks";
import { Button } from "@/components/ui/Button";
import { landing, routes } from "@/constants";
import { brand } from "@/constants/brand";
import { api, GitHubPreview } from "@/lib/api";
import { cn } from "@/lib/utils";

function evidenceStrength(value: number): { label: string; className: string } {
  if (value >= 70) return { label: "Strong evidence", className: "bg-accent/15 text-accent" };
  if (value >= 40) return { label: "Some evidence", className: "bg-sky-400/15 text-sky-300" };
  return { label: "Limited evidence", className: "bg-white/8 text-white/45" };
}

function trustSignals(preview: GitHubPreview): string[] {
  const signals: string[] = [];
  if (preview.evidence_highlights?.length) {
    signals.push(...preview.evidence_highlights.slice(0, 3));
  }
  if (preview.stats?.length) {
    for (const stat of preview.stats.slice(0, 2)) {
      if (stat.verified) {
        signals.push(`${stat.display} ${stat.label.toLowerCase()}`);
      }
    }
  }
  if (preview.evidence_count > 0) {
    signals.push(`${preview.evidence_count} public evidence items indexed`);
  }
  if (preview.is_claimed) {
    signals.push("Verified identity — profile claimed");
  } else if (preview.is_shadow) {
    signals.push("Public GitHub evidence — claimable passport");
  }
  return [...new Set(signals)].slice(0, 4);
}

export function HeroGitHubPreview() {
  const { hero } = landing;
  const { lookup } = hero;
  const defaultHandle = hero.defaultPreviewHandle ?? "rishicds";

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<GitHubPreview | null>(null);
  const [copied, setCopied] = useState(false);
  const [focused, setFocused] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState<string>(hero.searchPlaceholderMobile);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () =>
      setSearchPlaceholder(mq.matches ? hero.searchPlaceholder : hero.searchPlaceholderMobile);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [hero.searchPlaceholder, hero.searchPlaceholderMobile]);

  useEffect(() => {
    async function loadSample() {
      try {
        const sample = await api.previewGitHub(defaultHandle);
        setPreview(sample);
      } catch {
        // leave empty until user searches
      } finally {
        setBootLoading(false);
      }
    }
    void loadSample();
  }, [defaultHandle]);

  async function handleLookup(e?: FormEvent) {
    e?.preventDefault();
    let query = username.trim();
    if (!query) return;

    // Extract username from GitHub URL if pasted
    const urlMatch = query.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)/i);
    if (urlMatch) {
      query = urlMatch[1];
    }

    setLoading(true);
    setError("");
    try {
      const result = await api.previewGitHub(query);
      setPreview(result);
    } catch {
      setError(lookup.error);
    } finally {
      setLoading(false);
    }
  }

  function copyInvite() {
    if (!preview) return;
    void navigator.clipboard.writeText(preview.invite_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function mailInvite() {
    if (!preview) return;
    const subject = encodeURIComponent(lookup.inviteEmailSubject(preview.display_name));
    const body = encodeURIComponent(
      lookup.inviteEmailBody(
        preview.display_name,
        Math.round(preview.trust_score.overall),
        preview.invite_url,
      ),
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  const signals = preview ? trustSignals(preview) : [];
  const showInvite = preview && !loading && !bootLoading;

  return (
    <div className="mx-auto w-full min-w-0 text-left">
      <form onSubmit={handleLookup} className="relative z-30 w-full min-w-0">
        <div
          className={cn(
            "hero-search-input flex h-14 min-w-0 items-center gap-2 rounded-2xl border border-white/15 py-2 pl-3 pr-2 transition sm:h-[72px] sm:gap-3 sm:pl-5 md:h-[88px] md:pl-6 md:pr-3",
            focused && "border-accent/60",
          )}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <Search className="h-5 w-5 shrink-0 text-white/45" />
          <input
            value={username}
            onChange={(e) => {
              let value = e.target.value;
              // Extract username from GitHub URL if pasted
              const urlMatch = value.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)/i);
              if (urlMatch) {
                value = urlMatch[1];
              }
              setUsername(value);
            }}
            aria-label={lookup.searchAria}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:text-base md:text-lg"
            placeholder={searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-black shadow-[0_4px_14px_rgba(123,225,59,0.35)] transition md:h-14 md:w-14 md:rounded-2xl",
              "hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
            )}
            aria-label={lookup.button}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}

      {loading && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" />
          {lookup.loading}
        </p>
      )}

      {(bootLoading || (preview && !loading)) && (
        <div
          className={cn(
            "hero-search-card relative z-10 mt-5 overflow-hidden rounded-2xl p-5 md:p-6",
            !bootLoading && preview && "score-animate",
          )}
        >
          {bootLoading ? (
            <div className="flex items-center gap-3 py-6 text-sm text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading live trust preview…
            </div>
          ) : preview ? (
            <>
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live evidence preview
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <ProfileAvatar
                    handle={preview.handle}
                    displayName={preview.display_name}
                    avatarUrl={preview.avatar_url}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-white/45">
                      GitHub
                    </p>
                    <p className="truncate text-lg font-semibold text-white">
                      {preview.display_name}
                    </p>
                    <p className="truncate font-mono text-sm text-white/50">
                      @{preview.github_username}
                    </p>
                    {(preview.social_links?.length || preview.github_public_email) && (
                      <ProfileSocialLinks
                        links={preview.social_links}
                        githubEmail={preview.github_public_email}
                        compact
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="shrink-0 rounded-xl border border-accent/25 bg-accent/10 px-5 py-3 text-center sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                    Evidence indexed
                  </p>
                  <p className="text-4xl font-extrabold tabular-nums text-white md:text-5xl">
                    {preview.evidence_count}
                  </p>
                  <p className="mt-0.5 text-xs text-white/45">{lookup.fromEvidence}</p>
                </div>
              </div>

              {signals.length > 0 && (
                <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5">
                  {signals.map((signal) => (
                    <li key={signal} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              )}

              {preview.trust_score.dimensions && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                  {[
                    { label: "Evidence", value: preview.trust_score.dimensions.evidence_depth },
                    { label: "Consistency", value: preview.trust_score.dimensions.consistency },
                    { label: "Impact", value: preview.trust_score.dimensions.impact_signals },
                    { label: "Peer", value: preview.trust_score.dimensions.peer_verification },
                  ].map((dim) => {
                    const strength = evidenceStrength(dim.value);
                    return (
                      <span
                        key={dim.label}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                          strength.className,
                        )}
                      >
                        {dim.label}: {strength.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {showInvite && !preview.is_claimed && (
                <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2">
                    <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-white">{lookup.inviteTitle(preview.display_name)}</p>
                      <p className="text-xs text-white/45">{lookup.inviteBody}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghostOnDark"
                      className="border bg-white/5 text-xs"
                      onClick={copyInvite}
                    >
                      {copied ? lookup.copied : lookup.copyInvite}
                    </Button>
                    <Button type="button" variant="ghostOnDark" className="border text-xs" onClick={mailInvite}>
                      <Send className="mr-1 h-3 w-3" />
                      {lookup.sendInvite}
                    </Button>
                  </div>
                </div>
              )}

              <p className="mt-4 text-center font-mono text-xs text-white/35">
                {brand.passportUrl(preview.handle)} ·{" "}
                <Link href={routes.sampleProfile(preview.handle)} className="text-accent hover:underline">
                  {lookup.viewPassport}
                </Link>
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
