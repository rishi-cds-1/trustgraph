package evidencebrief

import (
	"strings"
	"sync"
	"time"

	"github.com/trustgraph/backend/internal/models"
)

const cacheTTL = 30 * time.Minute

type cacheEntry struct {
	brief     *models.EvidenceBrief
	expiresAt time.Time
}

// Cache is a simple in-process TTL cache for evidence briefs, keyed by
// "githubUsername|roleTitle". It is not cryptographically keyed and is not
// shared across processes — good enough for a hackathon demo to avoid
// re-hitting GitHub/LLM APIs on repeated requests for the same pairing.
type Cache struct {
	mu      sync.Mutex
	entries map[string]cacheEntry
}

func NewCache() *Cache {
	return &Cache{entries: make(map[string]cacheEntry)}
}

func CacheKey(githubUsername, roleTitle string) string {
	return strings.ToLower(strings.TrimSpace(githubUsername)) + "|" + strings.ToLower(strings.TrimSpace(roleTitle))
}

func (c *Cache) Get(key string) (*models.EvidenceBrief, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	entry, ok := c.entries[key]
	if !ok {
		return nil, false
	}
	if time.Now().After(entry.expiresAt) {
		delete(c.entries, key)
		return nil, false
	}
	return entry.brief, true
}

func (c *Cache) Set(key string, brief *models.EvidenceBrief) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.entries[key] = cacheEntry{
		brief:     brief,
		expiresAt: time.Now().Add(cacheTTL),
	}
}

// snapshotHandle is the only GitHub handle with a hardcoded demo snapshot.
const snapshotHandle = "rishicds"

// snapshotGeneratedAt is a fixed past timestamp representing when this
// snapshot was "captured" — intentionally not time.Now(), since a snapshot
// should read as a point-in-time artifact rather than always-fresh.
var snapshotGeneratedAt = time.Date(2026, 8, 15, 9, 30, 0, 0, time.UTC)

// SnapshotBrief returns a hardcoded, well-formed demo brief for the given
// handle. It returns (nil, false) for any handle other than the featured
// demo account "rishicds" (case-insensitive).
func SnapshotBrief(handle string) (*models.EvidenceBrief, bool) {
	if strings.ToLower(strings.TrimSpace(handle)) != snapshotHandle {
		return nil, false
	}
	return buildRishicdsSnapshot(), true
}

func buildRishicdsSnapshot() *models.EvidenceBrief {
	role := DefaultRole

	cards := []models.EvidenceCard{
		{
			ID:           "ev-0",
			Claim:        "trust-graph (Go, TypeScript) implements a layered REST API with a Chi router, service layer, and MongoDB repository layer.",
			Explanation:  "The repository separates HTTP handlers, business logic, and data access into distinct packages, and exposes versioned /v1 routes.",
			ArtifactName: "trust-graph",
			SourceURL:    "https://github.com/rishicds/trust-graph",
			Date:         "2026-08-10",
			Kind:         "direct",
			Confidence:   "high",
		},
		{
			ID:           "ev-1",
			Claim:        "trust-graph integrates multiple third-party APIs (GitHub, Gemini, NVIDIA) with fallback logic between providers.",
			Explanation:  "The enrichment service tries a primary LLM provider and falls back to a secondary provider on failure, suggesting attention to production resilience.",
			ArtifactName: "trust-graph",
			SourceURL:    "https://github.com/rishicds/trust-graph",
			Date:         "2026-08-10",
			Kind:         "ai_interpretation",
			Confidence:   "medium",
		},
		{
			ID:           "ev-2",
			Claim:        "Public repositories show consistent use of Go modules, table-driven tests, and CLI tooling under cmd/.",
			Explanation:  "Multiple standalone command entry points (e.g. seed-shadows, recompute-scores) point to operational/maintenance tooling built alongside the main service.",
			ArtifactName: "trust-graph",
			SourceURL:    "https://github.com/rishicds/trust-graph",
			Kind:         "ai_interpretation",
			Confidence:   "medium",
		},
	}

	matches := []models.RequirementMatch{
		{
			RequirementID:   "backend-lang",
			State:           models.EvidenceStateStrongDirect,
			Explanation:     "Primary public work is written in Go, including a multi-package REST API service.",
			EvidenceCardIDs: []string{"ev-0"},
		},
		{
			RequirementID:   "api-design",
			State:           models.EvidenceStateStrongDirect,
			Explanation:     "The repository exposes a versioned REST API with a clear handler/service/repository separation.",
			EvidenceCardIDs: []string{"ev-0"},
		},
		{
			RequirementID:   "distributed-systems",
			State:           models.EvidenceStateRelevant,
			Explanation:     "Multi-provider API integration with fallback logic is relevant but does not directly demonstrate distributed-systems experience such as consensus, sharding, or queuing infrastructure.",
			EvidenceCardIDs: []string{"ev-1"},
		},
		{
			RequirementID:   "testing-quality",
			State:           models.EvidenceStatePartial,
			Explanation:     "Table-driven Go tests are present in at least one package; broader test coverage across the codebase was not independently verified from the artifacts reviewed.",
			EvidenceCardIDs: []string{"ev-2"},
		},
		{
			RequirementID:   "production-ownership",
			State:           models.EvidenceStateRelevant,
			Explanation:     "Maintenance CLIs (seeding, rescraping, recomputation) suggest hands-on operational involvement beyond feature code.",
			EvidenceCardIDs: []string{"ev-2"},
		},
		{
			RequirementID:   "collaboration",
			State:           models.EvidenceStateInsufficient,
			Explanation:     "Public repository data alone does not surface collaboration signals such as code review activity or team communication; this is not evidence the skill is absent.",
			EvidenceCardIDs: []string{},
		},
	}

	timeline := []models.TimelineEntry{
		{Date: "2026-08-10", Label: "trust-graph active development", Description: "Layered Go backend with REST API, LLM enrichment pipeline, and MongoDB persistence.", SourceURL: "https://github.com/rishicds/trust-graph"},
	}

	questions := []models.InterviewQuestion{
		{
			Question:           "In trust-graph, the enrichment agent tries Gemini first and falls back to NVIDIA on failure. What trade-offs did you weigh between provider ordering and response consistency?",
			MotivatingArtifact: "trust-graph enrichment agent",
			SourceURL:          "https://github.com/rishicds/trust-graph",
			WhatItSurfaces:     "Reasoning about resilience trade-offs in multi-provider integrations.",
		},
		{
			Question:           "The repository layer sits between services and MongoDB. Walk through a case where a schema change would have required touching multiple layers, and how you would have contained the blast radius.",
			MotivatingArtifact: "trust-graph repository layer",
			SourceURL:          "https://github.com/rishicds/trust-graph",
			WhatItSurfaces:     "API/data layer design judgment and change-management awareness.",
		},
		{
			Question:           "Several cmd/ tools exist for maintenance tasks like reseeding and rescraping. What led you to build these as separate CLIs rather than admin endpoints?",
			MotivatingArtifact: "trust-graph cmd/ tools",
			SourceURL:          "https://github.com/rishicds/trust-graph",
			WhatItSurfaces:     "Production-ownership thinking and operational tooling choices.",
		},
	}

	return &models.EvidenceBrief{
		Source: "snapshot",
		Candidate: models.EvidenceCandidate{
			GitHubUsername: "rishicds",
			DisplayName:    "Rishi",
			AvatarURL:      "https://avatars.githubusercontent.com/rishicds",
			GitHubURL:      "https://github.com/rishicds",
		},
		Role:               role,
		GeneratedAt:        snapshotGeneratedAt,
		SourcesAnalyzed:    1,
		Summary:            "Public work centers on a layered Go backend service (trust-graph) with a REST API, multi-provider LLM enrichment pipeline, and MongoDB persistence, alongside several standalone CLI tools for operational maintenance tasks.",
		TechnicalAreas:     []string{"Go", "TypeScript", "REST API design", "MongoDB", "LLM integration"},
		RequirementMatches: matches,
		EvidenceCards:      cards,
		Timeline:           timeline,
		Limitations: []string{
			"This is a saved snapshot brief, not a live analysis — it may not reflect the account's current public activity.",
			"Analysis is based on a single representative repository; a live run would sample across more of the account's public repositories.",
			"Absence of evidence for a requirement is not evidence of absence of that skill.",
		},
		InterviewQuestions: questions,
	}
}
