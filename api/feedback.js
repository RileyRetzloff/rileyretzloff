// Anonymous feedback endpoint for rileyretzloff.xyz.
//
// Plain JavaScript on purpose: Vercel runs .js API functions directly with
// no compilation step, which removes the whole TypeScript build pipeline as
// a variable (the .ts version of this function kept crashing on invocation
// with FUNCTION_INVOCATION_FAILED while running fine locally).
//
// Saves each submission as a GitHub issue in a private repo. Needs two
// Vercel env vars: GITHUB_PSST_ISSUES_READWRITE_TOKEN (fine-grained PAT,
// Issues read/write on the feedback repo only) and GITHUB_PSST_ISSUES_REPO
// ("owner/repo", e.g. RileyRetzloff/psst).

const MAX_LENGTH = 5000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

// Best-effort in-memory rate limiting. Resets on cold start, which is fine:
// this is a backstop for floods, not a security boundary.
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
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }

  const body = req.body ?? {};
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const honeypot = typeof body.website === "string" ? body.website : "";

  // Honeypot: pretend everything is fine so bots never learn they were
  // caught. No issue is created.
  if (honeypot.trim().length > 0) {
    return res.status(200).json({ ok: true });
  }

  if (text.length === 0) {
    return res.status(400).json({ ok: false, error: "feedback is empty" });
  }
  if (text.length > MAX_LENGTH) {
    return res.status(400).json({ ok: false, error: "feedback is too long" });
  }

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({ ok: false, error: "slow down a little" });
  }

  const token = process.env.GITHUB_PSST_ISSUES_READWRITE_TOKEN;
  const repo = process.env.GITHUB_PSST_ISSUES_REPO; // "owner/repo"
  if (!token || !repo) {
    console.error("feedback: missing env configuration");
    return res.status(500).json({ ok: false, error: "not configured" });
  }

  const stamp = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const gh = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: `feedback · ${stamp}`, body: text }),
  });

  if (!gh.ok) {
    // Never log the token or the response body (it could echo it back).
    console.error(`feedback: github api returned ${gh.status}`);
    return res.status(502).json({ ok: false, error: "could not save feedback" });
  }

  return res.status(200).json({ ok: true });
}
