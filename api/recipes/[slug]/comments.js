// /api/recipes/<slug>/comments — read (public) and post (anyone, no account
// needed). Spam treatment mirrors the feedback box: honeypot field, length
// limits, per-IP rate limiting, and retries on write conflicts.

const { isConfigured } = require("../../_lib/github");
const store = require("../../_lib/recipes");

const MAX_NAME = 60;
const MAX_TEXT = 2000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const hitsByIp = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (hitsByIp.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  hits.push(now);
  hitsByIp.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

function newId() {
  return (
    "c_" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

module.exports = async function handler(req, res) {
  if (!isConfigured()) {
    return res.status(500).json({ ok: false, error: "not configured" });
  }
  const slug = req.query.slug;
  if (!store.isValidSlug(slug)) {
    return res.status(404).json({ ok: false, error: "recipe not found" });
  }
  try {
    if (req.method === "GET") {
      const { comments } = await store.readComments(slug);
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=15, stale-while-revalidate=60",
      );
      return res.status(200).json({ ok: true, comments });
    }

    if (req.method === "POST") {
      const body = req.body ?? {};
      const honeypot = typeof body.website === "string" ? body.website : "";
      // Honeypot: pretend everything is fine; no comment is saved.
      if (honeypot.trim().length > 0) {
        return res.status(200).json({ ok: true });
      }

      const name =
        typeof body.name === "string"
          ? body.name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME)
          : "";
      const text = typeof body.text === "string" ? body.text.trim() : "";
      if (text.length === 0) {
        return res.status(400).json({ ok: false, error: "comment is empty" });
      }
      if (text.length > MAX_TEXT) {
        return res.status(400).json({ ok: false, error: "comment is too long" });
      }
      if (isRateLimited(clientIp(req))) {
        return res
          .status(429)
          .json({ ok: false, error: "slow down a little" });
      }
      if (!(await store.readRecipe(slug))) {
        return res.status(404).json({ ok: false, error: "recipe not found" });
      }

      const comment = {
        id: newId(),
        name: name || "anonymous",
        text,
        createdAt: new Date().toISOString(),
      };

      // Read-modify-write with conflict retries: two people commenting at
      // the same moment shouldn't lose either comment.
      for (let attempt = 0; attempt < 3; attempt++) {
        const { comments, sha } = await store.readComments(slug);
        comments.push(comment);
        try {
          await store.putComments(
            slug,
            comments,
            sha,
            `comment on ${slug} by ${comment.name}`,
          );
          return res.status(201).json({ ok: true, comment });
        } catch (err) {
          if (err.status === 409 && attempt < 2) continue;
          throw err;
        }
      }
    }

    return res.status(405).json({ ok: false, error: "method not allowed" });
  } catch (err) {
    console.error("comments:", err.message);
    return res.status(500).json({ ok: false, error: "something went wrong" });
  }
};
