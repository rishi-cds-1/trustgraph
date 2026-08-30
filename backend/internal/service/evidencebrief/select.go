package evidencebrief

import (
	"sort"
	"time"

	"github.com/trustgraph/backend/internal/service/github"
)

const (
	minRepresentativeRepos = 5
	maxRepresentativeRepos = 8
)

// SelectRepresentativeRepos filters out forks and archived repos, scores the
// remainder by a mix of recency, popularity, and documentation quality (a
// proxy for how well the repo can be understood from the outside), and
// returns the top 5-8 repos. It never zero-pads: if fewer than 5 qualifying
// repos exist, it returns however many there are.
func SelectRepresentativeRepos(repos []github.Repo) []github.Repo {
	candidates := make([]github.Repo, 0, len(repos))
	for _, r := range repos {
		if r.Fork || r.Archived {
			continue
		}
		candidates = append(candidates, r)
	}

	sort.SliceStable(candidates, func(i, j int) bool {
		return repoScore(candidates[i]) > repoScore(candidates[j])
	})

	limit := maxRepresentativeRepos
	if len(candidates) < limit {
		limit = len(candidates)
	}
	return candidates[:limit]
}

// repoScore combines recency, stars, and documentation-quality signals into
// a single comparable score. It is intentionally simple and deterministic.
func repoScore(r github.Repo) float64 {
	score := 0.0

	// Recency: favor repos pushed more recently. Use PushedAt, falling back
	// to UpdatedAt if PushedAt is zero (defensive against API variance).
	last := r.PushedAt
	if last.IsZero() {
		last = r.UpdatedAt
	}
	if !last.IsZero() {
		daysAgo := time.Since(last).Hours() / 24
		if daysAgo < 0 {
			daysAgo = 0
		}
		// Decays from 100 (pushed today) toward 0 over ~2 years.
		recencyScore := 100 - (daysAgo / 730 * 100)
		if recencyScore < 0 {
			recencyScore = 0
		}
		score += recencyScore
	}

	// Popularity: stars, log-dampened isn't necessary at hackathon scale —
	// keep it simple and linear but capped so one viral repo doesn't dominate.
	stars := float64(r.Stars)
	if stars > 200 {
		stars = 200
	}
	score += stars

	// Documentation quality proxy: description + topics presence.
	if r.Description != "" {
		score += 20
	}
	if len(r.Topics) > 0 {
		score += 10 + float64(min(len(r.Topics), 5))*2
	}

	return score
}
