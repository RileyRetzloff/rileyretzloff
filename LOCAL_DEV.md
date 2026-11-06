# Local development

```sh
npm run api    # terminal 1: the /api functions on http://localhost:3001
npm start      # terminal 2: ng serve on http://localhost:4200, proxies /api to :3001
```

Frontend-only work (blog, styling) just needs `npm start`.

`scripts/dev-api.mjs` serves the `api/` folder with Vercel's file-based
routing (`api/recipes/[slug].js` → `/api/recipes/:slug`), so new endpoints
work locally without registering them anywhere. It restarts on file
changes. (`vercel dev` doesn't work here: Angular's Vite dev server breaks
behind its proxy.)

## Env vars

The API reads its config from `.env.local` (gitignored). Either
`vercel link && vercel env pull .env.local` to fetch the Development
values, or `cp .env.example .env.local` and fill it in.

Local runs pair with Clerk's **development** instance: `ng serve` uses the
`pk_test` key from `src/environments/environment.development.ts`, so
`CLERK_PUBLISHABLE_KEY` must be that same key, and `RECIPE_CONTRIBUTORS`
needs your development-instance user ID. Production builds use the
`pk_live` key in `src/environments/environment.ts`. No Clerk secret key is
used anywhere.
