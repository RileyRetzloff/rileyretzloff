# Local development

```sh
npm run api    # terminal 1: the /api functions on http://localhost:3001
npm start      # terminal 2: ng serve on http://localhost:4200, proxies /api to :3001
```

Frontend-only work (blog, styling) just needs `npm start`. Restart it after
changing `.env.local`.

`scripts/dev-api.mjs` serves the `api/` folder with Vercel's file-based
routing (`api/recipes/[slug].js` → `/api/recipes/:slug`), so new endpoints
work locally without registering them anywhere. It restarts on file
changes. (`vercel dev` doesn't work here: Angular's Vite dev server breaks
behind its proxy.)

## Env vars

The API reads its config from `.env.local` (gitignored). Either
`vercel link && vercel env pull .env.local` to fetch the Development
values, or `cp .env.example .env.local` and fill it in.

`CLERK_PUBLISHABLE_KEY` decides which Clerk instance the site uses, for
both the frontend and the API (`scripts/build-env.mjs` bakes it into the
frontend before every start/build). Locally and on Vercel Preview use the
**development** instance's `pk_test` key, which works on any domain; only
Vercel Production gets `pk_live`, since the production instance is tied to
rileyretzloff.xyz. `RECIPE_CONTRIBUTORS` takes user IDs from the same
instance. No Clerk secret key is used anywhere.

Without a key, `npm start` still works; sign-in just won't.
