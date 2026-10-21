// Local development server for the /api functions — plain Node, zero
// dependencies. NOT used in production (Vercel runs api/*.js as
// serverless functions there).
//
// Why this exists: `vercel dev` runs `ng serve` behind its proxy, and
// Angular's Vite-based dev server chokes on that (vite:import-analysis
// errors on the generated index.html). So instead: this server mounts
// the same handlers on http://localhost:3001, and `ng serve` proxies
// /api/* to it (see src/proxy.conf.json). Run both:
//
//   npm run api     # this server, terminal 1
//   npm start       # ng serve, terminal 2
//
// Env vars are read from .env.local (then .env) in the repo root —
// fill one from .env.example, or run `vercel env pull .env.local`
// to fetch the Development-scope values from Vercel.

import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// --- minimal .env loader (KEY=VALUE, # comments, optional quotes) ---
function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnvFile(join(root, ".env.local"));
loadEnvFile(join(root, ".env"));

// --- routes: same shapes Vercel derives from the api/ file layout ---
const routes = [
  { pattern: /^\/api\/feedback$/, handler: require(join(root, "api/feedback.js")) },
  { pattern: /^\/api\/me$/, handler: require(join(root, "api/me.js")) },
  { pattern: /^\/api\/recipes$/, handler: require(join(root, "api/recipes.js")) },
  {
    pattern: /^\/api\/recipes\/([^/]+)\/comments$/,
    handler: require(join(root, "api/recipes/[slug]/comments.js")),
    slugFrom: 1,
  },
  {
    pattern: /^\/api\/recipes\/([^/]+)$/,
    handler: require(join(root, "api/recipes/[slug].js")),
    slugFrom: 1,
  },
];

// Adapt a Node request/response to the (req, res) shape the handlers
// were written for on Vercel: req.body (parsed JSON), req.query
// (query string + route params), res.status(code).json(obj).
async function dispatch(route, match, req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  let body = {};
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = {};
    }
  }
  req.body = body;
  req.query = Object.fromEntries(new URL(req.url, "http://localhost").searchParams);
  if (route.slugFrom) req.query.slug = decodeURIComponent(match[route.slugFrom]);

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    if (!res.headersSent) res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(obj));
    return res;
  };

  await route.handler(req, res);
}

const port = Number(process.env.API_PORT || 3001);
createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  for (const route of routes) {
    const match = pathname.match(route.pattern);
    if (!match) continue;
    try {
      await dispatch(route, match, req, res);
    } catch (err) {
      console.error(`dev-api: ${req.method} ${pathname} failed:`, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: false, error: "local dev server error" }));
      }
    }
    return;
  }
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: false, error: "no such /api route (local dev server)" }));
}).listen(port, () => {
  console.log(`api dev server listening on http://localhost:${port}`);
});
