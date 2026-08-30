package evidencebrief

import (
	"testing"
	"time"

	"github.com/trustgraph/backend/internal/service/github"
)

func TestSelectRepresentativeReposExcludesForksAndArchived(t *testing.T) {
	now := time.Now().UTC()
	repos := []github.Repo{
		{Name: "normal", PushedAt: now, Stars: 10},
		{Name: "a-fork", PushedAt: now, Stars: 100, Fork: true},
		{Name: "archived-repo", PushedAt: now, Stars: 100, Archived: true},
	}

	selected := SelectRepresentativeRepos(repos)

	if len(selected) != 1 {
		t.Fatalf("expected 1 selected repo, got %d", len(selected))
	}
	if selected[0].Name != "normal" {
		t.Fatalf("expected 'normal' repo to be selected, got %q", selected[0].Name)
	}
}

func TestSelectRepresentativeReposOrdersByRecencyStarsAndDocs(t *testing.T) {
	now := time.Now().UTC()
	repos := []github.Repo{
		{
			Name:     "stale-undocumented",
			PushedAt: now.AddDate(-2, 0, 0),
			Stars:    1,
		},
		{
			Name:        "fresh-documented",
			PushedAt:    now,
			Stars:       50,
			Description: "A well documented project",
			Topics:      []string{"go", "backend", "api"},
		},
		{
			Name:     "mid-range",
			PushedAt: now.AddDate(0, -6, 0),
			Stars:    20,
		},
	}

	selected := SelectRepresentativeRepos(repos)

	if len(selected) != 3 {
		t.Fatalf("expected 3 selected repos, got %d", len(selected))
	}
	if selected[0].Name != "fresh-documented" {
		t.Fatalf("expected 'fresh-documented' to rank first, got %q", selected[0].Name)
	}
	if selected[len(selected)-1].Name != "stale-undocumented" {
		t.Fatalf("expected 'stale-undocumented' to rank last, got %q", selected[len(selected)-1].Name)
	}
}

func TestSelectRepresentativeReposCapsAtEightWithoutZeroPadding(t *testing.T) {
	now := time.Now().UTC()

	// Fewer than 8 qualifying repos: must not zero-pad.
	few := make([]github.Repo, 0, 3)
	for i := 0; i < 3; i++ {
		few = append(few, github.Repo{Name: "repo", PushedAt: now})
	}
	selectedFew := SelectRepresentativeRepos(few)
	if len(selectedFew) != 3 {
		t.Fatalf("expected 3 repos (no zero-padding), got %d", len(selectedFew))
	}

	// More than 8 qualifying repos: must cap at 8.
	many := make([]github.Repo, 0, 15)
	for i := 0; i < 15; i++ {
		many = append(many, github.Repo{Name: "repo", PushedAt: now})
	}
	selectedMany := SelectRepresentativeRepos(many)
	if len(selectedMany) != 8 {
		t.Fatalf("expected cap of 8 repos, got %d", len(selectedMany))
	}
}

func TestSelectRepresentativeReposHandlesEmptyInput(t *testing.T) {
	selected := SelectRepresentativeRepos(nil)
	if len(selected) != 0 {
		t.Fatalf("expected 0 repos for empty input, got %d", len(selected))
	}
}
