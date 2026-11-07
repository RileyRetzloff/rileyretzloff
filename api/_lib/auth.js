// Clerk session-token verification, no SDK and no secret key. Session
// tokens are RS256 JWTs signed by the Clerk instance; the instance's host is
// encoded in its publishable key (base64 of "<host>$"), and its public keys
// are at https://<host>/.well-known/jwks.json.
//
// Env: CLERK_PUBLISHABLE_KEY (same value as the frontend's), and
// RECIPE_CONTRIBUTORS (comma-separated Clerk user IDs who may edit recipes).

const crypto = require("node:crypto");
const { HttpError, env } = require("./http");

const JWKS_TTL_MS = 10 * 60 * 1000;
let jwks = { keys: [], fetchedAt: 0 };

function clerkHost() {
  const encoded = env("CLERK_PUBLISHABLE_KEY").replace(/^pk_(test|live)_/, "");
  return Buffer.from(encoded, "base64").toString("utf8").replace(/\$$/, "");
}

async function publicKey(host, kid) {
  if (Date.now() - jwks.fetchedAt > JWKS_TTL_MS) {
    const res = await fetch(`https://${host}/.well-known/jwks.json`);
    if (!res.ok) throw new Error(`jwks fetch -> ${res.status}`);
    jwks = { keys: (await res.json()).keys ?? [], fetchedAt: Date.now() };
  }
  const jwk = jwks.keys.find((k) => k.kid === kid);
  return jwk && crypto.createPublicKey({ key: jwk, format: "jwk" });
}

const decode = (segment) => JSON.parse(Buffer.from(segment, "base64url"));

/** The verified token payload, or null if the token isn't valid. */
async function verify(token) {
  const [header, payload, signature] = token.split(".");
  if (!signature) return null;
  let claims;
  let kid;
  try {
    const head = decode(header);
    if (head.alg !== "RS256") return null;
    kid = head.kid;
    claims = decode(payload);
  } catch {
    return null;
  }
  const host = clerkHost();
  const now = Date.now() / 1000;
  if (claims.iss !== `https://${host}` || !(claims.exp > now - 60)) return null;

  const key = await publicKey(host, kid);
  const signed = Buffer.from(`${header}.${payload}`);
  const valid =
    key &&
    crypto.verify("RSA-SHA256", signed, key, Buffer.from(signature, "base64url"));
  return valid ? claims : null;
}

/** Who's calling. Missing or invalid tokens just mean "signed out". */
async function getAuth(req) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const claims = token ? await verify(token) : null;
  const userId = claims?.sub ?? null;
  const contributors = (process.env.RECIPE_CONTRIBUTORS ?? "").split(",");
  return {
    signedIn: userId !== null,
    userId,
    contributor: userId !== null && contributors.map((id) => id.trim()).includes(userId),
  };
}

async function requireContributor(req) {
  const auth = await getAuth(req);
  if (!auth.signedIn) throw new HttpError(401, "sign in required");
  if (!auth.contributor) throw new HttpError(403, "not a contributor");
  return auth;
}

module.exports = { getAuth, requireContributor };
