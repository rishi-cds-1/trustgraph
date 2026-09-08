import type {
  ArchitectureLayer,
  EvidenceItem,
  HowItWorksStep,
  LandingStat,
  NavLink,
  PricingTier,
  PrincipleCard,
  ProblemCard,
  ScoreSignal,
  Testimonial,
} from "@/types/trust";
import { lottieAssets } from "@/constants/lottie";

export const navLinks: NavLink[] = [
  { href: "#problem", label: "Why TrustGraph" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export const heroContent = {
  badge: "AI Yogen hackathon prototype · Evidence-first recruiting",
  titleLine1: "Turn your work",
  titleLine2: "into proof.",
  subhead: "Evidence over resumes. Signal over noise.",
  claimCta: "Claim this profile",
  dashboardCta: "Go to your dashboard",
  secondaryCta: "View sample evidence brief",
  proofLine: "Public sources only. Analysis requires consent. AI organizes evidence; people make decisions.",
};

export const stats: LandingStat[] = [
  { value: 4200, suffix: "+", label: "Profiles", icon: "users", glyph: "#" },
  { value: 840, suffix: "K+", label: "Evidence items", icon: "files", glyph: "*" },
  { value: 63, label: "Countries", icon: "globe", glyph: "@" },
  { value: 60, prefix: "<", suffix: "s", label: "Time to score", icon: "timer", format: "text", glyph: "<" },
];

export const platformLogos = [
  "GitHub",
  "Stack Overflow",
  "Devpost",
  "LinkedIn",
  "Google Scholar",
  "arXiv",
  "Sessionize",
  "Devfolio",
  "Conference talks",
];

export const passportDemo = {
  label: "Evidence Brief",
  title: "One brief that shows what a candidate has actually built.",
  body: "Give it a public GitHub profile and a role's requirements. It organizes merged PRs, shipped repos, and real activity into a brief a recruiter can read in minutes — every line links back to the source.",
  bullets: [
    "Evidence pulled from GitHub — repos, PRs, real activity",
    "Matched against the specific role's requirements",
    "Every card links to the original public source",
    "Flags what's missing instead of guessing",
  ],
  cta: "Analyze a GitHub profile",
  exampleLink: "View sample evidence brief",
  profile: {
    name: "Rishi Paul",
    handle: "rishicds",
    url: "trustgraph.com/rishicds",
  },
};

export const passportTechAreas: string[] = ["Backend systems", "API design", "Open source", "CI/CD"];

export const passportEvidence: EvidenceItem[] = [
  { source: "github", label: "88 merged pull requests", verified: true, sourceLabel: "GitHub" },
  { source: "github", label: "37 public repositories", verified: true, sourceLabel: "GitHub" },
  { source: "stackoverflow", label: "2 accepted answers", verified: true, sourceLabel: "SO" },
];

export const problemSection = {
  label: "The problem",
  title: "Your reputation is trapped. Every platform is an island.",
};

export const problemCards: ProblemCard[] = [
  {
    icon: "search",
    title: "For Recruiters",
    description:
      "Keyword-matching and vibes-based shortlisting. No way to distinguish a real builder from a polished CV optimizer.",
    quote: "I spend 3 hours verifying what should be a 30-second check.",
  },
  {
    icon: "rocket",
    title: "For Founders & Open Source",
    description:
      "Evaluating a co-founder or contributor beyond LinkedIn is guesswork. Fake contributors degrade community health.",
    quote: "We got burned by someone whose GitHub was all green squares — none of it was real work.",
  },
  {
    icon: "briefcase",
    title: "For Freelancers",
    description:
      "Five years of five-star reviews on one platform earns zero credibility on the next. Reputation cannot move with you.",
    quote: "I rebuilt my reputation from scratch three times. It's exhausting.",
  },
];

export const architectureSection = {
  label: "Architecture",
  title: "Four layers of verifiable trust.",
};

export const architectureLayers: ArchitectureLayer[] = [
  {
    index: "01",
    title: "Capability",
    body: "Skills inferred from evidence — never self-assessed. If you've shipped it, it shows.",
    accent: true,
  },
  {
    index: "02",
    title: "Evidence",
    body: "240 merged PRs. 37 repos. 4 talks. 3 wins. The record is the profile.",
  },
  {
    index: "03",
    title: "Consistency",
    body: "Sustained effort across years weighs more than recent bursts. The anti-gaming layer.",
  },
  {
    index: "04",
    title: "Evidence Brief",
    body: "Explainable, not black-box. Every requirement match has a reason linked to a source.",
  },
];

export const howItWorksSection = {
  label: "How it works",
  title: "Evidence, organized in under 60 seconds.",
  subtitle: "No forms. No tests.",
};

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: "01",
    title: "Connect sources",
    body: "Link GitHub, Stack Overflow, or Devpost. We pull public evidence automatically.",
    time: "<30 seconds",
    icon: "connect",
    lottie: lottieAssets.onboardingConnect,
  },
  {
    step: "02",
    title: "We collect evidence",
    body: "Merged PRs, accepted answers, hackathon wins — every item links to proof.",
    time: "Automatic",
    icon: "collect",
    lottie: lottieAssets.onboardingEvidence,
  },
  {
    step: "03",
    title: "Share your passport",
    body: "One link to send anywhere you'd share a résumé or portfolio.",
    time: "5 seconds",
    icon: "share",
    lottie: lottieAssets.onboardingPassport,
  },
];

export const testimonialsSection = {
  label: "Social proof",
  title: "Builders who claimed their passport.",
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "I sent my TrustGraph link instead of a résumé. The recruiter replied in 2 hours. That never happens.",
    boldPhrase: "That never happens.",
    name: "Arjun Krishnan",
    role: "Full-stack",
    city: "Bangalore",
    initials: "AK",
  },
  {
    quote: "The evidence brief tells me everything about a contributor's work in 10 seconds.",
    boldPhrase: "in 10 seconds.",
    name: "Sara Müller",
    role: "OSS maintainer",
    city: "Berlin",
    initials: "SM",
  },
  {
    quote:
      "For the first time I have something that shows the whole picture — not just whatever slice each platform saw.",
    boldPhrase: "shows the whole picture",
    name: "Priya Chandran",
    role: "Independent dev",
    city: "Mumbai",
    initials: "PC",
  },
];

export const scoreExplainerSection = {
  label: "Explainability",
  title: "Every match has a reason, linked to a source.",
  subtitle: "No black boxes — ever.",
  rightTitle: "You can see exactly why, every time.",
  rightBody:
    "Every signal in the brief is listed, linked, and disputable. Strong matches and gaps are both visible — so recruiters know what's confirmed and what still needs a human conversation.",
};

export const scoreSignals: ScoreSignal[] = [
  { positive: true, text: "88 merged PRs on GitHub", points: 0 },
  { positive: true, text: "Active since 2021, no gap >60d", points: 0 },
  { positive: true, text: "3 hackathon wins on Devpost", points: 0 },
  { positive: true, text: "Stars from non-followers", points: 0 },
  { positive: false, text: "2 listed projects, no public repo — requires confirmation", points: 0 },
  { positive: false, text: "Peer verification pending", points: 0 },
];

export const scoreComparison = {
  headers: ["", "Evidence-linked", "Reviewed by a person", "Portable", "Disputable"],
  rows: [
    { name: "TrustGraph evidence brief", values: ["✓", "✓", "✓", "✓"], highlight: true },
    { name: "Résumé keyword match", values: ["✗", "~", "✓", "✗"] },
    { name: "LinkedIn profile", values: ["✗", "~", "~", "✗"] },
    { name: "Recruiter gut-check", values: ["✗", "✓", "✗", "~"] },
  ],
};

export const integrationSection = {
  label: "Integrations",
  title: "Connected to where your work already lives.",
  body: "Every source connects once. Evidence updates automatically.",
  bullets: [
    "GitHub repos, PRs, and languages sync on connect",
    "Stack Overflow answers and reputation indexed",
    "Devpost wins and hackathon projects added",
    "Manual claims for talks and publications with URLs",
  ],
  cta: "Connect your first source",
  lottie: lottieAssets.onboardingConnect,
};

export const integrationInnerOrbit = ["GitHub", "Stack Overflow", "Devpost"];
export const integrationOuterOrbit = ["LinkedIn", "Google Scholar", "arXiv", "Sessionize"];

export const pricingSection = {
  label: "Business vision",
  title: "From recruiting evidence to portable professional trust",
  subtitle:
    "The recruiting assistant is TrustGraph's starting wedge, not its complete business. Individuals build and control evidence-backed professional profiles for free. Organizations pay for role-specific evidence research, verification workflows, and integrations. Over time, the profile becomes a portable professional trust layer that helps demonstrated skills circulate between opportunities.",
};

export const pricingTagline = pricingSection.subtitle;

export const pricingTiers: PricingTier[] = [
  {
    name: "Free for individuals",
    price: "$0",
    description: "Every builder owns their evidence record, for free, forever.",
    features: [
      "Candidate-owned evidence passport",
      "Public professional source integrations",
      "Correction and attribution controls",
      "Visibility settings",
      "Portable profile",
    ],
    ctaLabel: "Analyze a GitHub profile",
  },
  {
    name: "Paid for organizations",
    price: "Contact sales",
    description: "Recruiting teams get evidence briefs at hiring volume, plus workflow tooling.",
    features: [
      "Role-specific evidence research",
      "Candidate evidence briefs",
      "Interview preparation",
      "Verification workflows",
      "ATS/workflow integrations",
      "Evidence API",
    ],
    featured: true,
    dark: true,
    contactSales: true,
    ctaLabel: "Contact sales",
  },
];

export const whyMercariSection = {
  label: "Why Mercari?",
  title: "Why we built this at Mercari",
  paragraphs: [
    "Mercari has spent more than a decade reducing uncertainty between unfamiliar people through identity, reputation, safety, and human-centered marketplace design. TrustGraph applies that expertise to another form of value: demonstrated professional skill.",
    "Mercari made it possible for anyone to turn unused possessions into value. TrustGraph explores whether Mercari can also help people turn demonstrated skills into opportunity.",
  ],
};

export const faqSection = {
  label: "FAQ",
  title: "Common questions",
  items: [
    {
      question: "Does TrustGraph replace recruiters?",
      answer:
        "No. TrustGraph organizes public evidence and prepares context. Recruiters and hiring managers define the criteria, interpret the evidence, conduct interviews, and make every decision.",
    },
    {
      question: "Does TrustGraph decide whom to hire?",
      answer:
        "No. It does not produce hire/reject recommendations. It shows evidence, sources, uncertainty, and areas requiring confirmation.",
    },
    {
      question: "What if public evidence is missing?",
      answer:
        "Missing public evidence is not evidence that a person lacks a capability. Private work, team contributions, and production impact may not be visible publicly.",
    },
    {
      question: "Can people correct their profiles?",
      answer:
        "The product is designed to support identity confirmation, source inspection, correction requests, and removal of incorrectly attributed evidence.",
    },
    {
      question: "Is this Mercari Hallo again?",
      answer:
        "Mercari Hallo matched people with shifts and operated employment transactions. TrustGraph creates portable, evidence-backed professional identity. It does not list jobs, process applications, schedule work, set wages, or make hiring decisions.",
    },
    {
      question: "What is the business?",
      answer:
        "The recruiting assistant is the initial wedge. The long-term business is trusted professional identity: individuals control portable evidence profiles, while organizations pay for evidence research, verification, and workflow integrations.",
    },
  ],
};

export const principlesSection = {
  label: "Principles",
  title: "How we earn your trust.",
};

export const principleCards: PrincipleCard[] = [
  {
    lottie: lottieAssets.principlesLock,
    title: "Users first, recruiters second",
    body: "You choose who can discover you. Recruiter discovery requires your explicit opt-in. Payment never changes your score.",
  },
  {
    lottie: lottieAssets.principlesOpenBook,
    title: "No black boxes, ever",
    body: "Every signal affecting your score is listed, linked, and disputable. Human review within 48 hours of any dispute.",
  },
  {
    lottie: lottieAssets.principlesExitDoor,
    title: "Your data, your exit",
    body: "Delete your account and your profile disappears within 30 days. We don't sell raw evidence data. Disconnect any source at any time.",
  },
];

export const finalCta = {
  titleLine1: "Your proof of work",
  titleLine2: "deserves to move with you.",
  subtitle:
    "Claim your Trust Passport in under 60 seconds. No forms. No tests. Just evidence.",
  primaryCta: "Claim your passport",
  secondaryCta: "See a live example",
  proofLine: "Free forever · trustgraph.com/you",
  lottie: lottieAssets.onboardingPassport,
};

export const footerContent = {
  tagline: "Portable, evidence-backed reputation for builders.",
  productLinks: [
    { href: "#problem", label: "Why TrustGraph" },
    { href: "#passport", label: "Trust Passport" },
    { href: "#architecture", label: "Architecture" },
    { href: "#pricing", label: "Pricing" },
  ],
  developerLinks: [
    { href: "/docs", label: "API & Badges" },
    { href: "/docs", label: "Documentation" },
    { href: "https://github.com", label: "GitHub" },
    { href: "#", label: "Changelog" },
  ],
  companyLinks: [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
    { href: "#", label: "Blog" },
    { href: "#", label: "Contact" },
  ],
  pills: ["Evidence-first", "Privacy-safe", "No black boxes"],
};
