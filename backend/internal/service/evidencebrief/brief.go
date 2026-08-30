package evidencebrief

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/trustgraph/backend/internal/models"
	"github.com/trustgraph/backend/internal/service/enrichment"
	"github.com/trustgraph/backend/internal/service/github"
)

const maxConcurrentReadmeFetches = 4

// DefaultRole is the hardcoded fallback role used when a caller doesn't
// supply one (or the frontend's prepared demo role).
var DefaultRole = models.Role{
	Title: "Backend Engineer — Marketplace Platform",
	Requirements: []models.Requirement{
		{ID: "backend-lang", Label: "Go or another relevant backend language", Priority: "required"},
		{ID: "api-design", Label: "API design", Priority: "required"},
		{ID: "distributed-systems", Label: "Distributed systems", Priority: "required"},
		{ID: "testing-quality", Label: "Testing and engineering quality", Priority: "required"},
		{ID: "production-ownership", Label: "Production ownership", Priority: "preferred"},
		{ID: "collaboration", Label: "Collaboration and technical communication", Priority: "preferred"},
	},
}

// llmBriefSections mirrors the JSON schema we instruct the LLM to return —
// everything in EvidenceBrief except the fields we fill in ourselves
// (source, candidate, role, generated_at, sources_analyzed).
type llmBriefSections struct {
	Summary            string                     `json:"summary"`
	TechnicalAreas     []string                   `json:"technical_areas"`
	RequirementMatches []models.RequirementMatch  `json:"requirement_matches"`
	EvidenceCards      []models.EvidenceCard      `json:"evidence_cards"`
	Timeline           []models.TimelineEntry     `json:"timeline"`
	Limitations        []string                   `json:"limitations"`
	InterviewQuestions []models.InterviewQuestion `json:"interview_questions"`
}

// BuildBrief selects representative repos for the candidate, fetches their
// READMEs, and asks the LLM to synthesize an evidence brief against the
// given role. If the LLM is unavailable or fails, it ALWAYS falls back to a
// deterministic, GitHub-facts-only brief rather than returning an error.
func BuildBrief(ctx context.Context, agent *enrichment.Agent, githubClient *github.Client, stats *github.Stats, role models.Role) (*models.EvidenceBrief, error) {
	if stats == nil {
		return nil, fmt.Errorf("stats required")
	}
	if strings.TrimSpace(role.Title) == "" || len(role.Requirements) == 0 {
		role = DefaultRole
	}

	selected := SelectRepresentativeRepos(stats.Repos)
	readmes := fetchReadmesConcurrently(ctx, githubClient, stats.User.Login, selected)

	base := models.EvidenceBrief{
		Source: "live",
		Candidate: models.EvidenceCandidate{
			GitHubUsername: stats.User.Login,
			DisplayName:    stats.User.Name,
			AvatarURL:      stats.User.AvatarURL,
			GitHubURL:      stats.User.HTMLURL,
		},
		Role:            role,
		GeneratedAt:     time.Now().UTC(),
		SourcesAnalyzed: len(selected),
	}

	if agent == nil {
		log.Printf("evidencebrief: no enrichment agent configured, using deterministic fallback brief for %s", stats.User.Login)
		return fallbackBrief(base, stats, role, selected), nil
	}

	sections, err := generateBriefSections(ctx, agent, role, selected, readmes)
	if err != nil {
		log.Printf("evidencebrief: LLM synthesis failed for %s, using deterministic fallback: %v", stats.User.Login, err)
		return fallbackBrief(base, stats, role, selected), nil
	}

	brief := base
	brief.Summary = sections.Summary
	brief.TechnicalAreas = sections.TechnicalAreas
	brief.RequirementMatches = sections.RequirementMatches
	brief.EvidenceCards = ensureEvidenceCardIDs(sections.EvidenceCards)
	brief.Timeline = sections.Timeline
	brief.Limitations = sections.Limitations
	brief.InterviewQuestions = sections.InterviewQuestions

	if len(brief.RequirementMatches) == 0 || len(brief.EvidenceCards) == 0 {
		log.Printf("evidencebrief: LLM response missing required sections for %s, using deterministic fallback", stats.User.Login)
		return fallbackBrief(base, stats, role, selected), nil
	}

	return &brief, nil
}

func generateBriefSections(ctx context.Context, agent *enrichment.Agent, role models.Role, repos []github.Repo, readmes map[string]string) (*llmBriefSections, error) {
	prompt := BuildBriefPrompt(role, repos, readmes)
	raw, err := agent.GenerateJSON(ctx, briefSystemPrompt, prompt, 8192)
	if err != nil {
		return nil, err
	}

	cleaned := stripJSONFences(raw)
	var sections llmBriefSections
	if err := json.Unmarshal(cleaned, &sections); err != nil {
		return nil, fmt.Errorf("parse evidence brief json: %w (raw: %s)", err, truncate(string(cleaned), 300))
	}
	return &sections, nil
}

// stripJSONFences defensively removes markdown code fences the LLM may wrap
// its JSON response in, mirroring the same handling already done inside the
// gemini/nvidia clients (belt-and-braces in case a future provider doesn't).
func stripJSONFences(raw []byte) []byte {
	s := strings.TrimSpace(string(raw))
	s = strings.TrimPrefix(s, "```json")
	s = strings.TrimPrefix(s, "```")
	s = strings.TrimSuffix(s, "```")
	return []byte(strings.TrimSpace(s))
}

func ensureEvidenceCardIDs(cards []models.EvidenceCard) []models.EvidenceCard {
	for i := range cards {
		if strings.TrimSpace(cards[i].ID) == "" {
			cards[i].ID = fmt.Sprintf("ev-%d", i)
		}
	}
	return cards
}

// fallbackBrief builds a deterministic, AI-free brief directly from raw
// GitHub facts. It always succeeds and never mentions AI synthesis in the
// forbidden-phrase sense — it simply states plainly that AI synthesis was
// unavailable and evidence requires manual review.
func fallbackBrief(base models.EvidenceBrief, stats *github.Stats, role models.Role, repos []github.Repo) *models.EvidenceBrief {
	brief := base

	technicalAreas := make([]string, 0, len(stats.Languages))
	for lang := range stats.Languages {
		technicalAreas = append(technicalAreas, lang)
	}
	sort.Slice(technicalAreas, func(i, j int) bool {
		return stats.Languages[technicalAreas[i]] > stats.Languages[technicalAreas[j]]
	})
	if len(technicalAreas) > 8 {
		technicalAreas = technicalAreas[:8]
	}
	brief.TechnicalAreas = technicalAreas

	cards := make([]models.EvidenceCard, 0, len(repos))
	for i, r := range repos {
		lang := r.Language
		if lang == "" {
			lang = "unspecified language"
		}
		claim := fmt.Sprintf("%s (%s, %d stars)", r.Name, lang, r.Stars)
		explanation := "Repository metadata retrieved directly from GitHub's public API."
		if r.Description != "" {
			explanation = r.Description
		}
		date := ""
		last := r.PushedAt
		if last.IsZero() {
			last = r.UpdatedAt
		}
		if !last.IsZero() {
			date = last.Format("2006-01-02")
		}
		cards = append(cards, models.EvidenceCard{
			ID:           fmt.Sprintf("ev-%d", i),
			Claim:        claim,
			Explanation:  explanation,
			ArtifactName: r.Name,
			SourceURL:    r.HTMLURL,
			Date:         date,
			Kind:         "direct",
			Confidence:   "high",
		})
	}
	brief.EvidenceCards = cards

	cardIDs := make([]string, len(cards))
	for i, c := range cards {
		cardIDs[i] = c.ID
	}

	matches := make([]models.RequirementMatch, 0, len(role.Requirements))
	for _, req := range role.Requirements {
		matches = append(matches, models.RequirementMatch{
			RequirementID:   req.ID,
			State:           models.EvidenceStateNeedsConfirm,
			Explanation:     "AI synthesis unavailable — evidence requires manual review. Absence of an automated match is not evidence of absence of this skill; review the linked repositories directly.",
			EvidenceCardIDs: cardIDs,
		})
	}
	brief.RequirementMatches = matches

	brief.Summary = fmt.Sprintf(
		"Automated synthesis was unavailable for this brief. Below are %d representative public repositories retrieved directly from GitHub for @%s, provided as raw evidence for manual review against the %q role.",
		len(repos), stats.User.Login, role.Title,
	)

	brief.Limitations = []string{
		"AI synthesis unavailable — evidence requires manual review.",
		"This brief reflects only public GitHub repository metadata; it does not include README content analysis or requirement-specific interpretation.",
		"Absence of evidence for a requirement is not evidence of absence of that skill.",
	}

	brief.InterviewQuestions = nil
	brief.Timeline = nil

	return &brief
}

func fetchReadmesConcurrently(ctx context.Context, client *github.Client, owner string, repos []github.Repo) map[string]string {
	readmes := make(map[string]string, len(repos))
	if client == nil || len(repos) == 0 {
		return readmes
	}

	var mu sync.Mutex
	var wg sync.WaitGroup
	sem := make(chan struct{}, maxConcurrentReadmeFetches)

	for _, repo := range repos {
		wg.Add(1)
		go func(r github.Repo) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			content, err := client.FetchReadme(ctx, owner, r.Name)
			if err != nil || content == "" {
				return
			}
			mu.Lock()
			readmes[r.Name] = content
			mu.Unlock()
		}(repo)
	}

	wg.Wait()
	return readmes
}

// ExtractRequirements asks the LLM to extract structured requirements from a
// pasted job description. Callers should fall back to DefaultRole.Requirements
// on error.
func ExtractRequirements(ctx context.Context, agent *enrichment.Agent, jobDescription string) ([]models.Requirement, error) {
	if agent == nil {
		return nil, fmt.Errorf("no enrichment agent configured")
	}
	if strings.TrimSpace(jobDescription) == "" {
		return nil, fmt.Errorf("job_description required")
	}

	raw, err := agent.GenerateJSON(ctx, requirementsSystemPrompt, BuildRequirementsPrompt(jobDescription), 2048)
	if err != nil {
		return nil, err
	}

	cleaned := stripJSONFences(raw)
	var parsed struct {
		Requirements []models.Requirement `json:"requirements"`
	}
	if err := json.Unmarshal(cleaned, &parsed); err != nil {
		return nil, fmt.Errorf("parse requirements json: %w", err)
	}
	if len(parsed.Requirements) == 0 {
		return nil, fmt.Errorf("no requirements extracted")
	}
	return parsed.Requirements, nil
}
