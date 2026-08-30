package evidencebrief

import (
	"fmt"
	"strings"

	"github.com/trustgraph/backend/internal/models"
	"github.com/trustgraph/backend/internal/service/github"
)

const briefSystemPrompt = `You are TrustGraph's evidence analyst. Your job is to read a candidate's public
GitHub artifacts (repo metadata and README excerpts) and produce a neutral, evidence-grounded
brief that helps a hiring team understand what is and is not demonstrated in public work — for
a specific role's requirements.

Hard rules you MUST follow:
- Never use the phrases: "Trust Score", "best candidate", "top candidate", "risky candidate", "hire", "reject", "the candidate lacks", "recruiters overlook", "resumes are broken".
- Every requirement_matches[].state must be exactly one of: strong_direct_evidence, relevant_evidence, partial_evidence, insufficient_evidence, requires_confirmation.
- Every evidence_card must cite one of the provided repo names/URLs. Never invent a repository, technology, or fact not present in the supplied data.
- Missing evidence must be described neutrally. Absence of evidence is not evidence of absence of skill — say so explicitly when a requirement has weak or no direct support instead of implying the person lacks the skill.
- Each evidence_card's "kind" must be "direct" (a directly observable fact, e.g. "this repo uses Go and has an actively maintained test suite") or "ai_interpretation" (an inference, e.g. "suggests familiarity with distributed systems patterns").
- Output must be a single JSON object, no prose, no markdown fences, matching exactly this schema:

{
  "summary": "string, 2-4 neutral sentences describing the overall body of public work",
  "technical_areas": ["string", "..."],
  "requirement_matches": [
    {
      "requirement_id": "string, must match one of the provided requirement ids exactly",
      "state": "strong_direct_evidence|relevant_evidence|partial_evidence|insufficient_evidence|requires_confirmation",
      "explanation": "string, neutral, evidence-grounded explanation",
      "evidence_card_ids": ["ev-0", "..."]
    }
  ],
  "evidence_cards": [
    {
      "id": "string, e.g. ev-0",
      "claim": "string, short factual or interpretive claim",
      "explanation": "string, supporting detail",
      "artifact_name": "string, must be one of the provided repo names",
      "source_url": "string, must be one of the provided repo URLs",
      "file_or_commit_ref": "string, optional",
      "date": "string, optional, e.g. the repo's last-pushed date",
      "kind": "direct|ai_interpretation",
      "confidence": "high|medium|low"
    }
  ],
  "timeline": [
    {
      "date": "string, e.g. 2025-03",
      "label": "string, short label",
      "description": "string",
      "source_url": "string, optional"
    }
  ],
  "limitations": ["string, ..."],
  "interview_questions": [
    {
      "question": "string, must reference a specific artifact from the supplied repos, e.g. \"You implemented X in Project Y. What trade-offs did you encounter between A and B?\" — must NOT be generic trivia or a psychological assessment question",
      "motivating_artifact": "string, the repo/file this question is grounded in",
      "source_url": "string",
      "what_it_surfaces": "string, what the answer would reveal"
    }
  ]
}

Provide exactly one requirement_match per requirement id given to you. Provide 3-5 interview_questions.
Every evidence_card_ids value referenced in requirement_matches must correspond to an id present in evidence_cards.`

// BuildBriefPrompt assembles the single user prompt sent to the LLM: the
// role + requirements, followed by the selected repos (with README excerpts).
func BuildBriefPrompt(role models.Role, repos []github.Repo, readmes map[string]string) string {
	var b strings.Builder

	fmt.Fprintf(&b, "Role: %s\n\n", role.Title)
	b.WriteString("Requirements:\n")
	for _, req := range role.Requirements {
		fmt.Fprintf(&b, "- id=%s priority=%s label=%q\n", req.ID, req.Priority, req.Label)
	}

	b.WriteString("\nCandidate's selected public repositories (use ONLY these facts; do not invent others):\n")
	for _, repo := range repos {
		fmt.Fprintf(&b, "\n--- Repo: %s ---\n", repo.Name)
		fmt.Fprintf(&b, "URL: %s\n", repo.HTMLURL)
		if repo.Description != "" {
			fmt.Fprintf(&b, "Description: %s\n", repo.Description)
		}
		if len(repo.Topics) > 0 {
			fmt.Fprintf(&b, "Topics: %s\n", strings.Join(repo.Topics, ", "))
		}
		if repo.Language != "" {
			fmt.Fprintf(&b, "Primary language: %s\n", repo.Language)
		}
		fmt.Fprintf(&b, "Stars: %d\n", repo.Stars)
		last := repo.PushedAt
		if last.IsZero() {
			last = repo.UpdatedAt
		}
		if !last.IsZero() {
			fmt.Fprintf(&b, "Last pushed: %s\n", last.Format("2006-01-02"))
		}
		if readme := strings.TrimSpace(readmes[repo.Name]); readme != "" {
			fmt.Fprintf(&b, "README excerpt:\n%s\n", truncate(readme, 1500))
		}
	}

	b.WriteString("\nReturn ONLY the JSON object described in the system prompt. No prose, no markdown fences.")
	return b.String()
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max]
}

const requirementsSystemPrompt = `You are TrustGraph's evidence analyst. You will be given a pasted job description.
Extract 5-8 concrete requirements from it. Infer priority from language: phrases like "must have",
"required", "need" imply "required"; phrases like "nice to have", "bonus", "preferred", "a plus"
imply "preferred". When priority is ambiguous, default to "preferred".

Return ONLY a JSON object of the form:
{"requirements": [{"id": "short-slug-like-id", "label": "string", "priority": "required|preferred"}]}

Ids must be short, lowercase, hyphenated slugs derived from the label (e.g. "api-design"). No prose, no markdown fences.`

// BuildRequirementsPrompt wraps a pasted job description for requirement extraction.
func BuildRequirementsPrompt(jobDescription string) string {
	return "Job description:\n\n" + strings.TrimSpace(jobDescription)
}
