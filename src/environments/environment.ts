// App-wide client configuration.
//
// clerkPublishableKey: the Clerk "publishable key" (pk_test_… / pk_live_…)
// from the Clerk dashboard (Configure → API keys). It is public by design —
// it ships in every visitor's browser bundle — so it is fine living in the
// repo. The Clerk SECRET key must never be here; it belongs in Vercel env
// vars for the /api functions only.
export const environment = {
  clerkPublishableKey: "pk_test_cG9wdWxhci1lc2NhcmdvdC0yNjc4LmNsZXJrLmFjY291bnRzLmRldiQ",
};
