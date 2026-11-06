# rileyretzloff.xyz

Riley's personal site: Angular 22 SPA (client-rendered) + a few Vercel
serverless functions. Deployed on Vercel from `master`.

## Commands

- `npm start`: dev server on :4200 (also regenerates blog posts)
- `npm run api`: local /api server on :3001 (needs `.env.local`, see LOCAL_DEV.md)
- `npm run build`, `npm run lint`

Run `npm run build` and `npm run lint` before committing. There's no real
test suite (`src/app/app.spec.ts` is the stale CLI default).

## Layout

- `src/app/`: one folder per page/feature; standalone components, signals,
  separate `.html` templates, Tailwind classes. Shared styles (`.btn`,
  `.form-input`, `.markdown`, ...) live in `src/styles.css`.
- `posts/*.md`: blog posts. `scripts/build-posts.mjs` renders them into
  `src/app/blog/posts.generated.ts` (gitignored) before start/build/test.
- `api/`: Vercel functions, plain CommonJS `.js` (no build step, on purpose).
  `api/_lib/` holds shared code (Vercel doesn't route `_`-prefixed paths):
  - `http.js`: `route({ GET, POST, ... })` wraps every handler. Throw
    `HttpError(status, message)` for client errors; errors are `{ error }`.
  - `auth.js`: Clerk JWT verification with no SDK (JWKS from the instance
    host encoded in the publishable key). `requireContributor(req)`.
  - `github.js`: tiny GitHub REST client. `recipes.js`: recipe/comment
    storage as files in a private GitHub repo.
- `scripts/dev-api.mjs`: local stand-in for Vercel's runtime.

## Conventions

- Prefer fixing root causes over workarounds; keep code small and plain.
  This codebase was cleaned up once already after piling on workarounds.
- Frontend data: `httpResource` for reads (check `.error()`/`.hasValue()`
  before `.value()`, which throws in the error state), `HttpClient` for
  writes. Route params arrive as component `input()`s
  (`withComponentInputBinding`). Form fields: `[(ngModel)]` on signals.
- `clerkTokenInterceptor` attaches the Clerk session token to every /api
  request; `Session` (`src/app/auth/session.ts`) exposes `contributor`.
- Clerk is initialized in the background (see `app.config.ts`), so never
  assume it's loaded: read `ClerkService` signals, or use `canActivateClerk`.
- Blog HTML is trusted (Riley's own files, `bypassSecurityTrustHtml`);
  recipe markdown is user-written and must stay sanitized.
- GET responses for recipes are CDN-cached (`s-maxage`), so after a write,
  update local state rather than refetching.
- Env vars: documented in `.env.example`; add new ones there.
- Keep Riley's lowercase, casual UI copy as is.
