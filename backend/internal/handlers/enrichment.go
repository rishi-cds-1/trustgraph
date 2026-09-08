package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/trustgraph/backend/internal/middleware"
	"github.com/trustgraph/backend/internal/models"
	"github.com/trustgraph/backend/internal/repository"
	"github.com/trustgraph/backend/internal/service/profilesync"
)

// passportBuildCooldown bounds cost/abuse: once a passport has been built from
// the web, repeat live-preview visits reuse the result instead of re-spending on
// search/scrape/LLM for the same person.
const passportBuildCooldown = 7 * 24 * time.Hour

func (a *API) EnrichmentCapabilities(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"capabilities": a.enrichment.Capabilities(),
	})
}

func (a *API) RefreshProfileInsights(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	profile, err := a.store.FindProfileByUserID(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusNotFound, "profile not found")
		return
	}

	result, err := a.enrichment.EnrichProfile(r.Context(), profile)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	previous := profile.TrustScore.Overall
	profile.AIInsight = &result.Insight
	profile.EnrichedSources = result.EnrichedSources
	for _, item := range result.Evidence {
		if !hasEvidenceTitle(profile.Evidence, item.Title, item.Platform) {
			profile.Evidence = append(profile.Evidence, item)
		}
	}
	profilesync.FinalizeProfileMetrics(profile)

	if err := a.store.UpdateProfile(r.Context(), profile); err != nil {
		writeError(w, http.StatusInternalServerError, "could not save insights")
		return
	}
	a.recordScoreChange(r.Context(), profile, previous)

	writeJSON(w, http.StatusOK, profile)
}

// BuildPassport powers the live passport preview's "keep building" step. It runs
// cross-site enrichment (LinkedIn, portfolio, blog, Stack Overflow, ...) on a
// profile — claimed OR shadow — and returns the updated public view. The
// frontend renders the GitHub-only shell instantly, then calls this in the
// background and merges the richer result in when it lands. Safe to call on any
// handle: unknown handles are materialized as shadows first, and a cooldown keeps
// repeat visits from re-spending on external APIs.
func (a *API) BuildPassport(w http.ResponseWriter, r *http.Request) {
	handle := strings.TrimSpace(strings.ToLower(r.PathValue("handle")))
	profile, err := a.store.FindProfileByHandle(r.Context(), handle)
	if err == repository.ErrNotFound {
		profile, err = a.createShadowProfileFromGitHub(r.Context(), handle)
	}
	if err != nil {
		writeError(w, http.StatusNotFound, "profile not found")
		return
	}

	alreadyBuilt := profile.AIInsight != nil && len(profile.EnrichedSources) > 0 &&
		time.Since(profile.AIInsight.GeneratedAt) < passportBuildCooldown

	if a.cfg.EnrichmentEnabled() && !alreadyBuilt {
		if result, err := a.enrichment.BuildPassportEnrichment(r.Context(), profile); err == nil && result != nil {
			previous := profile.TrustScore.Overall
			profile.AIInsight = &result.Insight
			profile.EnrichedSources = result.EnrichedSources
			for _, item := range result.Evidence {
				if !hasEvidenceTitle(profile.Evidence, item.Title, item.Platform) {
					profile.Evidence = append(profile.Evidence, item)
				}
			}
			profilesync.FinalizeProfileMetrics(profile)
			profilesync.RecomputeScore(profile)
			if err := a.store.UpdateProfile(r.Context(), profile); err == nil {
				a.recordScoreChange(r.Context(), profile, previous)
			}
		}
	}

	viewMode := "teaser"
	isOwner := false
	if viewerID, ok := middleware.UserIDFromContext(r.Context()); ok {
		isOwner = profile.UserID == viewerID
		if isOwner {
			viewMode = "full"
		} else {
			viewMode = "summary"
		}
	}

	a.backfillGitHubEmail(r.Context(), profile)
	view := a.toPublicView(r.Context(), profile, viewMode, isOwner, false)
	writeJSON(w, http.StatusOK, view)
}

func (a *API) GetProfileInsights(w http.ResponseWriter, r *http.Request) {
	handle := r.PathValue("handle")
	profile, err := a.store.FindProfileByHandle(r.Context(), handle)
	if err != nil {
		writeError(w, http.StatusNotFound, "profile not found")
		return
	}
	if profile.AIInsight == nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"handle":       handle,
			"ai_insight":   nil,
			"capabilities": a.enrichment.Capabilities(),
		})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"handle":           handle,
		"ai_insight":       profile.AIInsight,
		"enriched_sources": profile.EnrichedSources,
		"capabilities":     a.enrichment.Capabilities(),
	})
}

func hasEvidenceTitle(items []models.EvidenceItem, title, platform string) bool {
	for _, item := range items {
		if item.Platform == platform && strings.EqualFold(item.Title, title) {
			return true
		}
	}
	return false
}

func (a *API) applySupplementalEvidence(ctx context.Context, profile *models.Profile) {
	if profile == nil {
		return
	}
	items, err := a.enrichment.SupplementSparseEvidence(ctx, profile)
	if err != nil || len(items) == 0 {
		return
	}
	changed := false
	for _, item := range items {
		if hasEvidenceTitle(profile.Evidence, item.Title, item.Platform) {
			continue
		}
		profile.Evidence = append(profile.Evidence, item)
		changed = true
	}
	if !changed {
		return
	}
	profilesync.RecomputeScore(profile)
	profilesync.FinalizeProfileMetrics(profile)
}
