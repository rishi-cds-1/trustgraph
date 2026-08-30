package models

import "time"

// Requirement is a single role requirement (either extracted from a pasted
// job description or the hardcoded default role) used to drive an
// EvidenceBrief's requirement_matches section.
type Requirement struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	Priority string `json:"priority"` // "required" | "preferred"
}

// Role describes a role/job posting being evaluated against a candidate's
// public evidence.
type Role struct {
	Title        string        `json:"title"`
	Requirements []Requirement `json:"requirements"`
}

type EvidenceState string

const (
	EvidenceStateStrongDirect EvidenceState = "strong_direct_evidence"
	EvidenceStateRelevant     EvidenceState = "relevant_evidence"
	EvidenceStatePartial      EvidenceState = "partial_evidence"
	EvidenceStateInsufficient EvidenceState = "insufficient_evidence"
	EvidenceStateNeedsConfirm EvidenceState = "requires_confirmation"
)

type RequirementMatch struct {
	RequirementID   string        `json:"requirement_id"`
	State           EvidenceState `json:"state"`
	Explanation     string        `json:"explanation"`
	EvidenceCardIDs []string      `json:"evidence_card_ids"`
}

type EvidenceCard struct {
	ID              string `json:"id"`
	Claim           string `json:"claim"`
	Explanation     string `json:"explanation"`
	ArtifactName    string `json:"artifact_name"`
	SourceURL       string `json:"source_url"`
	FileOrCommitRef string `json:"file_or_commit_ref,omitempty"`
	Date            string `json:"date,omitempty"`
	Kind            string `json:"kind"`       // "direct" | "ai_interpretation"
	Confidence      string `json:"confidence"` // "high" | "medium" | "low"
}

type TimelineEntry struct {
	Date        string `json:"date"`
	Label       string `json:"label"`
	Description string `json:"description"`
	SourceURL   string `json:"source_url,omitempty"`
}

type InterviewQuestion struct {
	Question           string `json:"question"`
	MotivatingArtifact string `json:"motivating_artifact"`
	SourceURL          string `json:"source_url"`
	WhatItSurfaces     string `json:"what_it_surfaces"`
}

type EvidenceCandidate struct {
	GitHubUsername string `json:"github_username"`
	DisplayName    string `json:"display_name"`
	AvatarURL      string `json:"avatar_url"`
	GitHubURL      string `json:"github_url"`
}

type EvidenceBrief struct {
	Source             string              `json:"source"` // "live" | "snapshot"
	Candidate          EvidenceCandidate   `json:"candidate"`
	Role               Role                `json:"role"`
	GeneratedAt        time.Time           `json:"generated_at"`
	SourcesAnalyzed    int                 `json:"sources_analyzed"`
	Summary            string              `json:"summary"`
	TechnicalAreas     []string            `json:"technical_areas"`
	RequirementMatches []RequirementMatch  `json:"requirement_matches"`
	EvidenceCards      []EvidenceCard      `json:"evidence_cards"`
	Timeline           []TimelineEntry     `json:"timeline"`
	Limitations        []string            `json:"limitations"`
	InterviewQuestions []InterviewQuestion `json:"interview_questions"`
}
