package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/trustgraph/backend/internal/models"
	"github.com/trustgraph/backend/internal/service/evidencebrief"
)

// ExtractRequirements handles POST /v1/evidence/extract-requirements.
// Public, no auth. Always returns 200 unless the input is invalid — on LLM
// failure it falls back to the hardcoded default role's requirements.
func (a *API) ExtractRequirements(w http.ResponseWriter, r *http.Request) {
	var req struct {
		JobDescription string `json:"job_description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	jobDescription := strings.TrimSpace(req.JobDescription)
	if jobDescription == "" {
		writeError(w, http.StatusBadRequest, "job_description is required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
	defer cancel()

	requirements, err := evidencebrief.ExtractRequirements(ctx, a.enrichment, jobDescription)
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"requirements": evidencebrief.DefaultRole.Requirements,
			"source":       "fallback",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"requirements": requirements,
		"source":       "ai",
	})
}

type analyzeForRoleRequest struct {
	GitHubUsername string       `json:"github_username"`
	Role           *models.Role `json:"role"`
	Consent        bool         `json:"consent"`
}

// AnalyzeForRole handles POST /v1/evidence/analyze. Public, no auth.
func (a *API) AnalyzeForRole(w http.ResponseWriter, r *http.Request) {
	var req analyzeForRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if !req.Consent {
		writeError(w, http.StatusBadRequest, "consent_required")
		return
	}

	username := strings.TrimSpace(req.GitHubUsername)
	if username == "" {
		writeError(w, http.StatusBadRequest, "github_username is required")
		return
	}

	role := evidencebrief.DefaultRole
	if req.Role != nil && strings.TrimSpace(req.Role.Title) != "" && len(req.Role.Requirements) > 0 {
		role = *req.Role
	}

	cacheKey := evidencebrief.CacheKey(username, role.Title)
	if cached, ok := a.evidenceCache.Get(cacheKey); ok {
		writeJSON(w, http.StatusOK, cached)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 25*time.Second)
	defer cancel()

	stats, err := a.github.FetchStats(ctx, username)
	if err != nil {
		writeEvidenceError(w, classifyGitHubError(ctx, err))
		return
	}

	if len(stats.Repos) == 0 {
		writeEvidenceError(w, "private_or_empty")
		return
	}

	brief, err := evidencebrief.BuildBrief(ctx, a.enrichment, a.github, stats, role)
	if err != nil {
		// BuildBrief is designed to always fall back rather than error, but
		// handle defensively in case stats/role validation fails upstream.
		writeEvidenceError(w, "rate_limited")
		return
	}

	brief.Source = "live"
	a.evidenceCache.Set(cacheKey, brief)

	writeJSON(w, http.StatusOK, brief)
}

// classifyGitHubError maps a FetchStats error (and context state) to one of
// the four evidence-endpoint error_type values.
func classifyGitHubError(ctx context.Context, err error) string {
	if ctx.Err() == context.DeadlineExceeded {
		return "timeout"
	}
	msg := err.Error()
	if strings.Contains(msg, "404") {
		return "not_found"
	}
	if strings.Contains(msg, "403") || strings.Contains(strings.ToLower(msg), "rate limit") {
		return "rate_limited"
	}
	return "rate_limited"
}

func writeEvidenceError(w http.ResponseWriter, errorType string) {
	status := http.StatusBadGateway
	message := "Could not complete analysis right now."
	switch errorType {
	case "not_found":
		status = http.StatusNotFound
		message = "Could not find that GitHub user — check the username."
	case "timeout":
		status = http.StatusGatewayTimeout
		message = "Analysis timed out. Please try again."
	case "rate_limited":
		status = http.StatusTooManyRequests
		message = "GitHub or AI provider rate limit reached. Please try again shortly."
	case "private_or_empty":
		status = http.StatusUnprocessableEntity
		message = "This GitHub account has no public repositories to analyze."
	}

	writeJSON(w, status, map[string]interface{}{
		"error_type":         errorType,
		"message":            message,
		"snapshot_available": true,
		"snapshot_handle":    "rishicds",
	})
}

// EvidenceSnapshot handles GET /v1/evidence/snapshot/{handle}. Public, no auth.
func (a *API) EvidenceSnapshot(w http.ResponseWriter, r *http.Request) {
	handle := r.PathValue("handle")
	brief, ok := evidencebrief.SnapshotBrief(handle)
	if !ok {
		writeError(w, http.StatusNotFound, "no saved snapshot for this handle")
		return
	}
	writeJSON(w, http.StatusOK, brief)
}
