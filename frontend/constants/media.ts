/**
 * Externally-hosted media assets referenced by the app.
 *
 * NOTE: heroVideo is served from a CloudFront distribution that is not part of
 * Mercari's existing infrastructure. Using a new external host may require the
 * internal External Service Review before shipping to production.
 */
export const media = {
  heroVideo:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4",
} as const;
