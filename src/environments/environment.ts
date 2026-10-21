// App-wide client configuration.
//
// clerkPublishableKey: the Clerk "publishable key" (pk_test_… / pk_live_…)
// from the Clerk dashboard (Configure → API keys). It is public by design —
// it ships in every visitor's browser bundle — so it is fine living in the
// repo. This is the PRODUCTION instance key (pk_live); the development
// instance's pk_test key belongs nowhere near the deployed site. The
// matching CLERK_PUBLISHABLE_KEY env var in Vercel must hold this same
// value — the /api functions use it to locate the instance's JWKS for
// token verification. (The Clerk SECRET key is never used anywhere in
// this project.)
export const environment = {
  clerkPublishableKey: "pk_live_Y2xlcmsucmlsZXlyZXR6bG9mZi54eXok",
};
