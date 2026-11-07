// Local stand-in for Vercel's serverless runtime: serves the api/ folder on
// http://localhost:3001 with Vercel's file-based routing, and `ng serve`
// proxies /api to it (src/proxy.conf.json). Not used in production.
//
// Run with `npm run api`, which loads env vars from .env.local.

import { createServer } from "node:http";
import { existsSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const API_DIR = join(import.meta.dirname, "..", "api");

// /api/recipes/pie/comments -> api/recipes/[slug]/comments.js, { slug: "pie" }
function resolve(pathname) {
  const segments = pathname.split("/").filter(Boolean).slice(1);
  const query = {};
  let path = API_DIR;
  for (const [i, segment] of segments.entries()) {
    const last = i === segments.length - 1;
    if (segment.startsWith("_")) return null;
    const exact = join(path, last ? `${segment}.js` : segment);
    if (existsSync(exact)) {
      path = exact;
      continue;
    }
    // Dynamic segment: a "[param].js" file or "[param]" folder.
    const pattern = last ? /^\[(\w+)\]\.js$/ : /^\[(\w+)\]$/;
    const dynamic = readdirSync(path).find((name) => pattern.test(name));
    if (!dynamic) return null;
    path = join(path, dynamic);
    query[dynamic.match(pattern)[1]] = decodeURIComponent(segment);
  }
  return path.endsWith(".js") ? { file: path, query } : null;
}

// The few Vercel request/response helpers the handlers use.
async function adapt(req, res, query) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    req.body = raw ? JSON.parse(raw) : undefined;
  } catch {
    req.body = raw;
  }
  req.query = { ...Object.fromEntries(new URL(req.url, "http://x").searchParams), ...query };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
}

const port = Number(process.env.API_PORT ?? 3001);

createServer(async (req, res) => {
  const route = resolve(new URL(req.url, "http://x").pathname);
  if (!route) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: `no api route for ${req.url}` }));
  }
  await adapt(req, res, route.query);
  await require(route.file)(req, res);
}).listen(port, () => console.log(`api: http://localhost:${port}`));
