import type { Capability } from "@/lib/api";

/**
 * Deterministic role-strength inference.
 *
 * We no longer surface a raw "Trust Score" anywhere user-facing. Instead we
 * translate a person's verified capabilities into the engineering roles their
 * public work backs best. This is a pure, inspectable derivation (no LLM call,
 * same demo-safe spirit as lib/foresight.ts) so it renders identically on the
 * server (OG images) and the client.
 */

export type RoleTier = "Strong fit" | "Solid fit" | "Emerging";

export type RoleStrength = {
  role: string;
  /** 0–100, relative to the strongest matched archetype for this person. */
  strength: number;
  tier: RoleTier;
  /** Capabilities that drove the match, for optional tooltip/detail. */
  matched: string[];
};

type Archetype = { role: string; keywords: string[] };

// Ordered roughly by specificity; ties break toward the earlier entry.
const ARCHETYPES: Archetype[] = [
  {
    role: "Backend Engineer",
    keywords: [
      "backend", "api", "apis", "go", "golang", "node", "java", "spring",
      "postgres", "postgresql", "sql", "mysql", "mongodb", "redis", "grpc",
      "rest", "server", "database", "microservice", "microservices", "django",
      "rails", "fastapi", "express",
    ],
  },
  {
    role: "Frontend Engineer",
    keywords: [
      "frontend", "react", "vue", "angular", "svelte", "typescript",
      "javascript", "css", "tailwind", "html", "ui", "ux", "accessibility",
      "a11y", "web", "design system", "design systems", "figma",
    ],
  },
  {
    role: "Full-Stack Engineer",
    keywords: [
      "full-stack", "fullstack", "full stack", "prisma", "supabase",
      "firebase", "trpc", "remix", "meteor",
    ],
  },
  {
    role: "ML / AI Engineer",
    keywords: [
      "ml", "machine learning", "ai", "pytorch", "tensorflow", "keras", "llm",
      "llms", "nlp", "deep learning", "transformers", "scikit", "pandas",
      "numpy", "kaggle", "computer vision", "cv", "rag", "embeddings",
    ],
  },
  {
    role: "Data Engineer",
    keywords: [
      "data", "etl", "spark", "airflow", "warehouse", "bigquery", "snowflake",
      "dbt", "kafka", "pipeline", "pipelines", "analytics", "hadoop", "flink",
    ],
  },
  {
    role: "Mobile Engineer",
    keywords: [
      "mobile", "ios", "android", "swift", "swiftui", "kotlin", "flutter",
      "dart", "react native", "jetpack",
    ],
  },
  {
    role: "Systems / Infra Engineer",
    keywords: [
      "systems", "rust", "c", "c++", "cpp", "concurrency", "compiler",
      "compilers", "performance", "cli", "embedded", "networking",
      "distributed", "operating systems", "wasm",
    ],
  },
  {
    role: "DevOps / Platform Engineer",
    keywords: [
      "devops", "platform", "kubernetes", "k8s", "docker", "terraform", "aws",
      "gcp", "azure", "ci/cd", "ci", "cd", "infrastructure", "observability",
      "sre", "helm", "ansible",
    ],
  },
  {
    role: "Security Engineer",
    keywords: [
      "security", "appsec", "infosec", "reverse engineering", "ctf",
      "cryptography", "crypto", "pentest", "penetration", "vulnerability",
      "bug bounty", "malware",
    ],
  },
  {
    role: "Graphics / Game Engineer",
    keywords: [
      "graphics", "game", "gamedev", "opengl", "vulkan", "directx", "shaders",
      "simulation", "rendering", "physics", "unity", "unreal",
    ],
  },
];

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter(Boolean),
  );
}

type CapabilityLike = Pick<Capability, "name" | "evidence_count"> & {
  verified?: boolean;
};

/**
 * Rank the engineering roles a person is strongest for, from their
 * capabilities. `extraSignals` (e.g. backend-provided role_signals or
 * headline fragments) nudge the ranking with light weight when present.
 *
 * Returns up to `limit` roles, best first, each with a relative strength and
 * tier. Empty array when there's nothing to infer from.
 */
export function inferRoleStrengths(
  capabilities: CapabilityLike[] = [],
  extraSignals: string[] = [],
  limit = 3,
): RoleStrength[] {
  const terms: { tokens: Set<string>; raw: string; weight: number; name: string }[] = [];

  for (const cap of capabilities) {
    if (!cap?.name) continue;
    const weight = Math.max(1, cap.evidence_count || 1) * (cap.verified ? 1.4 : 1);
    terms.push({ tokens: tokenize(cap.name), raw: cap.name.toLowerCase(), weight, name: cap.name });
  }
  for (const sig of extraSignals) {
    if (!sig) continue;
    terms.push({ tokens: tokenize(sig), raw: sig.toLowerCase(), weight: 2, name: sig });
  }

  if (terms.length === 0) return [];

  const scored = ARCHETYPES.map((arch) => {
    let score = 0;
    const matched = new Set<string>();
    for (const term of terms) {
      const hit = arch.keywords.some((kw) =>
        kw.includes(" ") ? term.raw.includes(kw) : term.tokens.has(kw),
      );
      if (hit) {
        score += term.weight;
        matched.add(term.name);
      }
    }
    return { role: arch.role, score, matched: Array.from(matched) };
  }).filter((s) => s.score > 0);

  if (scored.length === 0) return [];

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0].score;

  return scored.slice(0, limit).map((s) => {
    const strength = Math.round(Math.min(100, 48 + (s.score / best) * 47));
    const tier: RoleTier =
      strength >= 80 ? "Strong fit" : strength >= 62 ? "Solid fit" : "Emerging";
    return { role: s.role, strength, tier, matched: s.matched.slice(0, 4) };
  });
}
