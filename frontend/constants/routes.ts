export const routes = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  signup: "/sign-up",
  login: "/sign-in",
  onboarding: "/onboarding",
  recruiterOnboarding: "/recruiter/onboarding",
  recruiterDashboard: "/recruiter/dashboard",
  passport: "/passport",
  dashboard: "/dashboard",
  settings: "/settings",
  admin: "/admin",
  docs: "/docs",
  sampleProfile: (handle: string) => `/${handle}`,
  claimSignup: (handle: string) => `/sign-up?claim=${handle}`,
  signInReturningTo: (returnTo: string | null | undefined) => {
    const target = safeReturnTo(returnTo);
    return target && !AUTH_PAGES.has(target)
      ? `/sign-in?${RETURN_TO_PARAM}=${encodeURIComponent(target)}`
      : "/sign-in";
  },
} as const;

export const RETURN_TO_PARAM = "redirect_url";

export const AUTH_PAGES = new Set(["/sign-in", "/sign-up", "/signup", "/login"]);

/** Rejects absolute/protocol-relative URLs so the param cannot drive an open redirect. */
export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

/** App routes that must not be treated as profile handles. */
export const reservedHandles = new Set([
  "dashboard",
  "onboarding",
  "recruiter",
  "passport",
  "settings",
  "admin",
  "sign-in",
  "sign-up",
  "signup",
  "login",
  "docs",
  "verify",
  "api",
]);

export const anchors = {
  features: "#features",
  howItWorks: "#how-it-works",
  pricing: "#pricing",
} as const;
