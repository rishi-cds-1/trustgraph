// Mock "pre-entry" early-talent pool — students who pre-registered a passport
// while still in school (graduating 2029). Demo data only: shaped as real
// CandidateSearchResult objects so the AI foresight engine runs on them
// unchanged. Early talent is exactly where foresight shines — you're hiring on
// trajectory and potential, not a long track record.

import type { CandidateSearchResult } from "@/lib/api";

export type EarlyTalentCandidate = CandidateSearchResult & {
  grad_year: number;
  school: string;
  program: string;
  availability: string;
  location: string;
  interests: string[];
};

const now = "2026-09-01T00:00:00Z";

function make(
  base: {
    handle: string;
    display_name: string;
    headline: string;
    overall: number;
    dims: [number, number, number, number]; // evidence_depth, consistency, peer, impact
    evidence_count: number;
    capabilities: [string, number, boolean][];
    highlights: string[];
    signals: { category: string; label: string; detail: string; source?: string; weight?: number }[];
  } & Omit<EarlyTalentCandidate, keyof CandidateSearchResult | "interests"> & { interests: string[] },
): EarlyTalentCandidate {
  const [evidence_depth, consistency, peer_verification, impact_signals] = base.dims;
  return {
    handle: base.handle,
    display_name: base.display_name,
    headline: base.headline,
    trust_score: {
      overall: base.overall,
      dimensions: { evidence_depth, consistency, peer_verification, impact_signals },
      delta: 0,
      updated_at: now,
    },
    capabilities: base.capabilities.map(([name, evidence_count, verified]) => ({
      name,
      evidence_count,
      verified,
    })),
    evidence_count: base.evidence_count,
    match_highlights: base.highlights,
    matched_signals: base.signals,
    is_shadow: true,
    discovery_source: "indexed",
    grad_year: base.grad_year,
    school: base.school,
    program: base.program,
    availability: base.availability,
    location: base.location,
    interests: base.interests,
  };
}

export const mockInterns: EarlyTalentCandidate[] = [
  make({
    handle: "aisha-ml",
    display_name: "Aisha Khan",
    headline: "Sophomore CS · applied ML & LLM tooling · hackathon regular",
    overall: 58,
    dims: [62, 71, 20, 55],
    evidence_count: 24,
    capabilities: [
      ["Python", 14, true],
      ["PyTorch", 8, true],
      ["LLM apps", 6, true],
      ["Data pipelines", 4, false],
    ],
    highlights: [
      "1st place, university AI hackathon (RAG study assistant)",
      "12 public repos, 40+ commits in the last 90 days",
      "Kaggle notebook with 300+ upvotes on time-series forecasting",
    ],
    signals: [
      { category: "capability", label: "Ships ML prototypes fast", detail: "3 hackathon projects with working demos", weight: 22 },
      { category: "evidence", label: "Consistent recent activity", detail: "Commits every week for 6 months", weight: 16 },
    ],
    grad_year: 2029,
    school: "MIT",
    program: "B.S. Computer Science",
    availability: "Summer 2027 internship",
    location: "Cambridge, MA",
    interests: ["ML infra", "Developer tools", "Applied research"],
  }),
  make({
    handle: "diego-rs",
    display_name: "Diego Fernández",
    headline: "Freshman · Rust & systems · open-source contributor",
    overall: 54,
    dims: [58, 66, 15, 52],
    evidence_count: 19,
    capabilities: [
      ["Rust", 11, true],
      ["C", 5, false],
      ["CLI tooling", 6, true],
      ["Concurrency", 3, false],
    ],
    highlights: [
      "5 merged PRs into a popular Rust CLI crate",
      "Maintains a small async runtime experiment (120 stars)",
      "Writes technical blog posts on memory safety",
    ],
    signals: [
      { category: "evidence", label: "Real OSS contributions", detail: "Merged PRs in maintained projects", source: "GitHub", weight: 20 },
      { category: "capability", label: "Systems depth for a freshman", detail: "Async runtime prototype", weight: 18 },
    ],
    grad_year: 2029,
    school: "UT Austin",
    program: "B.S. Computer Science",
    availability: "Summer 2027 / part-time",
    location: "Austin, TX",
    interests: ["Systems", "Compilers", "Performance"],
  }),
  make({
    handle: "mei-frontend",
    display_name: "Mei Lin",
    headline: "Sophomore · frontend & design systems · accessibility advocate",
    overall: 56,
    dims: [60, 68, 25, 50],
    evidence_count: 21,
    capabilities: [
      ["React", 12, true],
      ["TypeScript", 9, true],
      ["Design systems", 5, true],
      ["Accessibility", 4, true],
    ],
    highlights: [
      "Built the component library for her university's dev club site",
      "Speaker at a regional a11y meetup",
      "8 shipped side projects with live demos",
    ],
    signals: [
      { category: "capability", label: "Product-quality frontend", detail: "Reusable, accessible components", weight: 19 },
      { category: "peer", label: "Peer-vouched", detail: "Dev club lead attested to her work", weight: 12 },
    ],
    grad_year: 2029,
    school: "University of Waterloo",
    program: "BASc Software Engineering",
    availability: "Co-op — Winter 2027",
    location: "Waterloo, ON",
    interests: ["Design engineering", "Accessibility", "DX"],
  }),
  make({
    handle: "samuel-data",
    display_name: "Samuel Okoro",
    headline: "Freshman · backend & data · SQL and Go",
    overall: 49,
    dims: [52, 60, 12, 46],
    evidence_count: 15,
    capabilities: [
      ["Go", 7, true],
      ["PostgreSQL", 6, true],
      ["APIs", 5, false],
      ["Docker", 3, false],
    ],
    highlights: [
      "Built a REST API for a campus food-sharing app",
      "3 repos with tests and CI configured",
      "Answers backend questions on Stack Overflow",
    ],
    signals: [
      { category: "capability", label: "Solid fundamentals", detail: "APIs with tests + CI", weight: 15 },
      { category: "evidence", label: "Community participation", detail: "Stack Overflow answers", source: "Stack Overflow", weight: 10 },
    ],
    grad_year: 2029,
    school: "Georgia Tech",
    program: "B.S. Computer Science",
    availability: "Summer 2027 internship",
    location: "Atlanta, GA",
    interests: ["Backend", "Data engineering", "Fintech"],
  }),
  make({
    handle: "priya-mobile",
    display_name: "Priya Nair",
    headline: "Sophomore · mobile (Flutter) · 2 apps on the Play Store",
    overall: 57,
    dims: [61, 64, 22, 58],
    evidence_count: 20,
    capabilities: [
      ["Flutter", 10, true],
      ["Dart", 8, true],
      ["Firebase", 5, true],
      ["UI/UX", 4, false],
    ],
    highlights: [
      "2 published Flutter apps, 5k+ combined installs",
      "Won a national student app challenge",
      "Mentors juniors in her college coding club",
    ],
    signals: [
      { category: "impact", label: "Shipped to real users", detail: "5k+ installs across two apps", weight: 21 },
      { category: "capability", label: "End-to-end mobile", detail: "Design through release", weight: 17 },
    ],
    grad_year: 2029,
    school: "IIT Bombay",
    program: "B.Tech Computer Science",
    availability: "Summer 2027 internship",
    location: "Mumbai, IN",
    interests: ["Mobile", "Consumer apps", "EdTech"],
  }),
  make({
    handle: "lucas-cpp",
    display_name: "Lucas Weber",
    headline: "Freshman · C++ & graphics · game-jam finalist",
    overall: 51,
    dims: [55, 58, 14, 54],
    evidence_count: 16,
    capabilities: [
      ["C++", 9, true],
      ["OpenGL", 5, false],
      ["Game dev", 6, true],
      ["Math", 3, false],
    ],
    highlights: [
      "Finalist in an international 48-hour game jam",
      "Open-source 2D physics engine (early stage)",
      "Detailed devlog with 20+ entries",
    ],
    signals: [
      { category: "capability", label: "Low-level graphics", detail: "Physics engine from scratch", weight: 18 },
      { category: "evidence", label: "Documents his work", detail: "Consistent devlog", weight: 11 },
    ],
    grad_year: 2029,
    school: "TU Munich",
    program: "B.Sc. Informatics",
    availability: "Werkstudent / Summer 2027",
    location: "Munich, DE",
    interests: ["Graphics", "Game engines", "Simulation"],
  }),
  make({
    handle: "hana-fullstack",
    display_name: "Hana Sato",
    headline: "Sophomore · full-stack · builds tools for her community",
    overall: 60,
    dims: [64, 72, 28, 56],
    evidence_count: 26,
    capabilities: [
      ["TypeScript", 13, true],
      ["Next.js", 9, true],
      ["Node.js", 8, true],
      ["Community building", 5, true],
    ],
    highlights: [
      "Built and runs a scheduling tool used by 3 student orgs",
      "Organizes a 200-member campus dev community",
      "Steady GitHub activity for 2+ years",
    ],
    signals: [
      { category: "impact", label: "Tools people actually use", detail: "Adopted by 3 orgs", weight: 22 },
      { category: "peer", label: "Strong peer signal", detail: "Community organizer, well vouched", weight: 15 },
    ],
    grad_year: 2029,
    school: "University of Tokyo",
    program: "B.Eng. Information Science",
    availability: "Summer 2027 internship",
    location: "Tokyo, JP",
    interests: ["Full-stack", "Community tools", "Productivity"],
  }),
  make({
    handle: "emma-sec",
    display_name: "Emma Johansson",
    headline: "Freshman · security & CTF · top-100 national ranking",
    overall: 53,
    dims: [57, 62, 16, 57],
    evidence_count: 18,
    capabilities: [
      ["Security", 8, true],
      ["Python", 7, true],
      ["Reverse engineering", 5, false],
      ["Networking", 4, false],
    ],
    highlights: [
      "Top-100 finish in a national CTF",
      "Publishes writeups for solved challenges",
      "Reported a real bug via a bug-bounty program",
    ],
    signals: [
      { category: "capability", label: "Offensive security skill", detail: "CTF ranking + writeups", weight: 19 },
      { category: "evidence", label: "Responsible disclosure", detail: "Accepted bug-bounty report", weight: 14 },
    ],
    grad_year: 2029,
    school: "KTH Royal Institute",
    program: "B.Sc. Computer Science",
    availability: "Summer 2027 internship",
    location: "Stockholm, SE",
    interests: ["Security", "Appsec", "Infrastructure"],
  }),
];
