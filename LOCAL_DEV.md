# Local development

Running the full site locally takes two processes:

```sh
npm run api    # terminal 1: the /api functions, on http://localhost:3001
npm start      # terminal 2: ng serve, on http://localhost:4200
```

`ng serve` proxies `/api/*` to the API server (see
`src/proxy.conf.json`), so the app behaves exactly like production.
Frontend-only work (blog, styling) doesn't need the API server — just
`npm start`. If the API server isn't running, `/api` calls fail loudly
in the console instead of silently loading nothing.

Do **not** use `vercel dev` for this project: it runs `ng serve`
behind the Vercel proxy, and Angular's Vite-based dev server breaks
under it (`vite:import-analysis` errors on the generated index.html).
The API server (`scripts/dev-api.mjs`) mounts the exact same
`api/*.js` handlers Vercel runs in production, with zero dependencies.

## One-time setup: env values

The API functions read their configuration from environment variables
(full list in [`.env.example`](.env.example)). Locally they come from
a `.env.local` file in the repo root, which is gitignored. Two ways to
create it:

- **From Vercel** (if you have the CLI): `vercel link` once, then
  `vercel env pull .env.local` — fetches the Development-scope values
  from the dashboard (Project → Settings → Environment Variables).
- **By hand**: `cp .env.example .env.local` and fill in the values.

Either way, the local set must pair with the **development** Clerk
instance:

- `CLERK_PUBLISHABLE_KEY` = the **pk_test** key — it has to match the
  instance the local frontend signs into (see below), or token checks
  fail.
- `RECIPE_CONTRIBUTORS` = your **development instance** Clerk user ID
  (user IDs differ per instance; the `/recipes/new` page shows yours
  when you're signed in but not on the list).

## How the Clerk keys are wired

- `src/environments/environment.ts` — **production** key (`pk_live`).
  This is what `npm run build` ships. Don't hand-edit it to test locally.
- `src/environments/environment.development.ts` — **development** key
  (`pk_test`). Angular swaps it in automatically for the `development`
  build configuration (see `fileReplacements` in `angular.json`), which
  is what `ng serve` uses.
- The `/api` functions don't read either file — they read the
  `CLERK_PUBLISHABLE_KEY` env var and verify tokens against that
  instance's JWKS. That's why each context's env value has to match
  the frontend key used alongside it.

## Notes

- Local recipe writes go to whatever repo `GITHUB_RECIPES_REPO` names
  in your `.env.local`. Point it at a throwaway repo if you don't want
  test recipes on the live site.
- The Clerk **secret** key is never used anywhere in this project —
  frontend or backend.
