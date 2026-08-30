package evidencebrief

import (
	"context"
	"testing"
	"time"

	"github.com/trustgraph/backend/internal/models"
	"github.com/trustgraph/backend/internal/service/github"
)

func TestBuildBriefFallsBackDeterministicallyWithNilAgent(t *testing.T) {
	now := time.Now().UTC()
	stats := &github.Stats{
		User: github.UserProfile{
			Login:     "octocat",
			Name:      "Octo Cat",
			AvatarURL: "https://example.com/avatar.png",
			HTMLURL:   "https://github.com/octocat",
		},
		Repos: []github.Repo{
			{Name: "repo-one", Language: "Go", Stars: 12, PushedAt: now, HTMLURL: "https://github.com/octocat/repo-one", Description: "A Go service"},
			{Name: "repo-two", Language: "TypeScript", Stars: 5, PushedAt: now.AddDate(0, -1, 0), HTMLURL: "https://github.com/octocat/repo-two"},
		},
		Languages: map[string]int{"Go": 1, "TypeScript": 1},
	}

	brief, err := BuildBrief(context.Background(), nil, nil, stats, DefaultRole)
	if err != nil {
		t.Fatalf("expected no error with nil agent, got: %v", err)
	}
	if brief == nil {
		t.Fatal("expected a non-nil brief")
	}

	if brief.Candidate.GitHubUsername != "octocat" {
		t.Fatalf("expected candidate username 'octocat', got %q", brief.Candidate.GitHubUsername)
	}
	if len(brief.EvidenceCards) != 2 {
		t.Fatalf("expected 2 evidence cards from raw repo facts, got %d", len(brief.EvidenceCards))
	}
	for _, card := range brief.EvidenceCards {
		if card.Kind != "direct" {
			t.Fatalf("expected fallback evidence cards to be kind=direct, got %q", card.Kind)
		}
		if card.SourceURL == "" {
			t.Fatal("expected fallback evidence card to have a source_url")
		}
	}

	if len(brief.RequirementMatches) != len(DefaultRole.Requirements) {
		t.Fatalf("expected one requirement match per requirement, got %d", len(brief.RequirementMatches))
	}
	for _, match := range brief.RequirementMatches {
		if match.State != models.EvidenceStateNeedsConfirm {
			t.Fatalf("expected fallback requirement matches to be requires_confirmation, got %q", match.State)
		}
	}

	if len(brief.Limitations) == 0 {
		t.Fatal("expected fallback brief to include limitations")
	}

	if brief.SourcesAnalyzed != 2 {
		t.Fatalf("expected sources_analyzed=2, got %d", brief.SourcesAnalyzed)
	}
}

func TestBuildBriefRequiresStats(t *testing.T) {
	_, err := BuildBrief(context.Background(), nil, nil, nil, DefaultRole)
	if err == nil {
		t.Fatal("expected an error when stats is nil")
	}
}

func TestBuildBriefDefaultsRoleWhenEmpty(t *testing.T) {
	now := time.Now().UTC()
	stats := &github.Stats{
		User: github.UserProfile{Login: "someone"},
		Repos: []github.Repo{
			{Name: "repo", PushedAt: now, HTMLURL: "https://github.com/someone/repo"},
		},
	}

	brief, err := BuildBrief(context.Background(), nil, nil, stats, models.Role{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if brief.Role.Title != DefaultRole.Title {
		t.Fatalf("expected default role title, got %q", brief.Role.Title)
	}
}

func TestSnapshotBriefOnlyKnowsRishicds(t *testing.T) {
	brief, ok := SnapshotBrief("RishiCDS")
	if !ok || brief == nil {
		t.Fatal("expected a snapshot brief for rishicds (case-insensitive)")
	}
	if brief.Source != "snapshot" {
		t.Fatalf("expected source=snapshot, got %q", brief.Source)
	}

	_, ok = SnapshotBrief("someone-else")
	if ok {
		t.Fatal("expected no snapshot brief for an unknown handle")
	}
}

func TestCacheGetSetAndExpiry(t *testing.T) {
	c := NewCache()
	key := CacheKey("octocat", "Backend Engineer")

	if _, ok := c.Get(key); ok {
		t.Fatal("expected cache miss before Set")
	}

	brief := &models.EvidenceBrief{Source: "live", Candidate: models.EvidenceCandidate{GitHubUsername: "octocat"}}
	c.Set(key, brief)

	got, ok := c.Get(key)
	if !ok || got.Candidate.GitHubUsername != "octocat" {
		t.Fatal("expected cache hit after Set")
	}

	// Force expiry.
	c.mu.Lock()
	entry := c.entries[key]
	entry.expiresAt = time.Now().Add(-time.Minute)
	c.entries[key] = entry
	c.mu.Unlock()

	if _, ok := c.Get(key); ok {
		t.Fatal("expected cache miss after expiry")
	}
}
