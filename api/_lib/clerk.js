// Clerk session-token verification for the /api functions, zero dependencies:
// the token is an RS256 JWT whose public keys live at the Clerk instance's
// JWKS endpoint. The instance host is decoded from the publishable key (it is
// base64 of "<host>$"), so no secret key is needed on the server at all.
//
// Env vars (set in the Vercel dashboard):
//   CLERK_PUBLISHABLE_KEY — the same pk_test_…/pk_live_… value the frontend
//                           uses (public by design, safe as a server env var)
//   RECIPE_CONTRIBUTORS   — comma-separated Clerk user IDs allowed to
//                           create/edit/delete recipes

const crypto = require("node:crypto");

const JWKS_TTL_MS = 10 * 60 * 1000;
let jwksCache = { keys: null, fetchedAt: 0 };

function frontendApiHost() {
  const pk = process.env.CLERK_PUBLISHABLE_KEY;
  if (!pk) return null;
  const match = pk.match(/^pk_(?:test|live)_(.+)$/);
  if (!match) return null;
  try {
    return Buffer.from(match[1], "base64").toString("utf8").replace(/\$$/, "");
  } catch {
    return null;
  }
}

async function getJwks(host) {
  const now = Date.now();
  if (jwksCache.keys && now - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys;
  }
  const res = await fetch(`https://${host}/.well-known/jwks.json`);
  if (!res.ok) throw new Error(`jwks fetch -> ${res.status}`);
  const data = await res.json();
  jwksCache = { keys: data.keys || [], fetchedAt: now };
  return jwksCache.keys;
}

function b64urlJson(segment) {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

async function verifyToken(token) {
  const host = frontendApiHost();
  if (!host || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerSeg, payloadSeg, signatureSeg] = parts;

  let header, payload;
  try {
    header = b64urlJson(headerSeg);
    payload = b64urlJson(payloadSeg);
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || !header.kid) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp < nowSec - 60) return null;
  if (payload.iss !== `https://${host}`) return null;

  const keys = await getJwks(host);
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;

  const key = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const signed = Buffer.from(`${headerSeg}.${payloadSeg}`);
  const signature = Buffer.from(signatureSeg, "base64url");
  if (!crypto.verify("RSA-SHA256", signed, key, signature)) return null;
  return payload;
}

function contributorIds() {
  return (process.env.RECIPE_CONTRIBUTORS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Never throws: any problem (no token, bad token, JWKS unreachable) just
// means "not signed in". Routes that require auth turn that into a 401.
async function getAuth(req) {
  const anonymous = { signedIn: false, contributor: false, userId: null };
  try {
    const header = req.headers["authorization"];
    if (typeof header !== "string") return anonymous;
    const match = header.match(/^Bearer (.+)$/);
    if (!match) return anonymous;
    const payload = await verifyToken(match[1]);
    if (!payload || !payload.sub) return anonymous;
    return {
      signedIn: true,
      userId: payload.sub,
      contributor: contributorIds().includes(payload.sub),
    };
  } catch (err) {
    console.error("clerk verify:", err.message);
    return anonymous;
  }
}

module.exports = { getAuth };
