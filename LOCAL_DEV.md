# Local development

Two ways to run the site locally:

| Command | What you get |
| --- | --- |
| `npm start` | Frontend only (Angular dev server). Blog, about, and page shells work. Anything that calls `/api/*` — recipes, comments, feedback submit — does not. |
| `vercel dev` | Full stack: the Angular app **and** the `/api` functions, wired exactly like production. Use this for recipes/feedback work. (Run it directly — do NOT wrap it in an npm script named `dev`; the CLI invokes the project's dev script itself and recurses.) |

## One-time setup for `vercel dev`

1. Install the Vercel CLI: `npm i -g vercel`
2. From the repo root: `vercel link` (sign in, pick the existing project)
3. In the Vercel dashboard → Project → Settings → Environment Variables,
   add a **Development**-scoped value for every variable in
   [`.env.example`](.env.example). `vercel dev` injects the Development
   set automatically; no local `.env` file is needed.
   - `CLERK_PUBLISHABLE_KEY` under Development must be the **pk_test**
     key — it has to match the instance the local frontend signs into.
   - `RECIPE_CONTRIBUTORS` under Development needs your **development
     instance** Clerk user ID (user IDs differ per instance; the
     `/recipes/new` page shows yours when you're not on the list).

## How the Clerk keys are wired

- `src/environments/environment.ts` — **production** key (`pk_live`).
  This is what `npm run build` ships. Don't hand-edit it to test locally.
- `src/environments/environment.development.ts` — **development** key
  (`pk_test`). Angular swaps it in automatically for the `development`
  build configuration (see `fileReplacements` in `angular.json`), which
  is what `ng serve` uses.
- The `/api` functions don't read either file — they read the
  `CLERK_PUBLISHABLE_KEY` env var and verify tokens against that
  instance's JWKS. That's why each Vercel scope's value has to match
  the frontend key used in the same context.

## Notes

- Local recipe writes go to whatever repo the Development scope's
  `GITHUB_RECIPES_REPO` names. Point it at a throwaway repo if you
  don't want test recipes on the live site.
- The Clerk **secret** key is never used anywhere in this project —
  frontend or backend.
