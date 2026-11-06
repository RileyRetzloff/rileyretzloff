// Plumbing shared by every /api function.

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Builds a handler from one function per HTTP method. Handlers signal
// client errors by throwing HttpError; anything else is logged and becomes
// a 500. Error responses are always `{ error: "<message>" }`.
function route(handlers) {
  return async function handler(req, res) {
    const handle = handlers[req.method];
    if (!handle) {
      res.setHeader("Allow", Object.keys(handlers).join(", "));
      return res.status(405).json({ error: "method not allowed" });
    }
    try {
      await handle(req, res);
    } catch (err) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
      }
      console.error(`${req.method} ${req.url}:`, err.message);
      return res.status(500).json({ error: "something went wrong" });
    }
  };
}

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`missing env var ${name}`);
  return value;
}

/** Trimmed single-line string, or "" if the value isn't a string. */
function line(value, maxLength) {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

/** Trimmed multi-line text; throws a 400 if it's empty or too long. */
function text(value, maxLength, what) {
  const result = typeof value === "string" ? value.trim() : "";
  if (!result) throw new HttpError(400, `${what} is empty`);
  if (result.length > maxLength) throw new HttpError(400, `${what} is too long`);
  return result;
}

// Forms carry a hidden "website" field. Humans never see it; bots fill it.
function isBot(body) {
  return typeof body?.website === "string" && body.website.trim() !== "";
}

// Best-effort per-IP rate limiting. In-memory, so it resets on cold start:
// a backstop for floods, not a security boundary.
function rateLimiter({ max, windowMs }) {
  const hitsByIp = new Map();
  return function isRateLimited(req) {
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      String(forwarded ?? "").split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const now = Date.now();
    const hits = (hitsByIp.get(ip) ?? []).filter((t) => now - t < windowMs);
    hits.push(now);
    hitsByIp.set(ip, hits);
    return hits.length > max;
  };
}

module.exports = { HttpError, route, env, line, text, isBot, rateLimiter };
