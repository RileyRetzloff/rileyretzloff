// Development-only app configuration.
//
// Angular swaps this file in for environment.ts in the "development"
// build configuration (see fileReplacements in angular.json), which is
// what `ng serve` and `npm run watch` use. Production builds always use
// environment.ts (the pk_live key).
//
// This key is the Clerk DEVELOPMENT instance's publishable key (pk_test).
// The dev instance is the one that tolerates localhost. Publishable keys
// are public by design, so this is fine in the repo — but it must never
// be the key a production build ships.
export const environment = {
  clerkPublishableKey: "pk_test_cG9wdWxhci1lc2NhcmdvdC0yNjc4LmNsZXJrLmFjY291bnRzLmRldiQ",
};
